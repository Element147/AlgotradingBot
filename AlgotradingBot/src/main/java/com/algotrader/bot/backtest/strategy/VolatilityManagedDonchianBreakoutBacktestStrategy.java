package com.algotrader.bot.backtest.strategy;

import com.algotrader.bot.service.BacktestAlgorithmType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class VolatilityManagedDonchianBreakoutBacktestStrategy implements BacktestStrategy {

    private static final int TREND_PERIOD = 200;
    private static final int BREAKOUT_PERIOD = 55;
    private static final int EXIT_PERIOD = 20;
    private static final int ATR_PERIOD = 20;
    private static final BigDecimal TARGET_VOL = new BigDecimal("0.02");
    private static final BigDecimal MIN_ALLOCATION = new BigDecimal("0.35");
    private static final BacktestStrategyDefinition DEFINITION = new BacktestStrategyDefinition(
        BacktestAlgorithmType.VOLATILITY_MANAGED_DONCHIAN_BREAKOUT,
        "Volatility-Managed Donchian Breakout",
        "Trend-following breakout system with 55-bar entries, 20-bar exits, and volatility-managed position sizing.",
        BacktestStrategySelectionMode.SINGLE_SYMBOL,
        TREND_PERIOD
    );

    private final BacktestIndicatorCalculator indicatorCalculator;

    public VolatilityManagedDonchianBreakoutBacktestStrategy(BacktestIndicatorCalculator indicatorCalculator) {
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
        BigDecimal trendEma = indicatorCalculator.exponentialMovingAverage(context.candles(), index, TREND_PERIOD);
        BigDecimal breakoutLevel = indicatorCalculator.highestHigh(context.candles(), index - 1, BREAKOUT_PERIOD);
        BigDecimal exitLevel = indicatorCalculator.lowestLow(context.candles(), index - 1, EXIT_PERIOD);
        BigDecimal atr = indicatorCalculator.averageTrueRange(context.candles(), index, ATR_PERIOD);

        if (!context.inPosition() && close.compareTo(trendEma) > 0 && close.compareTo(breakoutLevel) > 0) {
            BigDecimal allocation = indicatorCalculator.volatilityAdjustedAllocation(
                context.candles(),
                index,
                ATR_PERIOD,
                TARGET_VOL,
                MIN_ALLOCATION
            );
            return BacktestStrategyDecision.buy(context.primarySymbol(), allocation, "55-bar breakout above 200 EMA");
        }

        if (context.inPosition()) {
            BigDecimal stopLevel = context.openPosition().entryPrice().subtract(atr.multiply(new BigDecimal("2")));
            if (close.compareTo(exitLevel) < 0 || close.compareTo(stopLevel) < 0 || close.compareTo(trendEma) < 0) {
                return BacktestStrategyDecision.sell("Breakout failed below trailing Donchian/ATR protection");
            }
        }

        return BacktestStrategyDecision.hold();
    }
}
