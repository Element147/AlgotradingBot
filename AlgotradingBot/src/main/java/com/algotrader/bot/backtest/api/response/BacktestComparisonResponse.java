package com.algotrader.bot.backtest.api;

import java.util.List;

public record BacktestComparisonResponse(
    Long baselineBacktestId,
    List<BacktestComparisonItemResponse> items
) {}
