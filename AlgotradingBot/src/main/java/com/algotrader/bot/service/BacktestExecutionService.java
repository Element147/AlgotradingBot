package com.algotrader.bot.service;

import com.algotrader.bot.backtest.BacktestSimulationEngine;
import com.algotrader.bot.backtest.BacktestSimulationProgress;
import com.algotrader.bot.backtest.BacktestSimulationRequest;
import com.algotrader.bot.backtest.BacktestSimulationResult;
import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestEquityPoint;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.entity.BacktestTradeSeriesItem;
import com.algotrader.bot.repository.BacktestResultRepository;
import com.algotrader.bot.websocket.WebSocketEventPublisher;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class BacktestExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(BacktestExecutionService.class);
    private static final int PREPARATION_PROGRESS_PERCENT = 20;
    private static final int PERSISTING_PROGRESS_PERCENT = 98;

    private final BacktestResultRepository backtestResultRepository;
    private final BacktestDatasetService backtestDatasetService;
    private final BacktestDatasetCandleCache backtestDatasetCandleCache;
    private final BacktestSimulationEngine backtestSimulationEngine;
    private final WebSocketEventPublisher webSocketEventPublisher;
    private final TransactionTemplate transactionTemplate;

    public BacktestExecutionService(BacktestResultRepository backtestResultRepository,
                                    BacktestDatasetService backtestDatasetService,
                                    BacktestDatasetCandleCache backtestDatasetCandleCache,
                                    BacktestSimulationEngine backtestSimulationEngine,
                                    WebSocketEventPublisher webSocketEventPublisher,
                                    PlatformTransactionManager transactionManager) {
        this.backtestResultRepository = backtestResultRepository;
        this.backtestDatasetService = backtestDatasetService;
        this.backtestDatasetCandleCache = backtestDatasetCandleCache;
        this.backtestSimulationEngine = backtestSimulationEngine;
        this.webSocketEventPublisher = webSocketEventPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Async("virtualThreadTaskExecutor")
    public CompletableFuture<Void> executeAsync(Long backtestId) {
        BacktestExecutionContext context = markRunStarted(backtestId);

        try {
            logger.info(
                "Backtest {} started: strategy={}, datasetId={}, symbol={}, timeframe={}, range={} to {}",
                backtestId,
                context.strategyId(),
                context.datasetId(),
                context.symbol(),
                context.timeframe(),
                context.startDate(),
                context.endDate()
            );

            updateProgress(
                backtestId,
                BacktestResult.ExecutionStage.LOADING_DATASET,
                5,
                0,
                0,
                null,
                "Loading dataset bytes from the catalog."
            );

            BacktestDataset dataset = backtestDatasetService.getDataset(context.datasetId());
            logger.info(
                "Backtest {} loading dataset {} ({}, {} rows, symbols={})",
                backtestId,
                dataset.getId(),
                dataset.getName(),
                dataset.getRowCount(),
                dataset.getSymbolsCsv()
            );

            List<OHLCVData> candles = backtestDatasetCandleCache.getOrParse(dataset);
            logger.info("Backtest {} parsed {} raw candles from dataset {}", backtestId, candles.size(), dataset.getId());

            updateProgress(
                backtestId,
                BacktestResult.ExecutionStage.FILTERING_CANDLES,
                12,
                0,
                candles.size(),
                null,
                "Filtering candles into the requested time window."
            );

            List<OHLCVData> filtered = candles.stream()
                .filter(candle -> !candle.getTimestamp().isBefore(context.startDate()))
                .filter(candle -> !candle.getTimestamp().isAfter(context.endDate()))
                .sorted(Comparator.comparing(OHLCVData::getTimestamp))
                .toList();

            LocalDateTime firstFilteredTimestamp = filtered.isEmpty() ? null : filtered.get(0).getTimestamp();
            LocalDateTime lastFilteredTimestamp = filtered.isEmpty() ? null : filtered.get(filtered.size() - 1).getTimestamp();
            logger.info(
                "Backtest {} prepared {} filtered candles between {} and {}",
                backtestId,
                filtered.size(),
                firstFilteredTimestamp,
                lastFilteredTimestamp
            );

            updateProgress(
                backtestId,
                BacktestResult.ExecutionStage.SIMULATING,
                PREPARATION_PROGRESS_PERCENT,
                0,
                filtered.size(),
                firstFilteredTimestamp,
                filtered.isEmpty()
                    ? "No candles remain after filtering."
                    : "Simulation started. Replaying historical candles."
            );

            AtomicInteger lastLoggedMilestone = new AtomicInteger(-1);
            BacktestSimulationResult simulationResult = backtestSimulationEngine.simulate(
                BacktestAlgorithmType.from(context.strategyId()),
                new BacktestSimulationRequest(
                    filtered,
                    resolvePrimarySymbol(context.symbol(), dataset.getSymbolsCsv()),
                    context.timeframe(),
                    context.initialBalance(),
                    context.feesBps(),
                    context.slippageBps()
                ),
                progress -> onSimulationProgress(backtestId, progress, lastLoggedMilestone)
            );

            updateProgress(
                backtestId,
                BacktestResult.ExecutionStage.PERSISTING_RESULTS,
                PERSISTING_PROGRESS_PERCENT,
                filtered.size(),
                filtered.size(),
                lastFilteredTimestamp,
                "Simulation loop finished. Persisting metrics, equity curve, and trade series."
            );

            persistCompletedResult(backtestId, simulationResult, filtered.size(), lastFilteredTimestamp);
            logger.info(
                "Backtest {} completed: finalBalance={}, trades={}, sharpe={}, profitFactor={}, maxDrawdown={}",
                backtestId,
                simulationResult.finalBalance(),
                simulationResult.totalTrades(),
                simulationResult.sharpeRatio(),
                simulationResult.profitFactor(),
                simulationResult.maxDrawdownPercent()
            );
        } catch (Exception exception) {
            logger.error("Backtest execution failed for id {}", backtestId, exception);
            markRunFailed(backtestId, exception);
        }

        return CompletableFuture.completedFuture(null);
    }

    private BacktestExecutionContext markRunStarted(Long backtestId) {
        return transactionTemplate.execute(status -> {
            BacktestResult result = backtestResultRepository.findById(backtestId)
                .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

            LocalDateTime now = LocalDateTime.now();
            result.setExecutionStatus(BacktestResult.ExecutionStatus.RUNNING);
            result.setExecutionStage(BacktestResult.ExecutionStage.VALIDATING_REQUEST);
            result.setStartedAt(now);
            result.setLastProgressAt(now);
            result.setProgressPercent(2);
            result.setProcessedCandles(0);
            result.setTotalCandles(0);
            result.setCurrentDataTimestamp(null);
            result.setStatusMessage("Validation passed. Preparing execution.");
            result.setErrorMessage(null);
            backtestResultRepository.saveAndFlush(result);
            publishProgress(result);

            return new BacktestExecutionContext(
                result.getId(),
                result.getStrategyId(),
                result.getDatasetId(),
                result.getSymbol(),
                result.getTimeframe(),
                result.getStartDate(),
                result.getEndDate(),
                result.getInitialBalance(),
                result.getFeesBps(),
                result.getSlippageBps()
            );
        });
    }

    private void onSimulationProgress(Long backtestId,
                                      BacktestSimulationProgress progress,
                                      AtomicInteger lastLoggedMilestone) {
        int overallProgress = mapSimulationProgressToOverall(progress.processedCandles(), progress.totalCandles());
        String statusMessage = progress.processedCandles() >= progress.totalCandles()
            ? "Simulation loop finished. Computing final metrics."
            : "Replaying candle " + progress.processedCandles() + " of " + progress.totalCandles() + ".";

        updateProgress(
            backtestId,
            BacktestResult.ExecutionStage.SIMULATING,
            overallProgress,
            progress.processedCandles(),
            progress.totalCandles(),
            progress.currentTimestamp(),
            statusMessage
        );

        int milestone = progress.totalCandles() <= 0
            ? 100
            : (int) Math.floor((progress.processedCandles() * 100.0) / progress.totalCandles() / 10.0) * 10;
        if (progress.processedCandles() == progress.totalCandles()
            || (milestone >= 0 && lastLoggedMilestone.getAndSet(milestone) != milestone && milestone % 10 == 0)) {
            logger.info(
                "Backtest {} progress: {}% ({} / {}) current candle={}",
                backtestId,
                overallProgress,
                progress.processedCandles(),
                progress.totalCandles(),
                progress.currentTimestamp()
            );
        }
    }

    private void updateProgress(Long backtestId,
                                BacktestResult.ExecutionStage executionStage,
                                int progressPercent,
                                int processedCandles,
                                int totalCandles,
                                LocalDateTime currentDataTimestamp,
                                String statusMessage) {
        transactionTemplate.executeWithoutResult(status -> {
            BacktestResult result = backtestResultRepository.findById(backtestId)
                .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

            result.setExecutionStage(executionStage);
            result.setProgressPercent(Math.max(0, Math.min(progressPercent, 100)));
            result.setProcessedCandles(Math.max(processedCandles, 0));
            result.setTotalCandles(Math.max(totalCandles, 0));
            result.setCurrentDataTimestamp(currentDataTimestamp);
            result.setStatusMessage(statusMessage);
            result.setLastProgressAt(LocalDateTime.now());
            backtestResultRepository.saveAndFlush(result);
            publishProgress(result);
        });
    }

    private void persistCompletedResult(Long backtestId,
                                        BacktestSimulationResult simulationResult,
                                        int totalCandles,
                                        LocalDateTime currentDataTimestamp) {
        transactionTemplate.executeWithoutResult(status -> {
            BacktestResult result = backtestResultRepository.findById(backtestId)
                .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

            applySimulationResult(result, simulationResult);
            LocalDateTime now = LocalDateTime.now();
            result.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);
            result.setExecutionStage(BacktestResult.ExecutionStage.COMPLETED);
            result.setProgressPercent(100);
            result.setProcessedCandles(totalCandles);
            result.setTotalCandles(totalCandles);
            result.setCurrentDataTimestamp(currentDataTimestamp);
            result.setStatusMessage("Backtest completed. Metrics and trade series are ready to review.");
            result.setLastProgressAt(now);
            result.setCompletedAt(now);
            result.setErrorMessage(null);
            backtestResultRepository.saveAndFlush(result);
            publishProgress(result);
        });
    }

    private void markRunFailed(Long backtestId, Exception exception) {
        transactionTemplate.executeWithoutResult(status -> {
            BacktestResult result = backtestResultRepository.findById(backtestId)
                .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

            LocalDateTime now = LocalDateTime.now();
            result.setExecutionStatus(BacktestResult.ExecutionStatus.FAILED);
            result.setExecutionStage(BacktestResult.ExecutionStage.FAILED);
            result.setValidationStatus(BacktestResult.ValidationStatus.FAILED);
            result.setStatusMessage("Execution failed: " + exception.getMessage());
            result.setErrorMessage(exception.getMessage());
            result.setLastProgressAt(now);
            result.setCompletedAt(now);
            backtestResultRepository.saveAndFlush(result);
            publishProgress(result);
        });
    }

    private void publishProgress(BacktestResult result) {
        webSocketEventPublisher.publishBacktestProgress(
            "test",
            result.getId(),
            result.getExecutionStatus().name(),
            result.getExecutionStage().name(),
            result.getProgressPercent(),
            result.getProcessedCandles(),
            result.getTotalCandles(),
            result.getCurrentDataTimestamp(),
            result.getLastProgressAt(),
            result.getStatusMessage()
        );
    }

    private int mapSimulationProgressToOverall(int processedCandles, int totalCandles) {
        if (totalCandles <= 0) {
            return PREPARATION_PROGRESS_PERCENT;
        }
        double ratio = Math.min(1.0, Math.max(0.0, processedCandles / (double) totalCandles));
        return PREPARATION_PROGRESS_PERCENT + (int) Math.round(ratio * (PERSISTING_PROGRESS_PERCENT - PREPARATION_PROGRESS_PERCENT - 3));
    }

    private void applySimulationResult(BacktestResult result, BacktestSimulationResult simulationResult) {
        result.setFinalBalance(simulationResult.finalBalance());
        result.setSharpeRatio(simulationResult.sharpeRatio());
        result.setProfitFactor(simulationResult.profitFactor());
        result.setWinRate(simulationResult.winRatePercent());
        result.setMaxDrawdown(simulationResult.maxDrawdownPercent());
        result.setTotalTrades(simulationResult.totalTrades());
        result.setValidationStatus(isPassed(simulationResult)
            ? BacktestResult.ValidationStatus.PASSED
            : BacktestResult.ValidationStatus.FAILED);
        result.replaceEquityPoints(simulationResult.equitySeries().stream().map(sample -> {
            BacktestEquityPoint point = new BacktestEquityPoint();
            point.setPointTimestamp(sample.timestamp());
            point.setEquity(sample.equity());
            point.setDrawdownPct(sample.drawdownPct());
            return point;
        }).toList());
        result.replaceTradeSeries(simulationResult.tradeSeries().stream().map(sample -> {
            BacktestTradeSeriesItem item = new BacktestTradeSeriesItem();
            item.setSymbol(sample.symbol());
            item.setPositionSide(sample.side());
            item.setEntryTime(sample.entryTime());
            item.setExitTime(sample.exitTime());
            item.setEntryPrice(sample.entryPrice());
            item.setExitPrice(sample.exitPrice());
            item.setQuantity(sample.quantity());
            item.setEntryValue(sample.entryValue());
            item.setExitValue(sample.exitValue());
            item.setReturnPct(sample.returnPct());
            return item;
        }).toList());
    }

    private boolean isPassed(BacktestSimulationResult simulationResult) {
        return simulationResult.sharpeRatio().compareTo(BigDecimal.ONE) >= 0
            && simulationResult.profitFactor().compareTo(new BigDecimal("1.5")) >= 0
            && simulationResult.maxDrawdownPercent().compareTo(new BigDecimal("25")) < 0;
    }

    private String resolvePrimarySymbol(String requestedSymbol, String datasetSymbolsCsv) {
        List<String> datasetSymbols = parseSymbols(datasetSymbolsCsv);
        if (datasetSymbols.contains(requestedSymbol)) {
            return requestedSymbol;
        }
        return datasetSymbols.stream()
            .findFirst()
            .orElse(requestedSymbol);
    }

    private List<String> parseSymbols(String symbolsCsv) {
        return List.of(symbolsCsv.split(",")).stream()
            .map(String::trim)
            .filter(symbol -> !symbol.isBlank())
            .toList();
    }

    private record BacktestExecutionContext(
        Long backtestId,
        String strategyId,
        Long datasetId,
        String symbol,
        String timeframe,
        LocalDateTime startDate,
        LocalDateTime endDate,
        BigDecimal initialBalance,
        Integer feesBps,
        Integer slippageBps
    ) {
    }
}
