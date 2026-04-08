package com.algotrader.bot.marketdata.application.service;

import java.time.LocalDateTime;

public record MarketDataQueryGap(
    String symbol,
    String timeframe,
    LocalDateTime bucketStart
) {
}
