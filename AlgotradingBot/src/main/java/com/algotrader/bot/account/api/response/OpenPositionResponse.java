package com.algotrader.bot.account.api;

import java.time.LocalDateTime;

public record OpenPositionResponse(
    Long id,
    String symbol,
    String side,
    String entryPrice,
    String currentPrice,
    String positionSize,
    String unrealizedPnL,
    String unrealizedPnLPercentage,
    LocalDateTime entryTime
) {}
