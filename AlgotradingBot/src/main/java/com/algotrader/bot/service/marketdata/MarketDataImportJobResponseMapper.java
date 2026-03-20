package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.controller.MarketDataImportJobResponse;
import com.algotrader.bot.entity.MarketDataImportJob;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarketDataImportJobResponseMapper {

    private final MarketDataProviderRegistry marketDataProviderRegistry;

    public MarketDataImportJobResponseMapper(MarketDataProviderRegistry marketDataProviderRegistry) {
        this.marketDataProviderRegistry = marketDataProviderRegistry;
    }

    public MarketDataImportJobResponse toResponse(MarketDataImportJob job) {
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

    private List<String> parseSymbols(String symbolsCsv) {
        return List.of(symbolsCsv.split(",")).stream()
            .map(String::trim)
            .filter(symbol -> !symbol.isBlank())
            .toList();
    }
}
