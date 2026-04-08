package com.algotrader.bot.backtest.api.response;

import java.util.List;

public record BacktestHistoryPageResponse(
    List<BacktestHistoryItemResponse> items,
    long total,
    int page,
    int pageSize
) {}
