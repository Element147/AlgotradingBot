package com.algotrader.bot.service;

public enum BacktestAlgorithmType {
    BOLLINGER_BANDS,
    SMA_CROSSOVER,
    BUY_AND_HOLD;

    public static BacktestAlgorithmType from(String value) {
        try {
            return BacktestAlgorithmType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unsupported algorithm type: " + value);
        }
    }
}
