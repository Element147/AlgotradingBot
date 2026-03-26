package com.algotrader.bot.service;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.backtest.strategy.BacktestIndicatorCalculator;
import com.algotrader.bot.controller.BacktestActionMarkerResponse;
import com.algotrader.bot.controller.BacktestIndicatorPointResponse;
import com.algotrader.bot.controller.BacktestIndicatorSeriesResponse;
import com.algotrader.bot.controller.BacktestSymbolTelemetryResponse;
import com.algotrader.bot.controller.BacktestTelemetryPointResponse;
import com.algotrader.bot.controller.BacktestTelemetryProvenanceResponse;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.entity.BacktestTradeSeriesItem;
import com.algotrader.bot.entity.PositionSide;
import com.algotrader.bot.service.marketdata.MarketDataCandleProvenance;
import com.algotrader.bot.service.marketdata.MarketDataQueryMode;
import com.algotrader.bot.service.marketdata.MarketDataQueriedCandle;
import com.algotrader.bot.service.marketdata.MarketDataQueryService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BacktestTelemetryService {

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal RANGE_ADX_THRESHOLD = new BigDecimal("20");
    private static final BigDecimal BOLLINGER_MULTIPLIER = new BigDecimal("2.0");
    private static final int MAX_SYMBOLS = 6;

    private final MarketDataQueryService marketDataQueryService;
    private final BacktestIndicatorCalculator indicatorCalculator;

    public BacktestTelemetryService(MarketDataQueryService marketDataQueryService,
                                    BacktestIndicatorCalculator indicatorCalculator) {
        this.marketDataQueryService = marketDataQueryService;
        this.indicatorCalculator = indicatorCalculator;
    }

    public List<BacktestSymbolTelemetryResponse> buildTelemetry(BacktestResult result) {
        if (result.getExecutionStatus() != BacktestResult.ExecutionStatus.COMPLETED
            || result.getDatasetId() == null) {
            return List.of();
        }

        List<MarketDataQueriedCandle> filteredCandles = marketDataQueryService.queryCandlesForDataset(
                result.getDatasetId(),
                result.getTimeframe(),
                result.getStartDate(),
                result.getEndDate(),
                resolveRequestedSymbols(result),
                MarketDataQueryMode.BEST_AVAILABLE
            ).candles().stream()
            .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
            .toList();
        if (filteredCandles.isEmpty()) {
            return List.of();
        }

        Set<String> relevantSymbols = resolveRelevantSymbols(result, filteredCandles);
        Map<String, List<MarketDataQueriedCandle>> candlesBySymbol = filteredCandles.stream()
            .filter(candle -> relevantSymbols.contains(candle.symbol()))
            .collect(Collectors.groupingBy(
                MarketDataQueriedCandle::symbol,
                LinkedHashMap::new,
                Collectors.toList()
            ));
        Map<LocalDateTime, BigDecimal> equityByTimestamp = result.getEquityPoints().stream()
            .collect(Collectors.toMap(
                point -> point.getPointTimestamp(),
                point -> point.getEquity(),
                (left, _right) -> left,
                LinkedHashMap::new
            ));
        List<TradeWindow> tradeWindows = buildTradeWindows(result, equityByTimestamp);
        Map<String, List<TradeWindow>> tradeWindowsBySymbol = tradeWindows.stream()
            .collect(Collectors.groupingBy(TradeWindow::symbol, LinkedHashMap::new, Collectors.toList()));

        BacktestAlgorithmType resolvedAlgorithmType = resolveAlgorithmType(result.getStrategyId());

        return candlesBySymbol.entrySet().stream()
            .map(entry -> buildSymbolTelemetry(
                resolvedAlgorithmType,
                entry.getKey(),
                entry.getValue(),
                tradeWindowsBySymbol.getOrDefault(entry.getKey(), List.of())
            ))
            .toList();
    }

    private Set<String> resolveRelevantSymbols(BacktestResult result, List<MarketDataQueriedCandle> candles) {
        Set<String> availableSymbols = candles.stream()
            .map(MarketDataQueriedCandle::symbol)
            .collect(Collectors.toCollection(LinkedHashSet::new));
        LinkedHashSet<String> symbols = new LinkedHashSet<>(resolveRequestedSymbols(result));

        if (!availableSymbols.isEmpty()) {
            symbols.retainAll(availableSymbols);
        }

        result.getTradeSeries().stream()
            .map(BacktestTradeSeriesItem::getSymbol)
            .filter(availableSymbols::contains)
            .forEach(symbols::add);

        if (symbols.isEmpty()) {
            availableSymbols.stream().limit(1).forEach(symbols::add);
        }

        return symbols.stream().limit(MAX_SYMBOLS).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> resolveRequestedSymbols(BacktestResult result) {
        LinkedHashSet<String> symbols = new LinkedHashSet<>();

        if (result.getSymbol() != null
            && !result.getSymbol().isBlank()
            && !"DATASET_UNIVERSE".equalsIgnoreCase(result.getSymbol())) {
            symbols.add(result.getSymbol());
        }

        result.getTradeSeries().stream()
            .map(BacktestTradeSeriesItem::getSymbol)
            .filter(symbol -> symbol != null && !symbol.isBlank())
            .forEach(symbols::add);

        return symbols.stream().limit(MAX_SYMBOLS).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private List<TradeWindow> buildTradeWindows(BacktestResult result, Map<LocalDateTime, BigDecimal> equityByTimestamp) {
        return result.getTradeSeries().stream()
            .map(trade -> toTradeWindow(result, trade, equityByTimestamp))
            .filter(Objects::nonNull)
            .toList();
    }

    private TradeWindow toTradeWindow(BacktestResult result,
                                      BacktestTradeSeriesItem trade,
                                      Map<LocalDateTime, BigDecimal> equityByTimestamp) {
        if (trade.getEntryTime() == null || trade.getExitTime() == null || trade.getSymbol() == null) {
            return null;
        }

        BigDecimal equityAtEntry = equityByTimestamp.getOrDefault(trade.getEntryTime(), result.getInitialBalance());
        if (equityAtEntry == null || equityAtEntry.compareTo(BigDecimal.ZERO) == 0) {
            equityAtEntry = result.getInitialBalance();
        }

        BigDecimal exposurePct = trade.getEntryValue() == null || equityAtEntry == null || equityAtEntry.compareTo(BigDecimal.ZERO) == 0
            ? HUNDRED
            : trade.getEntryValue()
                .divide(equityAtEntry, 6, RoundingMode.HALF_UP)
                .multiply(HUNDRED, MC)
                .setScale(4, RoundingMode.HALF_UP);
        if (trade.getPositionSide() == PositionSide.SHORT) {
            exposurePct = exposurePct.negate();
        }

        String entryAction = trade.getPositionSide() == PositionSide.SHORT ? "SHORT" : "BUY";
        String exitAction = trade.getPositionSide() == PositionSide.SHORT ? "COVER" : "SELL";
        String entryLabel = trade.getPositionSide() == PositionSide.SHORT ? "Short entry" : "Long entry";
        String exitLabel = trade.getPositionSide() == PositionSide.SHORT ? "Cover short" : "Exit long";

        return new TradeWindow(
            trade.getSymbol(),
            trade.getEntryTime(),
            trade.getExitTime(),
            exposurePct,
            entryAction,
            trade.getEntryPrice(),
            entryLabel,
            exitAction,
            trade.getExitPrice(),
            exitLabel
        );
    }

    private BacktestSymbolTelemetryResponse buildSymbolTelemetry(BacktestAlgorithmType algorithmType,
                                                                 String symbol,
                                                                 List<MarketDataQueriedCandle> candles,
                                                                 List<TradeWindow> tradeWindows) {
        List<OHLCVData> ohlcvCandles = candles.stream()
            .map(MarketDataQueriedCandle::toOhlcvData)
            .toList();
        List<BacktestTelemetryPointResponse> points = new ArrayList<>(candles.size());
        for (int index = 0; index < candles.size(); index++) {
            MarketDataQueriedCandle candle = candles.get(index);
            points.add(new BacktestTelemetryPointResponse(
                candle.timestamp(),
                scale(candle.open()),
                scale(candle.high()),
                scale(candle.low()),
                scale(candle.close()),
                scale(candle.volume()),
                candle.provenance() == null ? null : candle.provenance().segmentId(),
                exposureAt(candle.timestamp(), tradeWindows),
                classifyRegime(ohlcvCandles, index)
            ));
        }

        List<BacktestActionMarkerResponse> actions = tradeWindows.stream()
            .flatMap(window -> List.of(
                new BacktestActionMarkerResponse(window.entryTime(), window.entryAction(), scale(window.entryPrice()), window.entryLabel()),
                new BacktestActionMarkerResponse(window.exitTime(), window.exitAction(), scale(window.exitPrice()), window.exitLabel())
            ).stream())
            .sorted(Comparator.comparing(BacktestActionMarkerResponse::timestamp))
            .toList();

        List<BacktestTelemetryProvenanceResponse> provenance = candles.stream()
            .map(MarketDataQueriedCandle::provenance)
            .filter(Objects::nonNull)
            .map(this::toTelemetryProvenance)
            .distinct()
            .toList();

        return new BacktestSymbolTelemetryResponse(
            symbol,
            points,
            actions,
            buildIndicatorSeries(algorithmType, ohlcvCandles),
            provenance
        );
    }

    private List<BacktestIndicatorSeriesResponse> buildIndicatorSeries(BacktestAlgorithmType algorithmType,
                                                                       List<OHLCVData> candles) {
        if (algorithmType == null || candles.isEmpty()) {
            return List.of();
        }

        return switch (algorithmType) {
            case BUY_AND_HOLD -> List.of();
            case SMA_CROSSOVER -> List.of(
                createSeries("sma_fast_10", "Fast SMA (10)", "PRICE", candles, 9,
                    index -> indicatorCalculator.simpleMovingAverage(candles, index, 10)),
                createSeries("sma_slow_30", "Slow SMA (30)", "PRICE", candles, 29,
                    index -> indicatorCalculator.simpleMovingAverage(candles, index, 30))
            );
            case BOLLINGER_BANDS -> List.of(
                createSeries("bb_middle_20", "Bollinger Mid (20)", "PRICE", candles, 19,
                    index -> indicatorCalculator.simpleMovingAverage(candles, index, 20)),
                createSeries("bb_lower_20", "Bollinger Lower (20,2)", "PRICE", candles, 19,
                    index -> indicatorCalculator.bollingerLowerBand(candles, index, 20, BOLLINGER_MULTIPLIER)),
                createSeries("bb_upper_20", "Bollinger Upper (20,2)", "PRICE", candles, 19,
                    index -> indicatorCalculator.bollingerUpperBand(candles, index, 20, BOLLINGER_MULTIPLIER)),
                createSeries("ema_50", "Trend EMA (50)", "PRICE", candles, 49,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 50)),
                createSeries("atr_14", "ATR (14)", "OSCILLATOR", candles, 14,
                    index -> indicatorCalculator.averageTrueRange(candles, index, 14))
            );
            case ICHIMOKU_TREND -> List.of(
                createSeries("ichimoku_conversion_9", "Ichimoku Conversion (9)", "PRICE", candles, 8,
                    index -> indicatorCalculator.ichimokuConversionLine(candles, index)),
                createSeries("ichimoku_base_26", "Ichimoku Base (26)", "PRICE", candles, 25,
                    index -> indicatorCalculator.ichimokuBaseLine(candles, index)),
                createSeries("ichimoku_cloud_a_26", "Ichimoku Cloud A", "PRICE", candles, 77,
                    index -> indicatorCalculator.ichimokuLeadingSpanAAtCurrent(candles, index)),
                createSeries("ichimoku_cloud_b_52", "Ichimoku Cloud B", "PRICE", candles, 77,
                    index -> indicatorCalculator.ichimokuLeadingSpanBAtCurrent(candles, index)),
                createSeries("ichimoku_lag_close_26", "Lagging Close Reference (26)", "PRICE", candles, 26,
                    index -> candles.get(index - 26).getClose())
            );
            case DUAL_MOMENTUM_ROTATION -> List.of(
                createSeries("sma_200", "Absolute Filter SMA (200)", "PRICE", candles, 199,
                    index -> indicatorCalculator.simpleMovingAverage(candles, index, 200)),
                createSeries("return_63", "Short Return (63)", "OSCILLATOR", candles, 63,
                    index -> indicatorCalculator.rollingReturn(candles, index, 63).multiply(HUNDRED, MC)),
                createSeries("return_126", "Long Return (126)", "OSCILLATOR", candles, 126,
                    index -> indicatorCalculator.rollingReturn(candles, index, 126).multiply(HUNDRED, MC))
            );
            case VOLATILITY_MANAGED_DONCHIAN_BREAKOUT -> List.of(
                createSeries("ema_200", "Trend EMA (200)", "PRICE", candles, 199,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 200)),
                createSeries("donchian_breakout_55", "Donchian Breakout (55)", "PRICE", candles, 55,
                    index -> indicatorCalculator.highestHigh(candles, index - 1, 55)),
                createSeries("donchian_exit_20", "Donchian Exit (20)", "PRICE", candles, 20,
                    index -> indicatorCalculator.lowestLow(candles, index - 1, 20)),
                createSeries("atr_20", "ATR (20)", "OSCILLATOR", candles, 20,
                    index -> indicatorCalculator.averageTrueRange(candles, index, 20))
            );
            case TREND_PULLBACK_CONTINUATION -> List.of(
                createSeries("ema_200", "Trend EMA (200)", "PRICE", candles, 199,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 200)),
                createSeries("ema_50", "EMA (50)", "PRICE", candles, 49,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 50)),
                createSeries("ema_20", "EMA (20)", "PRICE", candles, 19,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 20)),
                createSeries("ema_5", "Resume EMA (5)", "PRICE", candles, 4,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 5)),
                createSeries("rsi_5", "RSI (5)", "OSCILLATOR", candles, 5,
                    index -> indicatorCalculator.relativeStrengthIndex(candles, index, 5))
            );
            case REGIME_FILTERED_MEAN_REVERSION -> List.of(
                createSeries("ema_200", "Trend EMA (200)", "PRICE", candles, 199,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 200)),
                createSeries("bb_middle_20", "Bollinger Mid (20)", "PRICE", candles, 19,
                    index -> indicatorCalculator.simpleMovingAverage(candles, index, 20)),
                createSeries("bb_lower_20", "Bollinger Lower (20,2)", "PRICE", candles, 19,
                    index -> indicatorCalculator.bollingerLowerBand(candles, index, 20, BOLLINGER_MULTIPLIER)),
                createSeries("bb_upper_20", "Bollinger Upper (20,2)", "PRICE", candles, 19,
                    index -> indicatorCalculator.bollingerUpperBand(candles, index, 20, BOLLINGER_MULTIPLIER)),
                createSeries("rsi_3", "RSI (3)", "OSCILLATOR", candles, 3,
                    index -> indicatorCalculator.relativeStrengthIndex(candles, index, 3)),
                createSeries("adx_14", "ADX (14)", "OSCILLATOR", candles, 14,
                    index -> indicatorCalculator.averageDirectionalIndex(candles, index, 14))
            );
            case TREND_FIRST_ADAPTIVE_ENSEMBLE -> List.of(
                createSeries("ema_200", "Trend EMA (200)", "PRICE", candles, 199,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 200)),
                createSeries("ema_20", "EMA (20)", "PRICE", candles, 19,
                    index -> indicatorCalculator.exponentialMovingAverage(candles, index, 20)),
                createSeries("donchian_breakout_55", "Donchian Breakout (55)", "PRICE", candles, 55,
                    index -> indicatorCalculator.highestHigh(candles, index - 1, 55)),
                createSeries("donchian_exit_20", "Donchian Exit (20)", "PRICE", candles, 20,
                    index -> indicatorCalculator.lowestLow(candles, index - 1, 20)),
                createSeries("bb_lower_20", "Bollinger Lower (20,2)", "PRICE", candles, 19,
                    index -> indicatorCalculator.bollingerLowerBand(candles, index, 20, BOLLINGER_MULTIPLIER)),
                createSeries("rsi_5", "RSI (5)", "OSCILLATOR", candles, 5,
                    index -> indicatorCalculator.relativeStrengthIndex(candles, index, 5)),
                createSeries("adx_14", "ADX (14)", "OSCILLATOR", candles, 14,
                    index -> indicatorCalculator.averageDirectionalIndex(candles, index, 14))
            );
        };
    }

    private BacktestIndicatorSeriesResponse createSeries(String key,
                                                         String label,
                                                         String pane,
                                                         List<OHLCVData> candles,
                                                         int minimumIndex,
                                                         Function<Integer, BigDecimal> calculator) {
        List<BacktestIndicatorPointResponse> points = new ArrayList<>(candles.size());
        for (int index = 0; index < candles.size(); index++) {
            BigDecimal value = index < minimumIndex ? null : scale(calculator.apply(index));
            points.add(new BacktestIndicatorPointResponse(candles.get(index).getTimestamp(), value));
        }
        return new BacktestIndicatorSeriesResponse(key, label, pane, points);
    }

    private BigDecimal exposureAt(LocalDateTime timestamp, List<TradeWindow> tradeWindows) {
        return tradeWindows.stream()
            .filter(window -> !timestamp.isBefore(window.entryTime()) && !timestamp.isAfter(window.exitTime()))
            .map(TradeWindow::exposurePct)
            .findFirst()
            .orElse(BigDecimal.ZERO);
    }

    private String classifyRegime(List<OHLCVData> candles, int index) {
        if (index < 199) {
            return "WARMUP";
        }

        BigDecimal close = candles.get(index).getClose();
        BigDecimal ema200 = indicatorCalculator.exponentialMovingAverage(candles, index, 200);
        BigDecimal adx = index < 14
            ? BigDecimal.ZERO
            : indicatorCalculator.averageDirectionalIndex(candles, index, 14);

        if (adx.compareTo(RANGE_ADX_THRESHOLD) < 0) {
            return "RANGE";
        }
        if (close.compareTo(ema200) >= 0) {
            return "TREND_UP";
        }
        return "TREND_DOWN";
    }

    private BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return null;
        }
        return value.setScale(6, RoundingMode.HALF_UP);
    }

    private BacktestTelemetryProvenanceResponse toTelemetryProvenance(MarketDataCandleProvenance provenance) {
        return new BacktestTelemetryProvenanceResponse(
            provenance.datasetId(),
            provenance.importJobId(),
            provenance.segmentId(),
            provenance.seriesId(),
            provenance.providerId(),
            provenance.exchangeId(),
            provenance.symbol(),
            provenance.timeframe(),
            provenance.resolutionTier(),
            provenance.sourceType(),
            provenance.coverageStart(),
            provenance.coverageEnd()
        );
    }

    private BacktestAlgorithmType resolveAlgorithmType(String strategyId) {
        try {
            return BacktestAlgorithmType.from(strategyId);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private record TradeWindow(
        String symbol,
        LocalDateTime entryTime,
        LocalDateTime exitTime,
        BigDecimal exposurePct,
        String entryAction,
        BigDecimal entryPrice,
        String entryLabel,
        String exitAction,
        BigDecimal exitPrice,
        String exitLabel
    ) {
    }
}
