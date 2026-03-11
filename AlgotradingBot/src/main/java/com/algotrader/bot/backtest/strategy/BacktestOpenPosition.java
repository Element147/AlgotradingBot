package com.algotrader.bot.backtest.strategy;

import java.math.BigDecimal;

public record BacktestOpenPosition(
    String symbol,
    BigDecimal quantity,
    BigDecimal entryPrice,
    BigDecimal entryValue,
    BigDecimal allocationFraction,
    int entryTimelineIndex,
    int holdingBars
) {
}
