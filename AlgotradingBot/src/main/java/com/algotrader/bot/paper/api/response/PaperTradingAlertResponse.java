package com.algotrader.bot.paper.api;

public record PaperTradingAlertResponse(
    String severity,
    String code,
    String summary,
    String recommendedAction
) {}
