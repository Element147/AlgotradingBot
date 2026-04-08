package com.algotrader.bot.backtest.api;

public record BacktestAlgorithmResponse(
    String id,
    String label,
    String description,
    String selectionMode
) {}
