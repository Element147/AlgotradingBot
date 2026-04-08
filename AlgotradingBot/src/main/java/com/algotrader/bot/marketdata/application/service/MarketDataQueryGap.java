package com.algotrader.bot.marketdata.application;

import java.time.LocalDateTime;

public record MarketDataQueryGap(
    String symbol,
    String timeframe,
    LocalDateTime bucketStart
) {
}
