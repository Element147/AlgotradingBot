package com.algotrader.bot.paper.api.response;

public record PaperTradingAlertResponse(
    String severity,
    String code,
    String summary,
    String recommendedAction
) {}
