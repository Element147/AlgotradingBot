package com.algotrader.bot.service.marketdata;

import java.time.LocalDateTime;

public record MarketDataCandleProvenance(
    Long datasetId,
    Long importJobId,
    Long segmentId,
    Long seriesId,
    String providerId,
    String exchangeId,
    String symbol,
    String timeframe,
    String resolutionTier,
    String sourceType,
    LocalDateTime coverageStart,
    LocalDateTime coverageEnd
) {

    public static MarketDataCandleProvenance legacy(Long datasetId, String symbol, String timeframe) {
        return new MarketDataCandleProvenance(
            datasetId,
            null,
            null,
            null,
            "legacy-csv",
            null,
            symbol,
            timeframe,
            "LEGACY_FALLBACK",
            "LEGACY_CSV",
            null,
            null
        );
    }
}
