package com.algotrader.bot.backtest.domain;

import java.time.LocalDateTime;

public record BacktestSimulationProgress(
    int processedCandles,
    int totalCandles,
    LocalDateTime currentTimestamp
) {
}
