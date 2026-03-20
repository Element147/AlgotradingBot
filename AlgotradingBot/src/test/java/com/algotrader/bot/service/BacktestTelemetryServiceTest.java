package com.algotrader.bot.service;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.backtest.strategy.BacktestIndicatorCalculator;
import com.algotrader.bot.controller.BacktestActionMarkerResponse;
import com.algotrader.bot.controller.BacktestSymbolTelemetryResponse;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestEquityPoint;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.entity.BacktestTradeSeriesItem;
import com.algotrader.bot.entity.PositionSide;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class BacktestTelemetryServiceTest {

    private BacktestDatasetRepository backtestDatasetRepository;
    private BacktestDatasetCandleCache backtestDatasetCandleCache;
    private BacktestTelemetryService backtestTelemetryService;

    @BeforeEach
    void setUp() {
        backtestDatasetRepository = mock(BacktestDatasetRepository.class);
        backtestDatasetCandleCache = mock(BacktestDatasetCandleCache.class);
        backtestTelemetryService = new BacktestTelemetryService(
            backtestDatasetRepository,
            backtestDatasetCandleCache,
            new BacktestIndicatorCalculator()
        );
    }

    @Test
    void buildTelemetry_generatesMarkersExposureAndIndicators() {
        BacktestDataset dataset = new BacktestDataset();
        List<OHLCVData> candles = createRisingCandles("BTC/USDT", 240, new BigDecimal("100"));
        BacktestResult result = baseResult(1L, "SMA_CROSSOVER", "BTC/USDT", candles);
        result.addTradeSeriesItem(trade(
            "BTC/USDT",
            PositionSide.LONG,
            candles.get(210).getTimestamp(),
            candles.get(225).getTimestamp(),
            new BigDecimal("310"),
            new BigDecimal("325")
        ));

        when(backtestDatasetRepository.findById(1L)).thenReturn(Optional.of(dataset));
        when(backtestDatasetCandleCache.getOrParse(dataset)).thenReturn(candles);

        List<BacktestSymbolTelemetryResponse> telemetry = backtestTelemetryService.buildTelemetry(result);

        assertEquals(1, telemetry.size());
        BacktestSymbolTelemetryResponse symbolTelemetry = telemetry.get(0);
        assertEquals("BTC/USDT", symbolTelemetry.symbol());
        assertEquals(candles.size(), symbolTelemetry.points().size());
        assertFalse(symbolTelemetry.indicators().isEmpty());
        assertTrue(symbolTelemetry.indicators().stream().anyMatch(series -> "sma_fast_10".equals(series.key())));
        assertTrue(symbolTelemetry.actions().stream().map(BacktestActionMarkerResponse::action).toList().contains("BUY"));
        assertTrue(symbolTelemetry.actions().stream().map(BacktestActionMarkerResponse::action).toList().contains("SELL"));
        assertTrue(symbolTelemetry.points().stream().anyMatch(point -> point.exposurePct().compareTo(BigDecimal.ZERO) > 0));
        assertTrue(symbolTelemetry.points().stream().anyMatch(point -> "TREND_UP".equals(point.regime())));
    }

    @Test
    void buildTelemetry_forDatasetUniversePrefersTradedSymbols() {
        BacktestDataset dataset = new BacktestDataset();
        List<OHLCVData> candles = createUniverseCandles();
        BacktestResult result = baseResult(2L, "DUAL_MOMENTUM_ROTATION", "DATASET_UNIVERSE", candles);
        result.addTradeSeriesItem(trade(
            "ETH/USDT",
            PositionSide.LONG,
            LocalDateTime.parse("2025-01-10T00:00:00"),
            LocalDateTime.parse("2025-01-11T00:00:00"),
            new BigDecimal("125"),
            new BigDecimal("130")
        ));

        when(backtestDatasetRepository.findById(2L)).thenReturn(Optional.of(dataset));
        when(backtestDatasetCandleCache.getOrParse(dataset)).thenReturn(candles);

        List<BacktestSymbolTelemetryResponse> telemetry = backtestTelemetryService.buildTelemetry(result);

        assertFalse(telemetry.isEmpty());
        assertTrue(telemetry.stream().anyMatch(series -> "ETH/USDT".equals(series.symbol())));
    }

    @Test
    void buildTelemetry_bollingerBandsIncludesTrendAndAtrIndicators() {
        BacktestDataset dataset = new BacktestDataset();
        List<OHLCVData> candles = createRisingCandles("BTC/USDT", 240, new BigDecimal("100"));
        BacktestResult result = baseResult(4L, "BOLLINGER_BANDS", "BTC/USDT", candles);

        when(backtestDatasetRepository.findById(4L)).thenReturn(Optional.of(dataset));
        when(backtestDatasetCandleCache.getOrParse(dataset)).thenReturn(candles);

        List<BacktestSymbolTelemetryResponse> telemetry = backtestTelemetryService.buildTelemetry(result);

        assertEquals(1, telemetry.size());
        assertTrue(telemetry.get(0).indicators().stream().anyMatch(series -> "ema_50".equals(series.key())));
        assertTrue(telemetry.get(0).indicators().stream().anyMatch(series -> "atr_14".equals(series.key())));
    }

    @Test
    void buildTelemetry_ichimokuTrendIncludesCloudIndicators() {
        BacktestDataset dataset = new BacktestDataset();
        List<OHLCVData> candles = createRisingCandles("BTC/USDT", 240, new BigDecimal("100"));
        BacktestResult result = baseResult(5L, "ICHIMOKU_TREND", "BTC/USDT", candles);

        when(backtestDatasetRepository.findById(5L)).thenReturn(Optional.of(dataset));
        when(backtestDatasetCandleCache.getOrParse(dataset)).thenReturn(candles);

        List<BacktestSymbolTelemetryResponse> telemetry = backtestTelemetryService.buildTelemetry(result);

        assertEquals(1, telemetry.size());
        assertTrue(telemetry.get(0).indicators().stream().anyMatch(series -> "ichimoku_conversion_9".equals(series.key())));
        assertTrue(telemetry.get(0).indicators().stream().anyMatch(series -> "ichimoku_cloud_a_26".equals(series.key())));
        assertTrue(telemetry.get(0).indicators().stream().anyMatch(series -> "ichimoku_cloud_b_52".equals(series.key())));
    }

    @Test
    void buildTelemetry_skipsIncompleteRuns() {
        List<OHLCVData> candles = createRisingCandles("BTC/USDT", 240, new BigDecimal("100"));
        BacktestResult result = baseResult(3L, "SMA_CROSSOVER", "BTC/USDT", candles);
        result.setExecutionStatus(BacktestResult.ExecutionStatus.RUNNING);

        List<BacktestSymbolTelemetryResponse> telemetry = backtestTelemetryService.buildTelemetry(result);

        assertTrue(telemetry.isEmpty());
        verifyNoInteractions(backtestDatasetRepository, backtestDatasetCandleCache);
    }

    private BacktestResult baseResult(Long datasetId,
                                      String strategyId,
                                      String symbol,
                                      List<OHLCVData> candles) {
        BacktestResult result = new BacktestResult();
        result.setDatasetId(datasetId);
        result.setStrategyId(strategyId);
        result.setSymbol(symbol);
        result.setInitialBalance(new BigDecimal("1000"));
        result.setStartDate(candles.get(0).getTimestamp());
        result.setEndDate(candles.get(candles.size() - 1).getTimestamp());
        result.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);

        for (int index = 0; index < candles.size(); index++) {
            BacktestEquityPoint point = new BacktestEquityPoint();
            point.setPointTimestamp(candles.get(index).getTimestamp());
            point.setEquity(new BigDecimal("1000").add(BigDecimal.valueOf(index)));
            point.setDrawdownPct(BigDecimal.ZERO);
            result.addEquityPoint(point);
        }

        return result;
    }

    private BacktestTradeSeriesItem trade(String symbol,
                                          PositionSide side,
                                          LocalDateTime entryTime,
                                          LocalDateTime exitTime,
                                          BigDecimal entryPrice,
                                          BigDecimal exitPrice) {
        BacktestTradeSeriesItem trade = new BacktestTradeSeriesItem();
        trade.setSymbol(symbol);
        trade.setPositionSide(side);
        trade.setEntryTime(entryTime);
        trade.setExitTime(exitTime);
        trade.setEntryPrice(entryPrice);
        trade.setExitPrice(exitPrice);
        trade.setQuantity(new BigDecimal("1"));
        trade.setEntryValue(entryPrice);
        trade.setExitValue(exitPrice);
        trade.setReturnPct(exitPrice.subtract(entryPrice).divide(entryPrice, 4, RoundingMode.HALF_UP));
        return trade;
    }

    private List<OHLCVData> createRisingCandles(String symbol, int count, BigDecimal startPrice) {
        List<OHLCVData> candles = new ArrayList<>();
        LocalDateTime start = LocalDateTime.parse("2025-01-01T00:00:00");

        for (int index = 0; index < count; index++) {
            BigDecimal close = startPrice.add(BigDecimal.valueOf(index));
            candles.add(candle(start.plusHours(index), symbol, close));
        }

        return candles;
    }

    private List<OHLCVData> createUniverseCandles() {
        List<OHLCVData> candles = new ArrayList<>();
        LocalDateTime start = LocalDateTime.parse("2025-01-01T00:00:00");

        for (int index = 0; index < 240; index++) {
            candles.add(candle(start.plusHours(index), "BTC/USDT", BigDecimal.valueOf(100 + index * 1.1)));
            candles.add(candle(start.plusHours(index), "ETH/USDT", BigDecimal.valueOf(120 + index * 0.8)));
        }

        return candles;
    }

    private OHLCVData candle(LocalDateTime timestamp, String symbol, BigDecimal close) {
        return new OHLCVData(
            timestamp,
            symbol,
            close,
            close.add(BigDecimal.ONE),
            close.subtract(BigDecimal.ONE),
            close,
            BigDecimal.valueOf(1000)
        );
    }
}
