package com.algotrader.bot.backtest.domain;

@FunctionalInterface
public interface BacktestSimulationProgressListener {

    void onProgress(BacktestSimulationProgress progress);
}
