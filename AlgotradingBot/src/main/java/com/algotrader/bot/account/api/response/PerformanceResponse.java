package com.algotrader.bot.account.api.response;

public record PerformanceResponse(
    String totalProfitLoss,
    String profitLossPercentage,
    String winRate,
    Integer tradeCount,
    String cashRatio
) {}
