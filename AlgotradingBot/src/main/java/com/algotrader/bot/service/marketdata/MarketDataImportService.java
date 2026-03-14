package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.controller.BacktestDatasetResponse;
import com.algotrader.bot.controller.MarketDataImportJobRequest;
import com.algotrader.bot.controller.MarketDataImportJobResponse;
import com.algotrader.bot.controller.MarketDataProviderCredentialRequest;
import com.algotrader.bot.controller.MarketDataProviderCredentialResponse;
import com.algotrader.bot.controller.MarketDataProviderResponse;
import com.algotrader.bot.entity.MarketDataImportJob;
import com.algotrader.bot.repository.MarketDataImportJobRepository;
import com.algotrader.bot.service.BacktestDatasetService;
import com.algotrader.bot.service.OperatorAuditService;
import com.algotrader.bot.websocket.WebSocketEventPublisher;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MarketDataImportService {

    private static final Set<MarketDataImportJobStatus> READY_STATUSES = Set.of(
        MarketDataImportJobStatus.QUEUED,
        MarketDataImportJobStatus.WAITING_RETRY
    );
    private static final long WORK_SLICE_SECONDS = 20;
    private static final int READY_JOB_BATCH_SIZE = 2;

    private final MarketDataImportJobRepository marketDataImportJobRepository;
    private final MarketDataProviderRegistry marketDataProviderRegistry;
    private final MarketDataProviderCredentialService marketDataProviderCredentialService;
    private final MarketDataCsvSupport marketDataCsvSupport;
    private final MarketDataSessionFilter marketDataSessionFilter;
    private final BacktestDatasetService backtestDatasetService;
    private final OperatorAuditService operatorAuditService;
    private final WebSocketEventPublisher webSocketEventPublisher;
    private final ObjectProvider<MarketDataImportService> selfProvider;
    private final Set<Long> locallyDispatchedJobIds = ConcurrentHashMap.newKeySet();

    public MarketDataImportService(
        MarketDataImportJobRepository marketDataImportJobRepository,
        MarketDataProviderRegistry marketDataProviderRegistry,
        MarketDataProviderCredentialService marketDataProviderCredentialService,
        MarketDataCsvSupport marketDataCsvSupport,
        MarketDataSessionFilter marketDataSessionFilter,
        BacktestDatasetService backtestDatasetService,
        OperatorAuditService operatorAuditService,
        WebSocketEventPublisher webSocketEventPublisher,
        ObjectProvider<MarketDataImportService> selfProvider
    ) {
        this.marketDataImportJobRepository = marketDataImportJobRepository;
        this.marketDataProviderRegistry = marketDataProviderRegistry;
        this.marketDataProviderCredentialService = marketDataProviderCredentialService;
        this.marketDataCsvSupport = marketDataCsvSupport;
        this.marketDataSessionFilter = marketDataSessionFilter;
        this.backtestDatasetService = backtestDatasetService;
        this.operatorAuditService = operatorAuditService;
        this.webSocketEventPublisher = webSocketEventPublisher;
        this.selfProvider = selfProvider;
    }

    @Transactional(readOnly = true)
    public List<MarketDataProviderResponse> listProviders() {
        return marketDataProviderRegistry.all().stream()
            .map(provider -> new MarketDataProviderResponse(
                provider.definition().id(),
                provider.definition().label(),
                provider.definition().description(),
                provider.definition().supportedAssetTypes().stream().map(Enum::name).sorted().toList(),
                provider.definition().supportedTimeframes(),
                provider.definition().apiKeyRequired(),
                provider.definition().apiKeyEnvironmentVariable(),
                provider.isConfigured(),
                marketDataProviderCredentialService.resolveCredentialSource(provider.definition()).name(),
                provider.definition().supportsAdjusted(),
                provider.definition().supportsRegularSessionOnly(),
                provider.definition().symbolExamples(),
                provider.definition().docsUrl(),
                provider.definition().signupUrl(),
                provider.definition().accountNotes()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<MarketDataProviderCredentialResponse> listProviderCredentials() {
        return marketDataProviderCredentialService.listCredentialSettings(
            marketDataProviderRegistry.all().stream()
                .map(MarketDataProvider::definition)
                .toList()
        );
    }

    @Transactional
    public MarketDataProviderCredentialResponse saveProviderCredential(
        String providerId,
        MarketDataProviderCredentialRequest request
    ) {
        MarketDataProvider provider = marketDataProviderRegistry.get(providerId);
        return marketDataProviderCredentialService.saveCredential(provider.definition(), request);
    }

    @Transactional
    public void deleteProviderCredential(String providerId) {
        MarketDataProvider provider = marketDataProviderRegistry.get(providerId);
        marketDataProviderCredentialService.deleteCredential(provider.definition());
    }

    @Transactional(readOnly = true)
    public List<MarketDataImportJobResponse> listJobs() {
        return marketDataImportJobRepository.findTop25ByOrderByCreatedAtDesc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public MarketDataImportJobResponse createJob(MarketDataImportJobRequest request) {
        MarketDataProvider provider = marketDataProviderRegistry.get(request.providerId());
        MarketDataTimeframe timeframe = MarketDataTimeframe.from(request.timeframe());
        validateCreateRequest(request, provider, timeframe);

        List<String> symbols = normalizeSymbols(request.symbols(), request.assetType());
        MarketDataImportJob job = new MarketDataImportJob();
        job.setProviderId(provider.definition().id());
        job.setAssetType(request.assetType());
        job.setDatasetName(resolveDatasetName(request, provider, timeframe, symbols));
        job.setSymbolsCsv(String.join(",", symbols));
        job.setTimeframe(timeframe.id());
        job.setStartDate(request.startDate());
        job.setEndDate(request.endDate());
        job.setAdjusted(Boolean.TRUE.equals(request.adjusted()));
        job.setRegularSessionOnly(request.assetType() == MarketDataAssetType.STOCK && Boolean.TRUE.equals(request.regularSessionOnly()));
        job.setStatus(MarketDataImportJobStatus.QUEUED);
        job.setStatusMessage("Queued. Waiting for downloader worker.");
        job.setCurrentSymbolIndex(0);
        job.setCurrentChunkStart(request.startDate().atStartOfDay());
        job.setImportedRowCount(0);
        job.setAttemptCount(0);

        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        publishJobProgress(saved);
        operatorAuditService.recordSuccess(
            "MARKET_DATA_IMPORT_CREATED",
            "test",
            "MARKET_DATA_IMPORT_JOB",
            String.valueOf(saved.getId()),
            "provider=" + saved.getProviderId() + ", dataset=" + saved.getDatasetName()
        );
        return toResponse(saved);
    }

    @Transactional
    public MarketDataImportJobResponse retryJob(Long jobId) {
        MarketDataImportJob job = getJob(jobId);
        if (job.getStatus() == MarketDataImportJobStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed import jobs cannot be retried.");
        }

        job.setStatus(MarketDataImportJobStatus.QUEUED);
        job.setStatusMessage("Retry requested. Job restarted from the beginning.");
        job.setNextRetryAt(null);
        job.setCurrentSymbolIndex(0);
        job.setCurrentChunkStart(job.getStartDate().atStartOfDay());
        job.setImportedRowCount(0);
        job.setAttemptCount(0);
        job.setStagedCsvData(null);
        job.setDatasetId(null);
        job.setStartedAt(null);
        job.setCompletedAt(null);

        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        publishJobProgress(saved);
        operatorAuditService.recordSuccess(
            "MARKET_DATA_IMPORT_RETRIED",
            "test",
            "MARKET_DATA_IMPORT_JOB",
            String.valueOf(saved.getId()),
            "provider=" + saved.getProviderId() + ", dataset=" + saved.getDatasetName()
        );
        return toResponse(saved);
    }

    @Transactional
    public MarketDataImportJobResponse cancelJob(Long jobId) {
        MarketDataImportJob job = getJob(jobId);
        if (job.getStatus() == MarketDataImportJobStatus.COMPLETED
            || job.getStatus() == MarketDataImportJobStatus.CANCELLED) {
            return toResponse(job);
        }

        job.setStatus(MarketDataImportJobStatus.CANCELLED);
        job.setStatusMessage("Cancelled by operator.");
        job.setNextRetryAt(null);
        job.setCompletedAt(LocalDateTime.now());
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        publishJobProgress(saved);
        operatorAuditService.recordSuccess(
            "MARKET_DATA_IMPORT_CANCELLED",
            "test",
            "MARKET_DATA_IMPORT_JOB",
            String.valueOf(saved.getId()),
            "provider=" + saved.getProviderId() + ", dataset=" + saved.getDatasetName()
        );
        return toResponse(saved);
    }

    @Scheduled(fixedDelayString = "${algotrading.market-data.import-poll-ms:5000}")
    public void processReadyJobs() {
        List<MarketDataImportJob> readyJobs = marketDataImportJobRepository.findReadyJobs(
            READY_STATUSES,
            LocalDateTime.now(),
            PageRequest.of(0, READY_JOB_BATCH_SIZE)
        );
        if (readyJobs.isEmpty()) {
            return;
        }

        MarketDataImportService asyncProxy = selfProvider.getObject();
        readyJobs.stream()
            .map(MarketDataImportJob::getId)
            .forEach(asyncProxy::processJobAsync);
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

    private void runWorkSlice(MarketDataImportJob initialJob) {
        LocalDateTime deadline = LocalDateTime.now().plusSeconds(WORK_SLICE_SECONDS);
        MarketDataImportJob job = initialJob;
        MarketDataProvider provider = marketDataProviderRegistry.get(job.getProviderId());
        List<String> symbols = parseSymbols(job.getSymbolsCsv());
        MarketDataTimeframe timeframe = MarketDataTimeframe.from(job.getTimeframe());
        LocalDateTime absoluteEnd = job.getEndDate().atTime(23, 59, 59);

        while (LocalDateTime.now().isBefore(deadline)) {
            if (job.getStatus() == MarketDataImportJobStatus.CANCELLED) {
                return;
            }

            if (job.getCurrentSymbolIndex() >= symbols.size()) {
                completeJob(job, provider);
                return;
            }

            String currentSymbol = symbols.get(job.getCurrentSymbolIndex());
            LocalDateTime chunkStart = job.getCurrentChunkStart() == null
                ? job.getStartDate().atStartOfDay()
                : job.getCurrentChunkStart();
            if (chunkStart.isAfter(absoluteEnd)) {
                advanceCursor(job, symbols, absoluteEnd, timeframe, 0);
                job = marketDataImportJobRepository.save(job);
                publishJobProgress(job);
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

            byte[] updatedCsv = marketDataCsvSupport.appendRows(job.getStagedCsvData(), filteredBars);
            backtestDatasetService.validateDatasetSize(updatedCsv.length);
            job.setStagedCsvData(updatedCsv);
            job.setImportedRowCount(job.getImportedRowCount() + filteredBars.size());
            job.setStatusMessage(
                "Fetched " + filteredBars.size() + " bars for " + currentSymbol
                    + " (" + chunkStart + " to " + actualChunkEnd + ")."
            );
            advanceCursor(job, symbols, actualChunkEnd, timeframe, filteredBars.size());
            job = marketDataImportJobRepository.save(job);
            publishJobProgress(job);
        }

        queueForContinuation(job.getId(), "Work slice finished. Continuing automatically.");
    }

    private void advanceCursor(
        MarketDataImportJob job,
        List<String> symbols,
        LocalDateTime processedChunkEnd,
        MarketDataTimeframe timeframe,
        int importedRowsThisStep
    ) {
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

    @Transactional
    protected MarketDataImportJob markRunning(Long jobId) {
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
        publishJobProgress(saved);
        return saved;
    }

    @Transactional
    protected void updateRetry(Long jobId, LocalDateTime retryAt, String message) {
        MarketDataImportJob job = getJob(jobId);
        job.setStatus(MarketDataImportJobStatus.WAITING_RETRY);
        job.setStatusMessage(message);
        job.setNextRetryAt(retryAt);
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        publishJobProgress(saved);
    }

    @Transactional
    protected void markFailed(Long jobId, String message) {
        MarketDataImportJob job = getJob(jobId);
        job.setStatus(MarketDataImportJobStatus.FAILED);
        job.setStatusMessage(message == null || message.isBlank() ? "Import failed." : message);
        job.setNextRetryAt(null);
        job.setCompletedAt(LocalDateTime.now());
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        publishJobProgress(saved);
        operatorAuditService.recordFailure(
            "MARKET_DATA_IMPORT_FAILED",
            "test",
            "MARKET_DATA_IMPORT_JOB",
            String.valueOf(job.getId()),
            "provider=" + job.getProviderId() + ", error=" + job.getStatusMessage()
        );
    }

    @Transactional
    protected void queueForContinuation(Long jobId, String message) {
        MarketDataImportJob job = getJob(jobId);
        if (job.getStatus() == MarketDataImportJobStatus.CANCELLED) {
            return;
        }
        job.setStatus(MarketDataImportJobStatus.QUEUED);
        job.setStatusMessage(message);
        job.setNextRetryAt(LocalDateTime.now().plusSeconds(1));
        MarketDataImportJob saved = marketDataImportJobRepository.save(job);
        publishJobProgress(saved);
    }

    @Transactional
    protected void completeJob(MarketDataImportJob job, MarketDataProvider provider) {
        String filename = provider.definition().id()
            + "-" + job.getAssetType().name().toLowerCase(Locale.ROOT)
            + "-" + job.getTimeframe()
            + "-" + job.getStartDate()
            + "-" + job.getEndDate()
            + ".csv";
        BacktestDatasetResponse dataset = backtestDatasetService.importDataset(
            job.getDatasetName(),
            filename,
            job.getStagedCsvData(),
            provider.definition().label()
        );

        MarketDataImportJob managed = getJob(job.getId());
        managed.setDatasetId(dataset.id());
        managed.setStatus(MarketDataImportJobStatus.COMPLETED);
        managed.setStatusMessage(
            "Completed. Imported " + managed.getImportedRowCount() + " rows into dataset #" + dataset.id() + "."
        );
        managed.setNextRetryAt(null);
        managed.setCompletedAt(LocalDateTime.now());
        MarketDataImportJob saved = marketDataImportJobRepository.save(managed);
        publishJobProgress(saved);
        operatorAuditService.recordSuccess(
            "MARKET_DATA_IMPORT_COMPLETED",
            "test",
            "MARKET_DATA_IMPORT_JOB",
            String.valueOf(managed.getId()),
            "provider=" + managed.getProviderId() + ", datasetId=" + dataset.id()
        );
    }

    private void validateCreateRequest(
        MarketDataImportJobRequest request,
        MarketDataProvider provider,
        MarketDataTimeframe timeframe
    ) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("Start date must be on or before end date.");
        }
        if (!provider.definition().supportedAssetTypes().contains(request.assetType())) {
            throw new IllegalArgumentException(provider.definition().label() + " does not support " + request.assetType().name().toLowerCase(Locale.ROOT) + " imports.");
        }
        if (!provider.definition().supportedTimeframes().contains(timeframe.id())) {
            throw new IllegalArgumentException(provider.definition().label() + " does not support timeframe " + timeframe.id() + ".");
        }
        if (provider.definition().apiKeyRequired() && !provider.isConfigured()) {
            throw new IllegalArgumentException(
                marketDataProviderCredentialService.missingCredentialMessage(provider.definition())
            );
        }
        if (Boolean.TRUE.equals(request.adjusted()) && !provider.definition().supportsAdjusted()) {
            throw new IllegalArgumentException(provider.definition().label() + " does not support adjusted historical bars.");
        }
        if (request.assetType() == MarketDataAssetType.CRYPTO && Boolean.TRUE.equals(request.regularSessionOnly())) {
            throw new IllegalArgumentException("Regular-session filtering is only valid for stock datasets.");
        }
    }

    private String resolveDatasetName(
        MarketDataImportJobRequest request,
        MarketDataProvider provider,
        MarketDataTimeframe timeframe,
        List<String> symbols
    ) {
        if (request.datasetName() != null && !request.datasetName().isBlank()) {
            return request.datasetName().trim();
        }
        String symbolLabel = symbols.size() == 1 ? symbols.get(0) : symbols.get(0) + " +" + (symbols.size() - 1);
        return provider.definition().label() + " " + symbolLabel + " " + timeframe.id() + " " + request.startDate() + " to " + request.endDate();
    }

    private List<String> normalizeSymbols(List<String> rawSymbols, MarketDataAssetType assetType) {
        List<String> normalized = rawSymbols.stream()
            .map(symbol -> symbol == null ? "" : symbol.trim())
            .filter(symbol -> !symbol.isBlank())
            .map(symbol -> assetType == MarketDataAssetType.STOCK
                ? symbol.toUpperCase(Locale.ROOT)
                : symbol.toUpperCase(Locale.ROOT).replace("-", "/").replace("_", "/"))
            .distinct()
            .toList();

        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("At least one valid symbol is required.");
        }
        return normalized;
    }

    private List<String> parseSymbols(String symbolsCsv) {
        return List.of(symbolsCsv.split(",")).stream()
            .map(String::trim)
            .filter(symbol -> !symbol.isBlank())
            .collect(Collectors.toList());
    }

    private MarketDataImportJobResponse toResponse(MarketDataImportJob job) {
        MarketDataProvider provider = marketDataProviderRegistry.get(job.getProviderId());
        List<String> symbols = parseSymbols(job.getSymbolsCsv());
        String currentSymbol = job.getCurrentSymbolIndex() >= 0 && job.getCurrentSymbolIndex() < symbols.size()
            ? symbols.get(job.getCurrentSymbolIndex())
            : null;

        return new MarketDataImportJobResponse(
            job.getId(),
            job.getProviderId(),
            provider.definition().label(),
            job.getAssetType().name(),
            job.getDatasetName(),
            job.getSymbolsCsv(),
            job.getTimeframe(),
            job.getStartDate(),
            job.getEndDate(),
            Boolean.TRUE.equals(job.getAdjusted()),
            Boolean.TRUE.equals(job.getRegularSessionOnly()),
            job.getStatus().name(),
            job.getStatusMessage(),
            job.getNextRetryAt(),
            job.getCurrentSymbolIndex(),
            symbols.size(),
            currentSymbol,
            job.getImportedRowCount(),
            job.getDatasetId(),
            job.getDatasetId() != null && job.getStatus() == MarketDataImportJobStatus.COMPLETED,
            job.getCurrentChunkStart(),
            job.getAttemptCount(),
            job.getCreatedAt(),
            job.getUpdatedAt(),
            job.getStartedAt(),
            job.getCompletedAt()
        );
    }

    private void publishJobProgress(MarketDataImportJob job) {
        MarketDataImportJobResponse response = toResponse(job);
        webSocketEventPublisher.publishMarketDataImportProgress(
            "test",
            response.id(),
            response.providerId(),
            response.providerLabel(),
            response.assetType(),
            response.datasetName(),
            response.symbolsCsv(),
            response.timeframe(),
            response.startDate().toString(),
            response.endDate().toString(),
            response.adjusted(),
            response.regularSessionOnly(),
            response.status(),
            response.statusMessage(),
            response.nextRetryAt(),
            response.currentSymbolIndex(),
            response.totalSymbols(),
            response.currentSymbol(),
            response.importedRowCount(),
            response.datasetId(),
            response.datasetReady(),
            response.currentChunkStart(),
            response.attemptCount(),
            response.createdAt(),
            response.updatedAt(),
            response.startedAt(),
            response.completedAt()
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
