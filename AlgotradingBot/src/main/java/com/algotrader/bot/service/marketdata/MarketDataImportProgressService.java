package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.controller.MarketDataImportJobResponse;
import com.algotrader.bot.entity.MarketDataImportJob;
import com.algotrader.bot.websocket.WebSocketEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class MarketDataImportProgressService {

    private final WebSocketEventPublisher webSocketEventPublisher;
    private final MarketDataImportJobResponseMapper marketDataImportJobResponseMapper;

    public MarketDataImportProgressService(WebSocketEventPublisher webSocketEventPublisher,
                                           MarketDataImportJobResponseMapper marketDataImportJobResponseMapper) {
        this.webSocketEventPublisher = webSocketEventPublisher;
        this.marketDataImportJobResponseMapper = marketDataImportJobResponseMapper;
    }

    public void publish(MarketDataImportJob job) {
        MarketDataImportJobResponse response = marketDataImportJobResponseMapper.toResponse(job);
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
}
