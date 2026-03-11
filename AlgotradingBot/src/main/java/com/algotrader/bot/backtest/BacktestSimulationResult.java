package com.algotrader.bot.backtest;

import java.math.BigDecimal;

public record BacktestSimulationResult(
    BigDecimal finalBalance,
    BigDecimal sharpeRatio,
    BigDecimal profitFactor,
    BigDecimal winRatePercent,
    BigDecimal maxDrawdownPercent,
    int totalTrades
) {
}
