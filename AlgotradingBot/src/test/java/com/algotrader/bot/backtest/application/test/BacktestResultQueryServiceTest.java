package com.algotrader.bot.backtest.application.test;

import com.algotrader.bot.backtest.api.query.BacktestHistoryQuery;
import com.algotrader.bot.backtest.api.response.BacktestHistoryItemResponse;
import com.algotrader.bot.backtest.api.response.BacktestHistoryPageResponse;
import com.algotrader.bot.backtest.api.response.BacktestDetailsResponse;
import com.algotrader.bot.backtest.infrastructure.persistence.entity.BacktestResult;
import com.algotrader.bot.backtest.infrastructure.persistence.entity.BacktestTradeSeriesItem;
import com.algotrader.bot.shared.domain.model.PositionSide;
import com.algotrader.bot.backtest.infrastructure.persistence.repository.BacktestDatasetRepository;
import com.algotrader.bot.backtest.infrastructure.persistence.repository.BacktestResultRepository;
import com.algotrader.bot.shared.infrastructure.observability.service.BackendOperationMetrics;
import org.junit.jupiter.api.Test;
import com.algotrader.bot.backtest.application.service.BacktestResultQueryService;
import com.algotrader.bot.backtest.application.service.BacktestTelemetryService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BacktestResultQueryServiceTest {

    @Test
    void getDetails_includesSqueezeSpecificStrategyMetrics() {
        BacktestResultRepository resultRepository = mock(BacktestResultRepository.class);
        BacktestDatasetRepository datasetRepository = mock(BacktestDatasetRepository.class);
        BacktestTelemetryService telemetryService = mock(BacktestTelemetryService.class);
        BackendOperationMetrics backendOperationMetrics = mock(BackendOperationMetrics.class);
        BacktestResultQueryService service = new BacktestResultQueryService(
            resultRepository,
            datasetRepository,
            telemetryService,
            backendOperationMetrics
        );

        BacktestResult result = new BacktestResult();
        result.setId(42L);
        result.setStrategyId("SQUEEZE_BREAKOUT_REGIME_CONFIRMATION");
        result.setDatasetId(null);
        result.setDatasetName("Squeeze Test");
        result.setExperimentName("Squeeze Reporting");
        result.setExperimentKey("squeeze-reporting");
        result.setSymbol("SPY");
        result.setTimeframe("1h");
        result.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);
        result.setValidationStatus(BacktestResult.ValidationStatus.PASSED);
        result.setInitialBalance(new BigDecimal("1000"));
        result.setFinalBalance(new BigDecimal("1080"));
        result.setNetProfit(new BigDecimal("80"));
        result.setSharpeRatio(new BigDecimal("1.2"));
        result.setProfitFactor(new BigDecimal("1.4"));
        result.setWinRate(new BigDecimal("50"));
        result.setMaxDrawdown(new BigDecimal("8"));
        result.setTotalTrades(2);
        result.setWinningTrades(1);
        result.setLosingTrades(1);
        result.setFeesBps(10);
        result.setSlippageBps(3);
        result.setStartDate(LocalDateTime.parse("2025-01-01T00:00:00"));
        result.setEndDate(LocalDateTime.parse("2025-02-01T00:00:00"));
        result.setTimestamp(LocalDateTime.parse("2025-02-02T00:00:00"));
        result.setExecutionStage(BacktestResult.ExecutionStage.COMPLETED);
        result.setProgressPercent(100);
        result.setProcessedCandles(1000);
        result.setTotalCandles(1000);
        result.setStatusMessage("done");

        result.addTradeSeriesItem(trade(
            LocalDateTime.parse("2025-01-10T09:00:00"),
            LocalDateTime.parse("2025-01-10T15:00:00"),
            new BigDecimal("2.50")
        ));
        result.addTradeSeriesItem(trade(
            LocalDateTime.parse("2025-01-11T09:00:00"),
            LocalDateTime.parse("2025-01-11T12:00:00"),
            new BigDecimal("-1.00")
        ));

        when(resultRepository.findById(42L)).thenReturn(Optional.of(result));

        BacktestDetailsResponse details = service.getDetails(42L);

        assertFalse(details.strategyMetrics().isEmpty());
        assertEquals("breakout_failure_rate", details.strategyMetrics().get(0).key());
        assertEquals("50.00%", details.strategyMetrics().get(0).displayValue());
        assertEquals("average_hold_hours", details.strategyMetrics().get(1).key());
        assertEquals("4.50h", details.strategyMetrics().get(1).displayValue());
    }

    @Test
    void getHistory_preservesStoredWinLossCountsWhenFlatTradesExist() {
        BacktestResultRepository resultRepository = mock(BacktestResultRepository.class);
        BacktestDatasetRepository datasetRepository = mock(BacktestDatasetRepository.class);
        BacktestTelemetryService telemetryService = mock(BacktestTelemetryService.class);
        BackendOperationMetrics backendOperationMetrics = mock(BackendOperationMetrics.class);
        BacktestResultQueryService service = new BacktestResultQueryService(
            resultRepository,
            datasetRepository,
            telemetryService,
            backendOperationMetrics
        );

        BacktestResult result = new BacktestResult();
        result.setId(7L);
        result.setStrategyId("SMA_CROSSOVER");
        result.setDatasetName("BTC test");
        result.setExperimentName("Stored counts");
        result.setSymbol("BTC/USDT");
        result.setTimeframe("1h");
        result.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);
        result.setValidationStatus(BacktestResult.ValidationStatus.PASSED);
        result.setTimestamp(LocalDateTime.parse("2025-02-02T00:00:00"));
        result.setInitialBalance(new BigDecimal("1000"));
        result.setFinalBalance(new BigDecimal("1015"));
        result.setNetProfit(new BigDecimal("15"));
        result.setWinningTrades(1);
        result.setLosingTrades(1);
        result.setTotalTrades(3);
        result.setFeesBps(10);
        result.setSlippageBps(3);
        result.setExecutionStage(BacktestResult.ExecutionStage.COMPLETED);
        result.setProgressPercent(100);
        result.setProcessedCandles(100);
        result.setTotalCandles(100);
        result.addTradeSeriesItem(trade(
            LocalDateTime.parse("2025-01-10T09:00:00"),
            LocalDateTime.parse("2025-01-10T15:00:00"),
            new BigDecimal("2.50")
        ));
        result.addTradeSeriesItem(trade(
            LocalDateTime.parse("2025-01-11T09:00:00"),
            LocalDateTime.parse("2025-01-11T12:00:00"),
            BigDecimal.ZERO
        ));
        result.addTradeSeriesItem(trade(
            LocalDateTime.parse("2025-01-12T09:00:00"),
            LocalDateTime.parse("2025-01-12T12:00:00"),
            new BigDecimal("-1.00")
        ));

        when(resultRepository.findAll(
            org.mockito.ArgumentMatchers.<Specification<BacktestResult>>any(),
            org.mockito.ArgumentMatchers.any(Pageable.class)
        ))
            .thenReturn(new PageImpl<>(List.of(result)));

        BacktestHistoryPageResponse page = service.getHistory(new BacktestHistoryQuery(
            1,
            25,
            "winningTrades",
            "desc",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ));

        BacktestHistoryItemResponse historyItem = page.items().getFirst();
        assertEquals(new BigDecimal("15"), historyItem.netProfit());
        assertEquals(1, historyItem.winningTrades());
        assertEquals(1, historyItem.losingTrades());
    }

    private BacktestTradeSeriesItem trade(LocalDateTime entryTime,
                                          LocalDateTime exitTime,
                                          BigDecimal returnPct) {
        BacktestTradeSeriesItem item = new BacktestTradeSeriesItem();
        item.setSymbol("SPY");
        item.setPositionSide(PositionSide.LONG);
        item.setEntryTime(entryTime);
        item.setExitTime(exitTime);
        item.setEntryPrice(new BigDecimal("100"));
        item.setExitPrice(new BigDecimal("101"));
        item.setQuantity(BigDecimal.ONE);
        item.setEntryValue(new BigDecimal("100"));
        item.setExitValue(new BigDecimal("101"));
        item.setReturnPct(returnPct);
        return item;
    }
}
