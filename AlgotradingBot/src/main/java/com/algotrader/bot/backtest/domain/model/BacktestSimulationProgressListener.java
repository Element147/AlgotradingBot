package com.algotrader.bot.backtest.domain.model;

@FunctionalInterface
public interface BacktestSimulationProgressListener {

    void onProgress(BacktestSimulationProgress progress);
}
