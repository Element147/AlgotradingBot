package com.algotrader.bot.service;

import com.algotrader.bot.backtest.strategy.BacktestStrategyRegistry;
import com.algotrader.bot.controller.BacktestDetailsResponse;
import com.algotrader.bot.controller.BacktestHistoryItemResponse;
import com.algotrader.bot.controller.BacktestRunResponse;
import com.algotrader.bot.controller.BacktestAlgorithmResponse;
import com.algotrader.bot.controller.RunBacktestRequest;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.repository.BacktestResultRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BacktestManagementService {

    private static final int DEFAULT_HISTORY_LIMIT = 20;
    private static final int MAX_HISTORY_LIMIT = 500;

    private final BacktestResultRepository backtestResultRepository;
    private final BacktestExecutionService backtestExecutionService;
    private final BacktestDatasetService backtestDatasetService;
    private final BacktestStrategyRegistry backtestStrategyRegistry;

    public BacktestManagementService(BacktestResultRepository backtestResultRepository,
                                     BacktestExecutionService backtestExecutionService,
                                     BacktestDatasetService backtestDatasetService,
                                     BacktestStrategyRegistry backtestStrategyRegistry) {
        this.backtestResultRepository = backtestResultRepository;
        this.backtestExecutionService = backtestExecutionService;
        this.backtestDatasetService = backtestDatasetService;
        this.backtestStrategyRegistry = backtestStrategyRegistry;
    }

    @Transactional(readOnly = true)
    public List<BacktestAlgorithmResponse> getAlgorithms() {
        return backtestStrategyRegistry.getDefinitions().stream()
            .map(definition -> new BacktestAlgorithmResponse(
                definition.type().name(),
                definition.label(),
                definition.description(),
                definition.selectionMode().name()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<BacktestHistoryItemResponse> getHistory(int limit) {
        int boundedLimit = sanitizeLimit(limit);
        return backtestResultRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, boundedLimit)).stream()
            .map(this::toHistoryItem)
            .toList();
    }

    @Transactional(readOnly = true)
    public BacktestDetailsResponse getDetails(Long backtestId) {
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

        return toDetails(result);
    }

    @Transactional
    public BacktestRunResponse runBacktest(RunBacktestRequest request) {
        if (!request.startDate().isBefore(request.endDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        if (request.initialBalance().compareTo(new BigDecimal("100.00")) <= 0) {
            throw new IllegalArgumentException("Initial balance must be greater than 100");
        }
        BacktestAlgorithmType algorithmType = BacktestAlgorithmType.from(request.algorithmType());
        var strategyDefinition = backtestStrategyRegistry.getStrategy(algorithmType).definition();

        BacktestDataset dataset = backtestDatasetService.getDataset(request.datasetId());
        String effectiveSymbol = resolveRequestedSymbol(request.symbol(), dataset.getSymbolsCsv(), strategyDefinition.selectionMode());

        BacktestResult pending = new BacktestResult(
            algorithmType.name(),
            effectiveSymbol,
            request.startDate().atStartOfDay(),
            request.endDate().atStartOfDay(),
            request.initialBalance(),
            request.initialBalance(),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0,
            BacktestResult.ValidationStatus.PENDING
        );

        pending.setDatasetId(dataset.getId());
        pending.setDatasetName(dataset.getName());
        pending.setTimeframe(request.timeframe());
        pending.setExecutionStatus(BacktestResult.ExecutionStatus.PENDING);
        pending.setFeesBps(request.feesBps());
        pending.setSlippageBps(request.slippageBps());
        pending.setTimestamp(LocalDateTime.now());

        BacktestResult saved = backtestResultRepository.save(pending);

        backtestExecutionService.executeAsync(saved.getId());

        return new BacktestRunResponse(saved.getId(), saved.getExecutionStatus().name(), saved.getTimestamp());
    }

    private String resolveRequestedSymbol(String requestedSymbol,
                                         String datasetSymbolsCsv,
                                         com.algotrader.bot.backtest.strategy.BacktestStrategySelectionMode selectionMode) {
        if (selectionMode == com.algotrader.bot.backtest.strategy.BacktestStrategySelectionMode.DATASET_UNIVERSE) {
            return datasetSymbolsCsv;
        }

        List<String> supportedSymbols = List.of(datasetSymbolsCsv.split(",")).stream()
            .map(String::trim)
            .filter(symbol -> !symbol.isBlank())
            .toList();

        if (!supportedSymbols.contains(requestedSymbol)) {
            throw new IllegalArgumentException("Selected symbol is not present in dataset: " + requestedSymbol);
        }

        return requestedSymbol;
    }

    private BacktestHistoryItemResponse toHistoryItem(BacktestResult result) {
        return new BacktestHistoryItemResponse(
            result.getId(),
            result.getStrategyId(),
            result.getDatasetName(),
            result.getSymbol(),
            result.getTimeframe(),
            result.getExecutionStatus().name(),
            result.getValidationStatus().name(),
            result.getFeesBps(),
            result.getSlippageBps(),
            result.getTimestamp(),
            result.getInitialBalance(),
            result.getFinalBalance()
        );
    }

    private int sanitizeLimit(int limit) {
        if (limit <= 0) {
            return DEFAULT_HISTORY_LIMIT;
        }
        return Math.min(limit, MAX_HISTORY_LIMIT);
    }

    private BacktestDetailsResponse toDetails(BacktestResult result) {
        return new BacktestDetailsResponse(
            result.getId(),
            result.getStrategyId(),
            result.getDatasetId(),
            result.getDatasetName(),
            result.getSymbol(),
            result.getTimeframe(),
            result.getExecutionStatus().name(),
            result.getValidationStatus().name(),
            result.getInitialBalance(),
            result.getFinalBalance(),
            result.getSharpeRatio(),
            result.getProfitFactor(),
            result.getWinRate(),
            result.getMaxDrawdown(),
            result.getTotalTrades(),
            result.getFeesBps(),
            result.getSlippageBps(),
            result.getStartDate(),
            result.getEndDate(),
            result.getTimestamp(),
            result.getErrorMessage()
        );
    }
}
