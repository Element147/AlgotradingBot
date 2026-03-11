package com.algotrader.bot.backtest.strategy;

import com.algotrader.bot.service.BacktestAlgorithmType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TrendPullbackContinuationBacktestStrategy implements BacktestStrategy {

    private static final int LONG_TREND_PERIOD = 200;
    private static final int MEDIUM_TREND_PERIOD = 50;
    private static final int PULLBACK_EMA_PERIOD = 20;
    private static final int RESUME_EMA_PERIOD = 5;
    private static final int RSI_PERIOD = 5;
    private static final int ATR_PERIOD = 20;
    private static final BigDecimal RSI_PULLBACK_THRESHOLD = new BigDecimal("35");
    private static final BacktestStrategyDefinition DEFINITION = new BacktestStrategyDefinition(
        BacktestAlgorithmType.TREND_PULLBACK_CONTINUATION,
        "Trend Pullback Continuation",
        "Buys controlled pullbacks inside an established uptrend and exits when continuation fails.",
        BacktestStrategySelectionMode.SINGLE_SYMBOL,
        LONG_TREND_PERIOD
    );

    private final BacktestIndicatorCalculator indicatorCalculator;

    public TrendPullbackContinuationBacktestStrategy(BacktestIndicatorCalculator indicatorCalculator) {
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
        BigDecimal ema50 = indicatorCalculator.exponentialMovingAverage(context.candles(), index, MEDIUM_TREND_PERIOD);
        BigDecimal ema20 = indicatorCalculator.exponentialMovingAverage(context.candles(), index, PULLBACK_EMA_PERIOD);
        BigDecimal ema5 = indicatorCalculator.exponentialMovingAverage(context.candles(), index, RESUME_EMA_PERIOD);
        BigDecimal previousClose = context.candles().get(index - 1).getClose();
        BigDecimal rsi = indicatorCalculator.relativeStrengthIndex(context.candles(), index, RSI_PERIOD);
        BigDecimal atr = indicatorCalculator.averageTrueRange(context.candles(), index, ATR_PERIOD);

        boolean trendHealthy = close.compareTo(ema200) > 0 && ema50.compareTo(ema200) > 0;
        boolean validPullback = rsi.compareTo(RSI_PULLBACK_THRESHOLD) < 0 || close.compareTo(ema20) <= 0;
        boolean continuationResumed = close.compareTo(ema5) > 0 && previousClose.compareTo(ema5) <= 0;

        if (!context.inPosition() && trendHealthy && validPullback && continuationResumed) {
            return BacktestStrategyDecision.buy(context.primarySymbol(), BigDecimal.ONE, "Pullback resumed in bullish higher-timeframe trend");
        }

        if (context.inPosition()) {
            BigDecimal stopLevel = context.openPosition().entryPrice().subtract(atr.multiply(new BigDecimal("1.5")));
            if (!trendHealthy || close.compareTo(stopLevel) < 0 || close.compareTo(ema20) < 0) {
                return BacktestStrategyDecision.sell("Trend continuation failed after pullback entry");
            }
        }

        return BacktestStrategyDecision.hold();
    }
}
