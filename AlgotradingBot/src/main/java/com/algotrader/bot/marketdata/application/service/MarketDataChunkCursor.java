package com.algotrader.bot.marketdata.application.service;

import java.time.LocalDateTime;

public record MarketDataChunkCursor(
    int symbolIndex,
    LocalDateTime chunkStart
) {
}
