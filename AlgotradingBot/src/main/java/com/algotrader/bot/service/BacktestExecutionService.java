package com.algotrader.bot.service;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.repository.BacktestResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class BacktestExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(BacktestExecutionService.class);
    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);

    private final BacktestResultRepository backtestResultRepository;
    private final BacktestDatasetService backtestDatasetService;
    private final HistoricalDataCsvParser historicalDataCsvParser;

    public BacktestExecutionService(BacktestResultRepository backtestResultRepository,
                                    BacktestDatasetService backtestDatasetService,
                                    HistoricalDataCsvParser historicalDataCsvParser) {
        this.backtestResultRepository = backtestResultRepository;
        this.backtestDatasetService = backtestDatasetService;
        this.historicalDataCsvParser = historicalDataCsvParser;
    }

    @Async
    @Transactional
    public CompletableFuture<Void> executeAsync(Long backtestId) {
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new IllegalArgumentException("Backtest not found: " + backtestId));

        try {
            result.setExecutionStatus(BacktestResult.ExecutionStatus.RUNNING);
            backtestResultRepository.save(result);

            BacktestDataset dataset = backtestDatasetService.getDataset(result.getDatasetId());
            List<OHLCVData> candles = historicalDataCsvParser.parse(dataset.getCsvData());
            List<OHLCVData> filtered = candles.stream()
                .filter(c -> c.getSymbol().equalsIgnoreCase(result.getSymbol()))
                .filter(c -> !c.getTimestamp().isBefore(result.getStartDate()))
                .filter(c -> !c.getTimestamp().isAfter(result.getEndDate()))
                .sorted(Comparator.comparing(OHLCVData::getTimestamp))
                .toList();

            if (filtered.size() < 20) {
                throw new IllegalArgumentException("Not enough candles for selected symbol/date range. Need at least 20 rows.");
            }

            SimulationMetrics metrics = simulate(result.getStrategyId(), filtered, result.getInitialBalance(),
                result.getFeesBps(), result.getSlippageBps());

            result.setFinalBalance(metrics.finalBalance());
            result.setSharpeRatio(metrics.sharpeRatio());
            result.setProfitFactor(metrics.profitFactor());
            result.setWinRate(metrics.winRatePercent());
            result.setMaxDrawdown(metrics.maxDrawdownPercent());
            result.setTotalTrades(metrics.totalTrades());

            boolean passed = metrics.sharpeRatio().compareTo(BigDecimal.ONE) >= 0
                && metrics.profitFactor().compareTo(new BigDecimal("1.5")) >= 0
                && metrics.maxDrawdownPercent().compareTo(new BigDecimal("25")) < 0;

            result.setValidationStatus(passed ? BacktestResult.ValidationStatus.PASSED : BacktestResult.ValidationStatus.FAILED);
            result.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);
            result.setErrorMessage(null);

            backtestResultRepository.save(result);
        } catch (Exception exception) {
            logger.error("Backtest execution failed for id {}", backtestId, exception);
            result.setExecutionStatus(BacktestResult.ExecutionStatus.FAILED);
            result.setValidationStatus(BacktestResult.ValidationStatus.FAILED);
            result.setErrorMessage(exception.getMessage());
            backtestResultRepository.save(result);
        }

        return CompletableFuture.completedFuture(null);
    }

    private SimulationMetrics simulate(String algorithmType,
                                       List<OHLCVData> candles,
                                       BigDecimal initialBalance,
                                       Integer feesBps,
                                       Integer slippageBps) {
        BacktestAlgorithmType algorithm = BacktestAlgorithmType.from(algorithmType);
        BigDecimal costRate = BigDecimal.valueOf(feesBps + slippageBps)
            .divide(BigDecimal.valueOf(10000), MC);

        BigDecimal cash = initialBalance;
        BigDecimal quantity = BigDecimal.ZERO;
        BigDecimal entryValue = BigDecimal.ZERO;
        List<BigDecimal> tradeReturns = new ArrayList<>();
        List<BigDecimal> equityCurve = new ArrayList<>();
        equityCurve.add(initialBalance);

        boolean inPosition = false;
        int winningTrades = 0;

        for (int i = 0; i < candles.size(); i++) {
            OHLCVData candle = candles.get(i);
            BigDecimal close = candle.getClose();

            boolean buySignal = shouldBuy(algorithm, candles, i, inPosition);
            boolean sellSignal = shouldSell(algorithm, candles, i, inPosition);

            if (!inPosition && buySignal) {
                BigDecimal effectiveBuy = close.multiply(BigDecimal.ONE.add(costRate), MC);
                quantity = cash.divide(effectiveBuy, 8, RoundingMode.HALF_UP);
                entryValue = quantity.multiply(effectiveBuy, MC);
                cash = BigDecimal.ZERO;
                inPosition = true;
            } else if (inPosition && sellSignal) {
                BigDecimal effectiveSell = close.multiply(BigDecimal.ONE.subtract(costRate), MC);
                BigDecimal exitValue = quantity.multiply(effectiveSell, MC);
                cash = exitValue;

                BigDecimal tradeReturn = exitValue.subtract(entryValue).divide(entryValue, MC);
                tradeReturns.add(tradeReturn);
                if (tradeReturn.compareTo(BigDecimal.ZERO) > 0) {
                    winningTrades++;
                }

                quantity = BigDecimal.ZERO;
                entryValue = BigDecimal.ZERO;
                inPosition = false;
            }

            BigDecimal equity = inPosition ? quantity.multiply(close, MC) : cash;
            equityCurve.add(equity);
        }

        if (inPosition) {
            BigDecimal lastClose = candles.get(candles.size() - 1).getClose();
            BigDecimal effectiveSell = lastClose.multiply(BigDecimal.ONE.subtract(costRate), MC);
            BigDecimal exitValue = quantity.multiply(effectiveSell, MC);
            cash = exitValue;

            BigDecimal tradeReturn = exitValue.subtract(entryValue).divide(entryValue, MC);
            tradeReturns.add(tradeReturn);
            if (tradeReturn.compareTo(BigDecimal.ZERO) > 0) {
                winningTrades++;
            }
            equityCurve.add(cash);
        }

        int totalTrades = tradeReturns.size();
        BigDecimal finalBalance = cash.max(BigDecimal.ONE).setScale(8, RoundingMode.HALF_UP);
        BigDecimal winRatePercent = totalTrades == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(winningTrades)
                .multiply(BigDecimal.valueOf(100), MC)
                .divide(BigDecimal.valueOf(totalTrades), 2, RoundingMode.HALF_UP);

        BigDecimal profitFactor = calculateProfitFactor(tradeReturns);
        BigDecimal maxDrawdownPercent = calculateMaxDrawdownPercent(equityCurve);
        BigDecimal sharpeRatio = calculateSharpeRatio(tradeReturns).setScale(4, RoundingMode.HALF_UP);

        return new SimulationMetrics(
            finalBalance,
            sharpeRatio,
            profitFactor.setScale(4, RoundingMode.HALF_UP),
            winRatePercent,
            maxDrawdownPercent.setScale(2, RoundingMode.HALF_UP),
            totalTrades
        );
    }

    private boolean shouldBuy(BacktestAlgorithmType algorithm, List<OHLCVData> candles, int i, boolean inPosition) {
        if (inPosition || i < 20) {
            return false;
        }

        return switch (algorithm) {
            case BUY_AND_HOLD -> i == 20;
            case BOLLINGER_BANDS -> {
                BigDecimal lower = bollingerLower(candles, i, 20, new BigDecimal("2.0"));
                yield candles.get(i).getClose().compareTo(lower) < 0;
            }
            case SMA_CROSSOVER -> {
                if (i < 31) {
                    yield false;
                }
                BigDecimal fastPrev = sma(candles, i - 1, 10);
                BigDecimal slowPrev = sma(candles, i - 1, 30);
                BigDecimal fastNow = sma(candles, i, 10);
                BigDecimal slowNow = sma(candles, i, 30);
                yield fastPrev.compareTo(slowPrev) <= 0 && fastNow.compareTo(slowNow) > 0;
            }
        };
    }

    private boolean shouldSell(BacktestAlgorithmType algorithm, List<OHLCVData> candles, int i, boolean inPosition) {
        if (!inPosition || i < 20) {
            return false;
        }

        return switch (algorithm) {
            case BUY_AND_HOLD -> i == candles.size() - 1;
            case BOLLINGER_BANDS -> {
                BigDecimal middle = sma(candles, i, 20);
                yield candles.get(i).getClose().compareTo(middle) > 0;
            }
            case SMA_CROSSOVER -> {
                if (i < 31) {
                    yield false;
                }
                BigDecimal fastPrev = sma(candles, i - 1, 10);
                BigDecimal slowPrev = sma(candles, i - 1, 30);
                BigDecimal fastNow = sma(candles, i, 10);
                BigDecimal slowNow = sma(candles, i, 30);
                yield fastPrev.compareTo(slowPrev) >= 0 && fastNow.compareTo(slowNow) < 0;
            }
        };
    }

    private BigDecimal sma(List<OHLCVData> candles, int endIndex, int period) {
        BigDecimal sum = BigDecimal.ZERO;
        for (int i = endIndex - period + 1; i <= endIndex; i++) {
            sum = sum.add(candles.get(i).getClose(), MC);
        }
        return sum.divide(BigDecimal.valueOf(period), MC);
    }

    private BigDecimal bollingerLower(List<OHLCVData> candles, int endIndex, int period, BigDecimal multiplier) {
        BigDecimal mean = sma(candles, endIndex, period);
        BigDecimal variance = BigDecimal.ZERO;

        for (int i = endIndex - period + 1; i <= endIndex; i++) {
            BigDecimal delta = candles.get(i).getClose().subtract(mean, MC);
            variance = variance.add(delta.multiply(delta, MC), MC);
        }

        BigDecimal stdDev = sqrt(variance.divide(BigDecimal.valueOf(period), MC));
        return mean.subtract(stdDev.multiply(multiplier, MC), MC);
    }

    private BigDecimal calculateProfitFactor(List<BigDecimal> tradeReturns) {
        BigDecimal gains = BigDecimal.ZERO;
        BigDecimal losses = BigDecimal.ZERO;

        for (BigDecimal tradeReturn : tradeReturns) {
            if (tradeReturn.compareTo(BigDecimal.ZERO) > 0) {
                gains = gains.add(tradeReturn, MC);
            } else if (tradeReturn.compareTo(BigDecimal.ZERO) < 0) {
                losses = losses.add(tradeReturn.abs(), MC);
            }
        }

        if (losses.compareTo(BigDecimal.ZERO) == 0) {
            return gains.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal("999.99") : BigDecimal.ZERO;
        }

        return gains.divide(losses, MC);
    }

    private BigDecimal calculateMaxDrawdownPercent(List<BigDecimal> equityCurve) {
        BigDecimal peak = equityCurve.get(0);
        BigDecimal maxDrawdown = BigDecimal.ZERO;

        for (BigDecimal equity : equityCurve) {
            if (equity.compareTo(peak) > 0) {
                peak = equity;
            }
            BigDecimal drawdown = peak.subtract(equity, MC)
                .divide(peak, MC)
                .multiply(BigDecimal.valueOf(100), MC);
            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        return maxDrawdown;
    }

    private BigDecimal calculateSharpeRatio(List<BigDecimal> tradeReturns) {
        if (tradeReturns.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal mean = tradeReturns.stream()
            .reduce(BigDecimal.ZERO, (a, b) -> a.add(b, MC))
            .divide(BigDecimal.valueOf(tradeReturns.size()), MC);

        BigDecimal variance = BigDecimal.ZERO;
        for (BigDecimal r : tradeReturns) {
            BigDecimal d = r.subtract(mean, MC);
            variance = variance.add(d.multiply(d, MC), MC);
        }

        variance = variance.divide(BigDecimal.valueOf(tradeReturns.size() - 1), MC);
        if (variance.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal stdDev = sqrt(variance);
        return mean.divide(stdDev, MC).multiply(new BigDecimal("15.874507866"), MC);
    }

    private BigDecimal sqrt(BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal x = value;
        BigDecimal last;
        do {
            last = x;
            x = x.add(value.divide(x, MC), MC).divide(BigDecimal.valueOf(2), MC);
        } while (x.subtract(last).abs().compareTo(new BigDecimal("0.00000001")) > 0);

        return x;
    }

    private record SimulationMetrics(
        BigDecimal finalBalance,
        BigDecimal sharpeRatio,
        BigDecimal profitFactor,
        BigDecimal winRatePercent,
        BigDecimal maxDrawdownPercent,
        int totalTrades
    ) {
    }
}
