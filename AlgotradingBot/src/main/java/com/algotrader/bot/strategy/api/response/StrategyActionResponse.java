package com.algotrader.bot.strategy.api.response;

public record StrategyActionResponse(
    Long strategyId,
    String status,
    String message
) {}
