package com.algotrader.bot.backtest.strategy;

import com.algotrader.bot.service.BacktestAlgorithmType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BollingerBandsBacktestStrategy implements BacktestStrategy {

    private static final int PERIOD = 20;
    private static final int TREND_FILTER_PERIOD = 50;
    private static final int ATR_PERIOD = 14;
    private static final int MAX_HOLDING_BARS = 12;
    private static final BigDecimal MULTIPLIER = new BigDecimal("2.0");
    private static final BigDecimal ENTRY_ALLOCATION = new BigDecimal("0.75");
    private static final BigDecimal TREND_FLOOR_BUFFER = new BigDecimal("0.97");
    private static final BigDecimal ATR_STOP_MULTIPLIER = new BigDecimal("1.5");
    private static final BacktestStrategyDefinition DEFINITION = new BacktestStrategyDefinition(
        BacktestAlgorithmType.BOLLINGER_BANDS,
        "Bollinger Bands",
        "Trend-filtered Bollinger snapback strategy that buys confirmed lower-band reversals only while the medium-term trend is still rising.",
        BacktestStrategySelectionMode.SINGLE_SYMBOL,
        TREND_FILTER_PERIOD + 1
    );

    private final BacktestIndicatorCalculator indicatorCalculator;

    public BollingerBandsBacktestStrategy(BacktestIndicatorCalculator indicatorCalculator) {
        this.indicatorCalculator = indicatorCalculator;
    }

    @Override
    public BacktestStrategyDefinition definition() {
        return DEFINITION;
    }

    @Override
    public BacktestStrategyDecision evaluate(BacktestStrategyContext context) {
        int index = context.currentIndex();
        if (index < TREND_FILTER_PERIOD) {
            return BacktestStrategyDecision.hold();
        }

        BigDecimal currentClose = context.currentClose();
        BigDecimal previousClose = context.candles().get(index - 1).getClose();
        BigDecimal middleBand = indicatorCalculator.simpleMovingAverage(context.candles(), index, PERIOD);
        BigDecimal previousLowerBand = indicatorCalculator.bollingerLowerBand(context.candles(), index - 1, PERIOD, MULTIPLIER);
        BigDecimal trendEma = indicatorCalculator.exponentialMovingAverage(context.candles(), index, TREND_FILTER_PERIOD);
        BigDecimal previousTrendEma = indicatorCalculator.exponentialMovingAverage(context.candles(), index - 1, TREND_FILTER_PERIOD);
        BigDecimal trendFloor = trendEma.multiply(TREND_FLOOR_BUFFER);

        boolean trendIntact = trendEma.compareTo(previousTrendEma) >= 0
            && currentClose.compareTo(trendFloor) >= 0;
        boolean confirmedSnapback = previousClose.compareTo(previousLowerBand) < 0
            && currentClose.compareTo(previousClose) > 0;

        if (!context.inPosition() && trendIntact && confirmedSnapback) {
            return BacktestStrategyDecision.buy(
                context.primarySymbol(),
                ENTRY_ALLOCATION,
                "Confirmed snapback above lower Bollinger band inside a rising trend"
            );
        }

        if (context.inPosition()) {
            BigDecimal atr = indicatorCalculator.averageTrueRange(context.candles(), index, ATR_PERIOD);
            BigDecimal stopLevel = context.openPosition().entryPrice()
                .subtract(atr.multiply(ATR_STOP_MULTIPLIER));

            if (!trendIntact
                || currentClose.compareTo(middleBand) >= 0
                || currentClose.compareTo(stopLevel) < 0
                || context.holdingBars() >= MAX_HOLDING_BARS) {
                return BacktestStrategyDecision.sell("Mean-reversion target, trend break, time stop, or ATR stop reached");
            }
        }

        return BacktestStrategyDecision.hold();
    }
}
