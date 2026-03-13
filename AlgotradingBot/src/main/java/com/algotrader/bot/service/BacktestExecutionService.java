package com.algotrader.bot.service;

import com.algotrader.bot.backtest.BacktestSimulationEngine;
import com.algotrader.bot.entity.BacktestEquityPoint;
import com.algotrader.bot.backtest.BacktestSimulationRequest;
import com.algotrader.bot.backtest.BacktestSimulationResult;
import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.entity.BacktestTradeSeriesItem;
import com.algotrader.bot.repository.BacktestResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class BacktestExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(BacktestExecutionService.class);

    private final BacktestResultRepository backtestResultRepository;
    private final BacktestDatasetService backtestDatasetService;
    private final HistoricalDataCsvParser historicalDataCsvParser;
    private final BacktestSimulationEngine backtestSimulationEngine;

    public BacktestExecutionService(BacktestResultRepository backtestResultRepository,
                                    BacktestDatasetService backtestDatasetService,
                                    HistoricalDataCsvParser historicalDataCsvParser,
                                    BacktestSimulationEngine backtestSimulationEngine) {
        this.backtestResultRepository = backtestResultRepository;
        this.backtestDatasetService = backtestDatasetService;
        this.historicalDataCsvParser = historicalDataCsvParser;
        this.backtestSimulationEngine = backtestSimulationEngine;
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
                .filter(candle -> !candle.getTimestamp().isBefore(result.getStartDate()))
                .filter(candle -> !candle.getTimestamp().isAfter(result.getEndDate()))
                .sorted(Comparator.comparing(OHLCVData::getTimestamp))
                .toList();

            BacktestSimulationResult simulationResult = backtestSimulationEngine.simulate(
                BacktestAlgorithmType.from(result.getStrategyId()),
                new BacktestSimulationRequest(
                    filtered,
                    resolvePrimarySymbol(result, dataset.getSymbolsCsv()),
                    result.getTimeframe(),
                    result.getInitialBalance(),
                    result.getFeesBps(),
                    result.getSlippageBps()
                )
            );

            applySimulationResult(result, simulationResult);
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
        result.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);
        result.setErrorMessage(null);
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

    private String resolvePrimarySymbol(BacktestResult result, String datasetSymbolsCsv) {
        List<String> datasetSymbols = parseSymbols(datasetSymbolsCsv);
        if (datasetSymbols.contains(result.getSymbol())) {
            return result.getSymbol();
        }
        return datasetSymbols.stream()
            .findFirst()
            .orElse(result.getSymbol());
    }

    private List<String> parseSymbols(String symbolsCsv) {
        return List.of(symbolsCsv.split(",")).stream()
            .map(String::trim)
            .filter(symbol -> !symbol.isBlank())
            .toList();
    }
}
