package com.algotrader.bot.backtest.api;

import java.util.List;

public record BacktestIndicatorSeriesResponse(
    String key,
    String label,
    String pane,
    List<BacktestIndicatorPointResponse> points
) {}
