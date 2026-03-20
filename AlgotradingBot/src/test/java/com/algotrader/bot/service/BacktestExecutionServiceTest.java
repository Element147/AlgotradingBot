package com.algotrader.bot.service;

import com.algotrader.bot.backtest.BacktestSimulationEngine;
import com.algotrader.bot.backtest.strategy.BacktestStrategyRegistry;
import com.algotrader.bot.service.marketdata.MarketDataResampler;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BacktestExecutionServiceTest {

    @Test
    void executeAsync_clearsInFlightStateWhenMarkRunStartedFails() {
        BacktestDatasetService backtestDatasetService = mock(BacktestDatasetService.class);
        BacktestDatasetCandleCache backtestDatasetCandleCache = mock(BacktestDatasetCandleCache.class);
        BacktestSimulationEngine backtestSimulationEngine = mock(BacktestSimulationEngine.class);
        BacktestStrategyRegistry backtestStrategyRegistry = mock(BacktestStrategyRegistry.class);
        MarketDataResampler marketDataResampler = mock(MarketDataResampler.class);
        BacktestExecutionLifecycleService backtestExecutionLifecycleService = mock(BacktestExecutionLifecycleService.class);
        BacktestExecutionService service = new BacktestExecutionService(
            backtestDatasetService,
            backtestDatasetCandleCache,
            backtestSimulationEngine,
            backtestStrategyRegistry,
            marketDataResampler,
            backtestExecutionLifecycleService
        );
        RuntimeException failure = new RuntimeException("backtest row is not visible yet");

        when(backtestExecutionLifecycleService.markRunStarted(42L)).thenThrow(failure);

        service.executeAsync(42L);

        assertEquals(0, service.getInFlightBacktestCount());
        verify(backtestExecutionLifecycleService).markRunStarted(42L);
        verify(backtestExecutionLifecycleService).markRunFailed(eq(42L), same(failure));
    }
}
