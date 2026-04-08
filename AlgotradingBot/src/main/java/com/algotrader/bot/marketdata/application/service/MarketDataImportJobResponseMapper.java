package com.algotrader.bot.marketdata.application.service;

import com.algotrader.bot.marketdata.api.response.MarketDataImportJobResponse;
import com.algotrader.bot.backtest.infrastructure.persistence.repository.BacktestDatasetRepository;
import com.algotrader.bot.shared.api.response.AsyncTaskMonitorResponse;
import com.algotrader.bot.shared.application.service.SymbolCsvSupport;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataImportJob;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MarketDataImportJobResponseMapper {

    private static final long ACTIVE_TIMEOUT_SECONDS = 900;

    private final BacktestDatasetRepository backtestDatasetRepository;
    private final MarketDataProviderRegistry marketDataProviderRegistry;
    private final SymbolCsvSupport symbolCsvSupport;

    public MarketDataImportJobResponseMapper(BacktestDatasetRepository backtestDatasetRepository,
                                             MarketDataProviderRegistry marketDataProviderRegistry,
                                             SymbolCsvSupport symbolCsvSupport) {
        this.backtestDatasetRepository = backtestDatasetRepository;
        this.marketDataProviderRegistry = marketDataProviderRegistry;
        this.symbolCsvSupport = symbolCsvSupport;
    }

    public MarketDataImportJobResponse toResponse(MarketDataImportJob job) {
        MarketDataProvider provider = marketDataProviderRegistry.get(job.getProviderId());
        List<String> symbols = symbolCsvSupport.parseDistinct(job.getSymbolsCsv());
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
            isDatasetReady(job),
            job.getCurrentChunkStart(),
            job.getAttemptCount(),
            job.getRetryCount(),
            job.getMaxRetryCount(),
            job.getCreatedAt(),
            job.getUpdatedAt(),
            job.getStartedAt(),
            job.getCompletedAt(),
            buildAsyncMonitor(job)
        );
    }

    private boolean isDatasetReady(MarketDataImportJob job) {
        if (job.getDatasetId() == null || job.getStatus() != MarketDataImportJobStatus.COMPLETED) {
            return false;
        }

        return backtestDatasetRepository.findById(job.getDatasetId())
            .filter(dataset -> Boolean.TRUE.equals(dataset.getReady()) && !Boolean.TRUE.equals(dataset.getArchived()))
            .isPresent();
    }

    private AsyncTaskMonitorResponse buildAsyncMonitor(MarketDataImportJob job) {
        boolean timedOut = (job.getStatus() == MarketDataImportJobStatus.QUEUED
            || job.getStatus() == MarketDataImportJobStatus.RUNNING
            || job.getStatus() == MarketDataImportJobStatus.WAITING_RETRY)
            && job.getUpdatedAt() != null
            && Duration.between(job.getUpdatedAt(), LocalDateTime.now()).getSeconds() > ACTIVE_TIMEOUT_SECONDS;

        return new AsyncTaskMonitorResponse(
            switch (job.getStatus()) {
                case QUEUED -> "QUEUED";
                case RUNNING -> "RUNNING";
                case WAITING_RETRY -> "WAITING_RETRY";
                case COMPLETED -> "COMPLETED";
                case FAILED -> "FAILED";
                case CANCELLED -> "CANCELLED";
            },
            job.getRetryCount(),
            job.getMaxRetryCount(),
            job.getNextRetryAt(),
            job.getStatus() == MarketDataImportJobStatus.FAILED
                || job.getStatus() == MarketDataImportJobStatus.CANCELLED,
            timedOut,
            ACTIVE_TIMEOUT_SECONDS
        );
    }

}
