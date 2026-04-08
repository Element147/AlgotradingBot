package com.algotrader.bot.marketdata.application.service;

import com.algotrader.bot.backtest.domain.model.OHLCVData;
import java.time.LocalDateTime;
import java.util.List;

public interface MarketDataProvider {

    MarketDataProviderDefinition definition();

    boolean isConfigured();

    default void validateImportRequest(MarketDataProviderFetchRequest request) {
    }

    List<OHLCVData> fetch(MarketDataProviderFetchRequest request);

    default LocalDateTime resolveChunkEnd(MarketDataProviderFetchRequest request) {
        return request.end();
    }
}
