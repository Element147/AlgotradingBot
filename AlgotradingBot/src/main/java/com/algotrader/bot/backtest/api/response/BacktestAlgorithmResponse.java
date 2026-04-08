package com.algotrader.bot.backtest.api.response;

public record BacktestAlgorithmResponse(
    String id,
    String label,
    String description,
    String selectionMode
) {}
