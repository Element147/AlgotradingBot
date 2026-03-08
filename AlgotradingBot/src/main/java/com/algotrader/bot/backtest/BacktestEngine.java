package com.algotrader.bot.backtest;

import com.algotrader.bot.entity.Account;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.entity.Trade;
import com.algotrader.bot.risk.PositionSizeResult;
import com.algotrader.bot.risk.PositionSizer;
import com.algotrader.bot.risk.RiskCheckResult;
import com.algotrader.bot.risk.RiskManager;
import com.algotrader.bot.risk.SlippageCalculator;
import com.algotrader.bot.risk.TransactionCost;
import com.algotrader.bot.strategy.BollingerBandStrategy;
import com.algotrader.bot.strategy.SignalType;
import com.algotrader.bot.strategy.TradeSignal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core backtesting engine that simulates trading strategy on historical data.
 * 
 * Features:
 * - Realistic order execution using OHLC data
 * - Transaction costs applied on every trade (fees + slippage)
 * - Position sizing with 2% risk rule
 * - Circuit breaker enforcement
 * - Equity curve tracking for drawdown calculation
 * - Structured JSON logging for all trades
 * 
 * Process:
 * 1. Initialize account with starting balance
 * 2. For each candle:
 *    - Generate signal using strategy
 *    - Execute entry/exit based on signal and risk checks
 *    - Apply transaction costs
 *    - Track equity curve
 * 3. Calculate final metrics
 * 4. Persist results to database
 */
@Component
public class BacktestEngine {

    private static final Logger logger = LoggerFactory.getLogger(BacktestEngine.class);
    private static final int SCALE = 8;
    private static final int LOOKBACK_PERIOD = 20; // For Bollinger Bands calculation

    private final PositionSizer positionSizer;
    private final RiskManager riskManager;
    private final SlippageCalculator slippageCalculator;
    private final BacktestMetrics backtestMetrics;

    public BacktestEngine(PositionSizer positionSizer, RiskManager riskManager,
                          SlippageCalculator slippageCalculator, BacktestMetrics backtestMetrics) {
        this.positionSizer = positionSizer;
        this.riskManager = riskManager;
        this.slippageCalculator = slippageCalculator;
        this.backtestMetrics = backtestMetrics;
    }

    /**
     * Run backtest on historical data.
     *
     * @param config Backtest configuration
     * @param historicalData List of OHLCV candles
     * @return BacktestResult with performance metrics
     */
    public BacktestResult runBacktest(BacktestConfig config, List<OHLCVData> historicalData) {
        logger.info("Starting backtest for {} from {} to {}",
                config.getSymbol(), config.getStartDate(), config.getEndDate());

        // Validate inputs
        config.validate();
        validateHistoricalData(historicalData, config);

        // Initialize account
        Account account = new Account(
                config.getInitialBalance(),
                config.getRiskPerTrade(),
                config.getMaxDrawdownLimit()
        );

        // Initialize strategy
        BollingerBandStrategy strategy = new BollingerBandStrategy();

        // Track state
        List<Trade> completedTrades = new ArrayList<>();
        List<BigDecimal> equityCurve = new ArrayList<>();
        Trade openPosition = null;
        BigDecimal peakEquity = config.getInitialBalance();

        // Add initial equity
        equityCurve.add(config.getInitialBalance());

        // Process each candle
        for (int i = LOOKBACK_PERIOD; i < historicalData.size(); i++) {
            OHLCVData currentCandle = historicalData.get(i);

            // Get historical close prices for indicator calculation
            List<BigDecimal> closePrices = historicalData.subList(i - LOOKBACK_PERIOD, i)
                    .stream()
                    .map(OHLCVData::getClose)
                    .collect(Collectors.toList());

            // Generate signal
            TradeSignal signal = strategy.generateSignal(
                    closePrices,
                    currentCandle.getClose(),
                    config.getSymbol()
            );

            // Check circuit breaker
            RiskCheckResult riskCheck = riskManager.canTrade(account, completedTrades);
            if (!riskCheck.isCanTrade()) {
                logger.warn("Circuit breaker triggered: {}", riskCheck.getReason());
                account.setStatus(Account.AccountStatus.CIRCUIT_BREAKER_TRIGGERED);
                break;
            }

            // Process signal
            if (signal.getSignalType() == SignalType.BUY && openPosition == null) {
                // Entry logic
                openPosition = executeEntry(signal, currentCandle, account, config);
                if (openPosition != null) {
                    logger.info("Trade entry: {}", openPosition);
                }
            } else if (openPosition != null) {
                // Exit logic - check stop-loss, take-profit, or SELL signal
                boolean shouldExit = checkExitConditions(signal, currentCandle, openPosition);
                if (shouldExit) {
                    Trade closedTrade = executeExit(openPosition, currentCandle, account, config);
                    completedTrades.add(closedTrade);
                    logger.info("Trade exit: {}", closedTrade);
                    openPosition = null;
                }
            }

            // Update equity curve
            BigDecimal currentEquity = calculateCurrentEquity(account, openPosition, currentCandle);
            equityCurve.add(currentEquity);

            // Update peak equity
            if (currentEquity.compareTo(peakEquity) > 0) {
                peakEquity = currentEquity;
            }
        }

        // Close any remaining open position at final price
        if (openPosition != null) {
            OHLCVData finalCandle = historicalData.get(historicalData.size() - 1);
            Trade closedTrade = executeExit(openPosition, finalCandle, account, config);
            completedTrades.add(closedTrade);
            logger.info("Closing final position: {}", closedTrade);
        }

        // Calculate metrics
        MetricsResult metrics = backtestMetrics.calculateMetrics(
                completedTrades,
                equityCurve,
                config.getInitialBalance(),
                config.getStartDate(),
                config.getEndDate()
        );

        // Create result
        BacktestResult result = createBacktestResult(config, account, metrics);

        logger.info("Backtest completed: {} trades, Sharpe={}, ProfitFactor={}, WinRate={}%",
                metrics.getTotalTrades(),
                metrics.getSharpeRatio(),
                metrics.getProfitFactor(),
                metrics.getWinRate().multiply(BigDecimal.valueOf(100)));

        return result;
    }

    /**
     * Run walk-forward validation: split data into training (80%) and testing (20%),
     * run backtest on both, and compare performance.
     *
     * @param config Backtest configuration
     * @param historicalData List of OHLCV candles
     * @return WalkForwardResult with training and testing metrics
     */
    public WalkForwardResult runWalkForwardValidation(BacktestConfig config, List<OHLCVData> historicalData) {
        logger.info("Starting walk-forward validation for {}", config.getSymbol());

        // Validate inputs
        config.validate();
        validateHistoricalData(historicalData, config);

        // Split data: 80% training, 20% testing
        int splitIndex = (int) (historicalData.size() * 0.8);
        List<OHLCVData> trainingData = historicalData.subList(0, splitIndex);
        List<OHLCVData> testingData = historicalData.subList(splitIndex, historicalData.size());

        logger.info("Split data: {} training candles, {} testing candles",
                trainingData.size(), testingData.size());

        // Run backtest on training data
        BacktestResult trainingResult = runBacktest(config, trainingData);
        logger.info("Training result: Sharpe={}, Profit Factor={}, Win Rate={}%",
                trainingResult.getSharpeRatio(),
                trainingResult.getProfitFactor(),
                trainingResult.getWinRate().multiply(new BigDecimal("100")));

        // Run backtest on testing data (out-of-sample)
        BacktestResult testingResult = runBacktest(config, testingData);
        logger.info("Testing result: Sharpe={}, Profit Factor={}, Win Rate={}%",
                testingResult.getSharpeRatio(),
                testingResult.getProfitFactor(),
                testingResult.getWinRate().multiply(new BigDecimal("100")));

        // Compare metrics
        WalkForwardResult result = new WalkForwardResult(trainingResult, testingResult);
        logger.info("Walk-forward validation: {}", result);

        return result;
    }


    /**
     * Execute trade entry with position sizing and transaction costs.
     */
    private Trade executeEntry(TradeSignal signal, OHLCVData candle, Account account, BacktestConfig config) {
        // Calculate position size
        PositionSizeResult positionSizeResult = positionSizer.calculatePositionSize(
                account.getCurrentBalance(),
                signal.getEntryPrice(),
                signal.getStopLossPrice(),
                config.getRiskPerTrade()
        );

        if (!positionSizeResult.isValid()) {
            logger.debug("Position size invalid: {}", positionSizeResult.getValidationMessage());
            return null;
        }

        // Calculate transaction costs (entry)
        TransactionCost entryCost = slippageCalculator.calculateRealCost(
                signal.getEntryPrice(),
                positionSizeResult.getPositionSize(),
                true // isBuy
        );

        // Create trade record
        Trade trade = new Trade(
                null, // accountId - will be set by service layer
                config.getSymbol(),
                Trade.SignalType.BUY,
                candle.getTimestamp(),
                entryCost.getEffectivePrice(),
                positionSizeResult.getPositionSize(),
                positionSizeResult.getRiskAmount(),
                signal.getStopLossPrice(),
                signal.getTakeProfitPrice(),
                entryCost.getTotalFees(),
                entryCost.getTotalSlippage()
        );

        // Deduct entry cost from account
        account.setCurrentBalance(
                account.getCurrentBalance().subtract(entryCost.getNetCost())
        );

        return trade;
    }

    /**
     * Execute trade exit with transaction costs and PnL calculation.
     */
    private Trade executeExit(Trade openPosition, OHLCVData candle, Account account, BacktestConfig config) {
        BigDecimal exitPrice = candle.getClose();

        // Calculate transaction costs (exit)
        TransactionCost exitCost = slippageCalculator.calculateRealCost(
                exitPrice,
                openPosition.getPositionSize(),
                false // isSell
        );

        // Update trade with exit information
        openPosition.setExitTime(candle.getTimestamp());
        openPosition.setExitPrice(exitCost.getEffectivePrice());

        // Calculate PnL
        BigDecimal entryValue = openPosition.getEntryPrice()
                .multiply(openPosition.getPositionSize())
                .setScale(SCALE, RoundingMode.HALF_UP);

        BigDecimal exitValue = exitCost.getNetCost(); // Already includes fees and slippage

        BigDecimal pnl = exitValue.subtract(entryValue)
                .setScale(SCALE, RoundingMode.HALF_UP);

        openPosition.setPnl(pnl);

        // Add exit fees and slippage to trade record
        BigDecimal totalFees = openPosition.getActualFees().add(exitCost.getTotalFees());
        BigDecimal totalSlippage = openPosition.getActualSlippage().add(exitCost.getTotalSlippage());
        openPosition.setActualFees(totalFees);
        openPosition.setActualSlippage(totalSlippage);

        // Update account balance
        account.setCurrentBalance(
                account.getCurrentBalance().add(exitValue)
        );

        // Update total PnL
        account.setTotalPnl(
                account.getTotalPnl().add(pnl)
        );

        return openPosition;
    }

    /**
     * Check if exit conditions are met (stop-loss, take-profit, or SELL signal).
     */
    private boolean checkExitConditions(TradeSignal signal, OHLCVData candle, Trade openPosition) {
        BigDecimal currentPrice = candle.getClose();

        // Check stop-loss (price dropped below stop-loss)
        if (currentPrice.compareTo(openPosition.getStopLoss()) <= 0) {
            logger.debug("Stop-loss triggered at {}", currentPrice);
            return true;
        }

        // Check take-profit (price reached take-profit)
        if (currentPrice.compareTo(openPosition.getTakeProfit()) >= 0) {
            logger.debug("Take-profit triggered at {}", currentPrice);
            return true;
        }

        // Check SELL signal
        if (signal.getSignalType() == SignalType.SELL) {
            logger.debug("SELL signal received at {}", currentPrice);
            return true;
        }

        return false;
    }

    /**
     * Calculate current equity including open position value.
     */
    private BigDecimal calculateCurrentEquity(Account account, Trade openPosition, OHLCVData candle) {
        BigDecimal equity = account.getCurrentBalance();

        if (openPosition != null) {
            // Add unrealized PnL from open position
            BigDecimal currentValue = candle.getClose()
                    .multiply(openPosition.getPositionSize())
                    .setScale(SCALE, RoundingMode.HALF_UP);

            BigDecimal entryValue = openPosition.getEntryPrice()
                    .multiply(openPosition.getPositionSize())
                    .setScale(SCALE, RoundingMode.HALF_UP);

            BigDecimal unrealizedPnL = currentValue.subtract(entryValue);
            equity = equity.add(unrealizedPnL);
        }

        return equity;
    }

    /**
     * Create BacktestResult entity from metrics.
     */
    private BacktestResult createBacktestResult(BacktestConfig config, Account account, MetricsResult metrics) {
        return new BacktestResult(
                "bollinger-band-mean-reversion",
                config.getSymbol(),
                config.getStartDate(),
                config.getEndDate(),
                config.getInitialBalance(),
                account.getCurrentBalance(),
                metrics.getSharpeRatio(),
                metrics.getProfitFactor(),
                metrics.getWinRate(),
                metrics.getMaxDrawdown(),
                metrics.getTotalTrades(),
                BacktestResult.ValidationStatus.PENDING
        );
    }

    /**
     * Validate historical data.
     */
    private void validateHistoricalData(List<OHLCVData> data, BacktestConfig config) {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Historical data cannot be null or empty");
        }

        if (data.size() < LOOKBACK_PERIOD) {
            throw new IllegalArgumentException(
                    "Insufficient historical data: need at least " + LOOKBACK_PERIOD + " candles"
            );
        }

        // Verify data is within config date range
        OHLCVData firstCandle = data.get(0);
        OHLCVData lastCandle = data.get(data.size() - 1);

        if (firstCandle.getTimestamp().isBefore(config.getStartDate())) {
            logger.warn("Historical data starts before config start date");
        }

        if (lastCandle.getTimestamp().isAfter(config.getEndDate())) {
            logger.warn("Historical data ends after config end date");
        }
    }
}
