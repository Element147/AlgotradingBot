package com.algotrader.bot.service;

import com.algotrader.bot.controller.BacktestDetailsResponse;
import com.algotrader.bot.controller.BacktestHistoryItemResponse;
import com.algotrader.bot.controller.BacktestRunResponse;
import com.algotrader.bot.controller.RunBacktestRequest;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.repository.BacktestResultRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BacktestManagementService {

    private final BacktestResultRepository backtestResultRepository;
    private final BacktestExecutionService backtestExecutionService;
    private final BacktestDatasetService backtestDatasetService;

    public BacktestManagementService(BacktestResultRepository backtestResultRepository,
                                     BacktestExecutionService backtestExecutionService,
                                     BacktestDatasetService backtestDatasetService) {
        this.backtestResultRepository = backtestResultRepository;
        this.backtestExecutionService = backtestExecutionService;
        this.backtestDatasetService = backtestDatasetService;
    }

    @Transactional(readOnly = true)
    public List<BacktestHistoryItemResponse> getHistory(int limit) {
        return backtestResultRepository.findAllByOrderByTimestampDesc().stream()
            .limit(limit)
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
        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        if (request.getInitialBalance().compareTo(new BigDecimal("100.00")) <= 0) {
            throw new IllegalArgumentException("Initial balance must be greater than 100");
        }
        BacktestAlgorithmType.from(request.getAlgorithmType());

        BacktestDataset dataset = backtestDatasetService.getDataset(request.getDatasetId());

        BacktestResult pending = new BacktestResult(
            request.getAlgorithmType().trim().toUpperCase(),
            request.getSymbol(),
            request.getStartDate().atStartOfDay(),
            request.getEndDate().atStartOfDay(),
            request.getInitialBalance(),
            request.getInitialBalance(),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0,
            BacktestResult.ValidationStatus.PENDING
        );

        pending.setDatasetId(dataset.getId());
        pending.setDatasetName(dataset.getName());
        pending.setTimeframe(request.getTimeframe());
        pending.setExecutionStatus(BacktestResult.ExecutionStatus.PENDING);
        pending.setFeesBps(request.getFeesBps());
        pending.setSlippageBps(request.getSlippageBps());
        pending.setTimestamp(LocalDateTime.now());

        BacktestResult saved = backtestResultRepository.save(pending);

        backtestExecutionService.executeAsync(saved.getId());

        return new BacktestRunResponse(saved.getId(), saved.getExecutionStatus().name(), saved.getTimestamp());
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
