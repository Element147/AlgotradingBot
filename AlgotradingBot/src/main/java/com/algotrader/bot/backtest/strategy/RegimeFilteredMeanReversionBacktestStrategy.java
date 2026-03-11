package com.algotrader.bot.backtest.strategy;

import com.algotrader.bot.service.BacktestAlgorithmType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class RegimeFilteredMeanReversionBacktestStrategy implements BacktestStrategy {

    private static final int LONG_TREND_PERIOD = 200;
    private static final int BOLLINGER_PERIOD = 20;
    private static final int RSI_PERIOD = 3;
    private static final int ADX_PERIOD = 14;
    private static final int ATR_PERIOD = 14;
    private static final int MAX_HOLDING_BARS = 5;
    private static final BigDecimal ADX_RANGE_THRESHOLD = new BigDecimal("20");
    private static final BigDecimal RSI_OVERSOLD_THRESHOLD = new BigDecimal("20");
    private static final BigDecimal BAND_MULTIPLIER = new BigDecimal("2.0");
    private static final BacktestStrategyDefinition DEFINITION = new BacktestStrategyDefinition(
        BacktestAlgorithmType.REGIME_FILTERED_MEAN_REVERSION,
        "Regime-Filtered Mean Reversion",
        "Trades short-term oversold snapbacks only when trend strength is muted and the market is not breaking down.",
        BacktestStrategySelectionMode.SINGLE_SYMBOL,
        LONG_TREND_PERIOD
    );

    private final BacktestIndicatorCalculator indicatorCalculator;

    public RegimeFilteredMeanReversionBacktestStrategy(BacktestIndicatorCalculator indicatorCalculator) {
        this.indicatorCalculator = indicatorCalculator;
    }

    @Override
    public BacktestStrategyDefinition definition() {
        return DEFINITION;
    }

    @Override
    public BacktestStrategyDecision evaluate(BacktestStrategyContext context) {
        int index = context.currentIndex();
        if (index < getMinimumCandles() - 1) {
            return BacktestStrategyDecision.hold();
        }

        BigDecimal close = context.currentClose();
        BigDecimal ema200 = indicatorCalculator.exponentialMovingAverage(context.candles(), index, LONG_TREND_PERIOD);
        BigDecimal middleBand = indicatorCalculator.simpleMovingAverage(context.candles(), index, BOLLINGER_PERIOD);
        BigDecimal lowerBand = indicatorCalculator.bollingerLowerBand(
            context.candles(),
            index,
            BOLLINGER_PERIOD,
            BAND_MULTIPLIER
        );
        BigDecimal previousRsi = indicatorCalculator.relativeStrengthIndex(context.candles(), index - 1, RSI_PERIOD);
        BigDecimal adx = indicatorCalculator.averageDirectionalIndex(context.candles(), index, ADX_PERIOD);
        BigDecimal atr = indicatorCalculator.averageTrueRange(context.candles(), index, ATR_PERIOD);
        BigDecimal previousClose = context.candles().get(index - 1).getClose();

        boolean rangeRegime = adx.compareTo(ADX_RANGE_THRESHOLD) < 0
            && close.compareTo(ema200.multiply(new BigDecimal("0.97"))) >= 0;
        boolean oversoldSnapback = previousClose.compareTo(lowerBand) < 0
            && previousRsi.compareTo(RSI_OVERSOLD_THRESHOLD) < 0
            && close.compareTo(previousClose) > 0;

        if (!context.inPosition() && rangeRegime && oversoldSnapback) {
            return BacktestStrategyDecision.buy(context.primarySymbol(), new BigDecimal("0.60"), "Oversold snapback in range regime");
        }

        if (context.inPosition()) {
            BigDecimal stopLevel = context.openPosition().entryPrice().subtract(atr.multiply(new BigDecimal("1.5")));
            if (close.compareTo(middleBand) >= 0
                || close.compareTo(stopLevel) < 0
                || context.holdingBars() >= MAX_HOLDING_BARS) {
                return BacktestStrategyDecision.sell("Mean-reversion target, stop, or time stop reached");
            }
        }

        return BacktestStrategyDecision.hold();
    }
}
