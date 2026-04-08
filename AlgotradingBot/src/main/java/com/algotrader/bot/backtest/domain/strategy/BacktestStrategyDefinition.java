package com.algotrader.bot.backtest.domain.strategy;

import com.algotrader.bot.backtest.domain.service.BacktestAlgorithmType;
public record BacktestStrategyDefinition(
    BacktestAlgorithmType type,
    String label,
    String description,
    BacktestStrategySelectionMode selectionMode,
    int minimumCandles
) {
}
