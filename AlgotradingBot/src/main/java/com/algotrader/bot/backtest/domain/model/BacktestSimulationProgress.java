package com.algotrader.bot.backtest.domain.model;

import java.time.LocalDateTime;

public record BacktestSimulationProgress(
    int processedCandles,
    int totalCandles,
    LocalDateTime currentTimestamp
) {
}
