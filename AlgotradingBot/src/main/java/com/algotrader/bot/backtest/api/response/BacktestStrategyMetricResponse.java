package com.algotrader.bot.backtest.api.response;

import java.math.BigDecimal;

public record BacktestStrategyMetricResponse(
    String key,
    String label,
    BigDecimal value,
    String displayValue,
    String description
) {
}
