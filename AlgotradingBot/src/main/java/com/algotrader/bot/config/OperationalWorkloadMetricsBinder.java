package com.algotrader.bot.config;

import com.algotrader.bot.service.BacktestDatasetCandleCache;
import com.algotrader.bot.service.BacktestExecutionService;
import com.algotrader.bot.service.marketdata.MarketDataImportService;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import org.springframework.stereotype.Component;

@Component
public class OperationalWorkloadMetricsBinder implements MeterBinder {

    private final BacktestExecutionService backtestExecutionService;
    private final MarketDataImportService marketDataImportService;
    private final BacktestDatasetCandleCache backtestDatasetCandleCache;

    public OperationalWorkloadMetricsBinder(BacktestExecutionService backtestExecutionService,
                                            MarketDataImportService marketDataImportService,
                                            BacktestDatasetCandleCache backtestDatasetCandleCache) {
        this.backtestExecutionService = backtestExecutionService;
        this.marketDataImportService = marketDataImportService;
        this.backtestDatasetCandleCache = backtestDatasetCandleCache;
    }

    @Override
    public void bindTo(MeterRegistry registry) {
        Gauge.builder("algotrading.backtests.inflight", backtestExecutionService, BacktestExecutionService::getInFlightBacktestCount)
            .description("Number of backtests currently running or scheduled in this JVM.")
            .register(registry);

        Gauge.builder("algotrading.market_data.imports.dispatched", marketDataImportService, MarketDataImportService::getLocallyDispatchedJobCount)
            .description("Number of market-data import jobs currently dispatched in this JVM.")
            .register(registry);

        Gauge.builder("algotrading.backtests.dataset_cache.entries", backtestDatasetCandleCache, BacktestDatasetCandleCache::size)
            .description("Number of parsed datasets currently retained in the backtest candle cache.")
            .register(registry);
    }
}
