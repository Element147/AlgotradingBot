package com.algotrader.bot.service;

public enum BacktestAlgorithmType {
    BUY_AND_HOLD,
    DUAL_MOMENTUM_ROTATION,
    VOLATILITY_MANAGED_DONCHIAN_BREAKOUT,
    TREND_PULLBACK_CONTINUATION,
    REGIME_FILTERED_MEAN_REVERSION,
    TREND_FIRST_ADAPTIVE_ENSEMBLE,
    SMA_CROSSOVER,
    BOLLINGER_BANDS;

    public static BacktestAlgorithmType from(String value) {
        try {
            return BacktestAlgorithmType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unsupported algorithm type: " + value);
        }
    }
}
