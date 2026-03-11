package com.algotrader.bot.backtest.strategy;

import com.algotrader.bot.service.BacktestAlgorithmType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BollingerBandsBacktestStrategy implements BacktestStrategy {

    private static final int PERIOD = 20;
    private static final BigDecimal MULTIPLIER = new BigDecimal("2.0");
    private static final BacktestStrategyDefinition DEFINITION = new BacktestStrategyDefinition(
        BacktestAlgorithmType.BOLLINGER_BANDS,
        "Bollinger Bands",
        "Legacy mean-reversion strategy that buys oversold closes below the lower band and exits on mean reversion.",
        BacktestStrategySelectionMode.SINGLE_SYMBOL,
        PERIOD
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
        if (context.currentIndex() < PERIOD - 1) {
            return BacktestStrategyDecision.hold();
        }

        BigDecimal currentClose = context.currentClose();
        BigDecimal middleBand = indicatorCalculator.simpleMovingAverage(context.candles(), context.currentIndex(), PERIOD);
        BigDecimal lowerBand = indicatorCalculator.bollingerLowerBand(context.candles(), context.currentIndex(), PERIOD, MULTIPLIER);

        if (!context.inPosition() && currentClose.compareTo(lowerBand) < 0) {
            return BacktestStrategyDecision.buy(context.primarySymbol(), BigDecimal.ONE, "Close moved below lower Bollinger band");
        }

        if (context.inPosition() && currentClose.compareTo(middleBand) > 0) {
            return BacktestStrategyDecision.sell("Price reverted back above Bollinger mean");
        }

        return BacktestStrategyDecision.hold();
    }
}
