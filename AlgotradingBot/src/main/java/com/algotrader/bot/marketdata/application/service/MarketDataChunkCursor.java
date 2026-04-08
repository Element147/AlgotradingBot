package com.algotrader.bot.marketdata.application;

import java.time.LocalDateTime;

public record MarketDataChunkCursor(
    int symbolIndex,
    LocalDateTime chunkStart
) {
}
