package com.algotrader.bot.strategy.api;

public record StrategyActionResponse(
    Long strategyId,
    String status,
    String message
) {}
