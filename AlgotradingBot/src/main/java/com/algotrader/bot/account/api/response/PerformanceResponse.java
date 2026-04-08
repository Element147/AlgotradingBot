package com.algotrader.bot.account.api;

public record PerformanceResponse(
    String totalProfitLoss,
    String profitLossPercentage,
    String winRate,
    Integer tradeCount,
    String cashRatio
) {}
