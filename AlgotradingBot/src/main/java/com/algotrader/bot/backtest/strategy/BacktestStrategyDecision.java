package com.algotrader.bot.backtest.strategy;

import java.math.BigDecimal;

public record BacktestStrategyDecision(
    BacktestStrategyAction action,
    String targetSymbol,
    BigDecimal allocationFraction,
    String reason
) {

    private static final BigDecimal FULL_ALLOCATION = BigDecimal.ONE;

    public static BacktestStrategyDecision hold() {
        return new BacktestStrategyDecision(BacktestStrategyAction.HOLD, null, FULL_ALLOCATION, "Hold");
    }

    public static BacktestStrategyDecision buy(String targetSymbol, BigDecimal allocationFraction, String reason) {
        return new BacktestStrategyDecision(BacktestStrategyAction.BUY, targetSymbol, allocationFraction, reason);
    }

    public static BacktestStrategyDecision sell(String reason) {
        return new BacktestStrategyDecision(BacktestStrategyAction.SELL, null, FULL_ALLOCATION, reason);
    }

    public static BacktestStrategyDecision rotate(String targetSymbol, BigDecimal allocationFraction, String reason) {
        return new BacktestStrategyDecision(BacktestStrategyAction.ROTATE, targetSymbol, allocationFraction, reason);
    }
}
