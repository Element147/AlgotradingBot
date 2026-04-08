package com.algotrader.bot.marketdata.application.service;

import com.algotrader.bot.backtest.domain.model.OHLCVData;
import com.algotrader.bot.backtest.infrastructure.persistence.entity.BacktestDataset;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataImportJob;
import com.algotrader.bot.marketdata.infrastructure.persistence.repository.MarketDataImportJobRepository;
import com.algotrader.bot.shared.application.service.SymbolCsvSupport;
import com.algotrader.bot.system.application.service.OperatorAuditService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketDataImportExecutionService {

    private static final Set<MarketDataImportJobStatus> READY_STATUSES = Set.of(
        MarketDataImportJobStatus.QUEUED,
        MarketDataImportJobStatus.WAITING_RETRY
    );
    private static final long WORK_SLICE_SECONDS = 20;

    private final MarketDataImportJobRepository marketDataImportJobRepository;
    private final MarketDataProviderRegistry marketDataProviderRegistry;
    private final MarketDataSessionFilter marketDataSessionFilter;
    private final MarketDataDatasetIngestionService marketDataDatasetIngestionService;
    private final OperatorAuditService operatorAuditService;
    private final MarketDataImportProgressService marketDataImportProgressService;
    private final SymbolCsvSupport symbolCsvSupport;
    private final Set<Long> locallyDispatchedJobIds = ConcurrentHashMap.newKeySet();

    public MarketDataImportExecutionService(MarketDataImportJobRepository marketDataImportJobRepository,
                                            MarketDataProviderRegistry marketDataProviderRegistry,
                                            MarketDataSessionFilter marketDataSessionFilter,
                                            MarketDataDatasetIngestionService marketDataDatasetIngestionService,
                                            OperatorAuditService operatorAuditService,
                                            MarketDataImportProgressService marketDataImportProgressService,
                                            SymbolCsvSupport symbolCsvSupport) {
        this.marketDataImportJobRepository = marketDataImportJobRepository;
        this.marketDataProviderRegistry = marketDataProviderRegistry;
        this.marketDataSessionFilter = marketDataSessionFilter;
        this.marketDataDatasetIngestionService = marketDataDatasetIngestionService;
        this.operatorAuditService = operatorAuditService;
        this.marketDataImportProgressService = marketDataImportProgressService;
        this.symbolCsvSupport = symbolCsvSupport;
    }

    @Async("virtualThreadTaskExecutor")
    public CompletableFuture<Void> processJobAsync(Long jobId) {
        if (!locallyDispatchedJobIds.add(jobId)) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            processJob(jobId);
        } finally {
            locallyDispatchedJobIds.remove(jobId);
        }
        return CompletableFuture.completedFuture(null);
    }

    public void processJob(Long jobId) {
        MarketDataImportJob job = markRunning(jobId);
        if (job == null) {
            return;
        }

        try {
            runWorkSlice(job);
        } catch (MarketDataRetryableException exception) {
            updateRetry(jobId, exception.getRetryAt(), exception.getMessage());
        } catch (Exception exception) {
            markFailed(jobId, exception.getMessage());
        }
    }

    public int getLocallyDispatchedJobCount() {
        return locallyDispatchedJobIds.size();
    }

    private void runWorkSlice(MarketDataImportJob initialJob) {
        LocalDateTime deadline = LocalDateTime.now().plusSeconds(WORK_SLICE_SECONDS);
        MarketDataImportJob job = initialJob;
        MarketDataProvider provider = marketDataProviderRegistry.get(job.getProviderId());
        List<String> symbols = symbolCsvSupport.parseDistinct(job.getSymbolsCsv());
        MarketDataTimeframe timeframe = MarketDataTimeframe.from(job.getTimeframe());
        LocalDateTime absoluteEnd = job.getEndDate().atTime(23, 59, 59);

        while (LocalDateTime.now().isBefore(deadline)) {
            if (job.getStatus() == MarketDataImportJobStatus.CANCELLED) {
                return;
            }

            if (job.getCurrentSymbolIndex() >= symbols.size()) {
                completeJob(job);
                return;
            }

            String currentSymbol = symbols.get(job.getCurrentSymbolIndex());
            LocalDateTime chunkStart = job.getCurrentChunkStart() == null
                ? job.getStartDate().atStartOfDay()
                : job.getCurrentChunkStart();
            if (chunkStart.isAfter(absoluteEnd)) {
                advanceCursor(job, symbols, absoluteEnd, timeframe, 0);
                job = marketDataImportJobRepository.save(job);
                marketDataImportProgressService.publish(job);
                continue;
            }

            LocalDateTime proposedChunkEnd = min(chunkStart.plus(timeframe.chunkWindow()), absoluteEnd);
            MarketDataProviderFetchRequest providerRequest = new MarketDataProviderFetchRequest(
                job.getAssetType(),
                currentSymbol,
                timeframe,
                chunkStart,
                proposedChunkEnd,
                Boolean.TRUE.equals(job.getAdjusted()),
                Boolean.TRUE.equals(job.getRegularSessionOnly())
            );
            LocalDateTime actualChunkEnd = provider.resolveChunkEnd(providerRequest);
            providerRequest = new MarketDataProviderFetchRequest(
                providerRequest.assetType(),
                providerRequest.requestedSymbol(),
                providerRequest.timeframe(),
                providerRequest.start(),
                actualChunkEnd,
                providerRequest.adjusted(),
                providerRequest.regularSessionOnly()
            );

            job.setAttemptCount(job.getAttemptCount() + 1);
            List<OHLCVData> fetchedBars = provider.fetch(providerRequest).stream()
                .sorted(Comparator.comparing(OHLCVData::getTimestamp))
                .toList();

            List<OHLCVData> filteredBars = job.getAssetType() == MarketDataAssetType.STOCK
                && Boolean.TRUE.equals(job.getRegularSessionOnly())
                && timeframe.isIntraday()
                ? marketDataSessionFilter.regularSessionOnly(fetchedBars)
                : fetchedBars;

            int insertedRows = marketDataDatasetIngestionService.appendBars(job, provider, filteredBars);
            job.setImportedRowCount(job.getImportedRowCount() + insertedRows);
            job.setStatusMessage(
                "Fetched " + filteredBars.size() + " bars for " + currentSymbol
                    + " (" + chunkStart + " to " + actualChunkEnd + ")."
            );
            advanceCursor(job, symbols, actualChunkEnd, timeframe, filteredBars.size());
            job = marketDataImportJobRepository.save(job);
            marketDataImportProgressService.publish(job);
        }

        queueForContinuation(job.getId(), "Work slice finished. Continuing automatically.");
    }

    private void advanceCursor(MarketDataImportJob job,
                               List<String> symbols,
                               LocalDateTime processedChunkEnd,
                               MarketDataTimeframe timeframe,
                               int importedRowsThisStep) {
        LocalDateTime absoluteEnd = job.getEndDate().atTime(23, 59, 59);
        if (!processedChunkEnd.isBefore(absoluteEnd)) {
            if (job.getCurrentSymbolIndex() >= symbols.size() - 1) {
                job.setCurrentSymbolIndex(symbols.size());
                job.setCurrentChunkStart(null);
                if (importedRowsThisStep == 0) {
                    job.setStatusMessage("No more bars returned. Finalizing dataset.");
                }
                return;
            }
            job.setCurrentSymbolIndex(job.getCurrentSymbolIndex() + 1);
            job.setCurrentChunkStart(job.getStartDate().atStartOfDay());
            return;
        }

        job.setCurrentChunkStart(processedChunkEnd.plus(timeframe.step()));
    }

    private MarketDataImportJob markRunning(Long jobId) {
        MarketDataImportJob job = getJob(jobId);
        if (!READY_STATUSES.contains(job.getStatus())) {
            return null;
        }
        job.setStatus(MarketDataImportJobStatus.RUNNING);
        job.setStatusMessage("Running import step.");
        job.setNextRetryAt(null);
        if (job.getStartedAt() == null) {
            job.setStartedAt(LocalDateTime.now());
        }
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        marketDataImportProgressService.publish(saved);
        return saved;
    }

    private void updateRetry(Long jobId, LocalDateTime retryAt, String message) {
        MarketDataImportJob job = getJob(jobId);
        int nextRetryCount = job.getRetryCount() + 1;
        job.setRetryCount(nextRetryCount);
        if (job.getMaxRetryCount() != null && nextRetryCount > job.getMaxRetryCount()) {
            markFailed(
                jobId,
                "Automatic retry limit reached after " + job.getRetryCount()
                    + " wait windows. Review provider limits or credentials, then retry manually."
            );
            return;
        }
        job.setStatus(MarketDataImportJobStatus.WAITING_RETRY);
        job.setStatusMessage(
            (message == null || message.isBlank() ? "Provider asked the downloader to wait." : message)
                + " Automatic retry " + nextRetryCount + " of " + job.getMaxRetryCount() + "."
        );
        job.setNextRetryAt(retryAt);
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        marketDataImportProgressService.publish(saved);
    }

    private void markFailed(Long jobId, String message) {
        MarketDataImportJob job = getJob(jobId);
        Long datasetId = job.getDatasetId();
        job.setStatus(MarketDataImportJobStatus.FAILED);
        job.setStatusMessage(message == null || message.isBlank() ? "Import failed." : message);
        job.setNextRetryAt(null);
        job.setDatasetId(null);
        job.setCompletedAt(LocalDateTime.now());
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        marketDataDatasetIngestionService.discardPendingDataset(datasetId);
        marketDataImportProgressService.publish(saved);
        operatorAuditService.recordFailure(
            "MARKET_DATA_IMPORT_FAILED",
            "test",
            "MARKET_DATA_IMPORT_JOB",
            String.valueOf(job.getId()),
            "provider=" + job.getProviderId() + ", error=" + job.getStatusMessage()
        );
    }

    private void queueForContinuation(Long jobId, String message) {
        MarketDataImportJob job = getJob(jobId);
        if (job.getStatus() == MarketDataImportJobStatus.CANCELLED) {
            return;
        }
        job.setStatus(MarketDataImportJobStatus.QUEUED);
        job.setStatusMessage(message);
        job.setNextRetryAt(LocalDateTime.now().plusSeconds(1));
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        marketDataImportProgressService.publish(saved);
    }

    private void completeJob(MarketDataImportJob job) {
        BacktestDataset dataset = marketDataDatasetIngestionService.finalizeDataset(job);

        MarketDataImportJob managed = getJob(job.getId());
        managed.setDatasetId(dataset.getId());
        managed.setStatus(MarketDataImportJobStatus.COMPLETED);
        managed.setStatusMessage(
            "Completed. Imported " + dataset.getRowCount() + " rows into dataset #" + dataset.getId() + "."
        );
        managed.setNextRetryAt(null);
        managed.setCompletedAt(LocalDateTime.now());
        MarketDataImportJob saved = marketDataImportJobRepository.save(managed);
        marketDataImportProgressService.publish(saved);
        operatorAuditService.recordSuccess(
            "MARKET_DATA_IMPORT_COMPLETED",
            "test",
            "MARKET_DATA_IMPORT_JOB",
            String.valueOf(managed.getId()),
            "provider=" + managed.getProviderId() + ", datasetId=" + dataset.getId()
        );
    }

    private MarketDataImportJob getJob(Long jobId) {
        return marketDataImportJobRepository.findById(jobId)
            .orElseThrow(() -> new EntityNotFoundException("Market data import job not found: " + jobId));
    }

    private LocalDateTime min(LocalDateTime left, LocalDateTime right) {
        return left.isBefore(right) ? left : right;
    }
}
