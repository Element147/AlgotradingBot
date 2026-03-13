package com.algotrader.bot.service;

import com.algotrader.bot.backtest.strategy.BacktestStrategyRegistry;
import com.algotrader.bot.controller.BacktestComparisonItemResponse;
import com.algotrader.bot.controller.BacktestComparisonResponse;
import com.algotrader.bot.controller.BacktestDetailsResponse;
import com.algotrader.bot.controller.BacktestExperimentSummaryResponse;
import com.algotrader.bot.controller.BacktestEquityPointResponse;
import com.algotrader.bot.controller.BacktestHistoryItemResponse;
import com.algotrader.bot.controller.BacktestRunResponse;
import com.algotrader.bot.controller.BacktestAlgorithmResponse;
import com.algotrader.bot.controller.BacktestTradeSeriesItemResponse;
import com.algotrader.bot.controller.RunBacktestRequest;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import com.algotrader.bot.repository.BacktestResultRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BacktestManagementService {

    private static final Logger logger = LoggerFactory.getLogger(BacktestManagementService.class);
    private static final int DEFAULT_HISTORY_LIMIT = 20;
    private static final int MAX_HISTORY_LIMIT = 500;
    private static final String DATASET_UNIVERSE_LABEL = "DATASET_UNIVERSE";

    private final BacktestResultRepository backtestResultRepository;
    private final BacktestDatasetRepository backtestDatasetRepository;
    private final BacktestExecutionService backtestExecutionService;
    private final BacktestDatasetService backtestDatasetService;
    private final BacktestStrategyRegistry backtestStrategyRegistry;
    private final OperatorAuditService operatorAuditService;

    public BacktestManagementService(BacktestResultRepository backtestResultRepository,
                                     BacktestDatasetRepository backtestDatasetRepository,
                                     BacktestExecutionService backtestExecutionService,
                                     BacktestDatasetService backtestDatasetService,
                                     BacktestStrategyRegistry backtestStrategyRegistry,
                                     OperatorAuditService operatorAuditService) {
        this.backtestResultRepository = backtestResultRepository;
        this.backtestDatasetRepository = backtestDatasetRepository;
        this.backtestExecutionService = backtestExecutionService;
        this.backtestDatasetService = backtestDatasetService;
        this.backtestStrategyRegistry = backtestStrategyRegistry;
        this.operatorAuditService = operatorAuditService;
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
    public List<BacktestExperimentSummaryResponse> getExperimentSummaries() {
        Map<String, List<BacktestResult>> grouped = new LinkedHashMap<>();

        backtestResultRepository.findAllByOrderByTimestampDesc().forEach(result -> grouped
            .computeIfAbsent(resolveExperimentKey(result), ignored -> new ArrayList<>())
            .add(result));

        return grouped.entrySet().stream()
            .map(entry -> toExperimentSummary(entry.getKey(), entry.getValue()))
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
        backtestDatasetService.validateDatasetAvailableForNewRuns(request.datasetId());
        BacktestAlgorithmType algorithmType = BacktestAlgorithmType.from(request.algorithmType());
        var strategyDefinition = backtestStrategyRegistry.getStrategy(algorithmType).definition();

        BacktestDataset dataset = backtestDatasetService.getDataset(request.datasetId());
        String effectiveSymbol = resolveRequestedSymbol(request.symbol(), dataset.getSymbolsCsv(), strategyDefinition.selectionMode());
        String experimentName = resolveRequestedExperimentName(
            request.experimentName(),
            algorithmType.name(),
            dataset.getName(),
            effectiveSymbol,
            request.timeframe(),
            strategyDefinition.selectionMode()
        );

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
        pending.setExperimentName(experimentName);
        pending.setExperimentKey(normalizeExperimentKey(experimentName));
        pending.setTimeframe(request.timeframe());
        pending.setExecutionStatus(BacktestResult.ExecutionStatus.PENDING);
        pending.setExecutionStage(BacktestResult.ExecutionStage.QUEUED);
        pending.setProgressPercent(0);
        pending.setProcessedCandles(0);
        pending.setTotalCandles(0);
        pending.setCurrentDataTimestamp(null);
        pending.setStatusMessage("Queued. Waiting for the backtest worker to start.");
        pending.setLastProgressAt(LocalDateTime.now());
        pending.setStartedAt(null);
        pending.setCompletedAt(null);
        pending.setFeesBps(request.feesBps());
        pending.setSlippageBps(request.slippageBps());
        pending.setTimestamp(LocalDateTime.now());

        BacktestResult saved = backtestResultRepository.save(pending);
        logger.info(
            "Queued backtest {}: strategy={}, datasetId={}, symbol={}, timeframe={}, experiment={}",
            saved.getId(),
            saved.getStrategyId(),
            saved.getDatasetId(),
            saved.getSymbol(),
            saved.getTimeframe(),
            saved.getExperimentName()
        );

        backtestExecutionService.executeAsync(saved.getId());
        operatorAuditService.recordSuccess(
            "BACKTEST_RUN_STARTED",
            "test",
            "BACKTEST",
            String.valueOf(saved.getId()),
            "strategy=" + saved.getStrategyId() + ", datasetId=" + saved.getDatasetId()
        );

        return new BacktestRunResponse(saved.getId(), saved.getExecutionStatus().name(), saved.getTimestamp());
    }

    @Transactional
    public BacktestRunResponse replayBacktest(Long backtestId) {
        BacktestResult existing = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

        if (existing.getDatasetId() == null) {
            throw new IllegalArgumentException("Replay requires a dataset-backed backtest");
        }

        BacktestDataset dataset = backtestDatasetService.getDataset(existing.getDatasetId());

        BacktestResult pending = new BacktestResult(
            existing.getStrategyId(),
            existing.getSymbol(),
            existing.getStartDate(),
            existing.getEndDate(),
            existing.getInitialBalance(),
            existing.getInitialBalance(),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0,
            BacktestResult.ValidationStatus.PENDING
        );

        pending.setDatasetId(dataset.getId());
        pending.setDatasetName(dataset.getName());
        pending.setExperimentName(resolveExperimentName(existing));
        pending.setExperimentKey(resolveExperimentKey(existing));
        pending.setTimeframe(existing.getTimeframe());
        pending.setExecutionStatus(BacktestResult.ExecutionStatus.PENDING);
        pending.setExecutionStage(BacktestResult.ExecutionStage.QUEUED);
        pending.setProgressPercent(0);
        pending.setProcessedCandles(0);
        pending.setTotalCandles(0);
        pending.setCurrentDataTimestamp(null);
        pending.setStatusMessage("Replay queued. Waiting for the backtest worker to start.");
        pending.setLastProgressAt(LocalDateTime.now());
        pending.setStartedAt(null);
        pending.setCompletedAt(null);
        pending.setFeesBps(existing.getFeesBps());
        pending.setSlippageBps(existing.getSlippageBps());
        pending.setTimestamp(LocalDateTime.now());

        BacktestResult saved = backtestResultRepository.save(pending);
        logger.info(
            "Queued replay backtest {} from source {} using dataset {}",
            saved.getId(),
            backtestId,
            dataset.getId()
        );
        backtestExecutionService.executeAsync(saved.getId());
        operatorAuditService.recordSuccess(
            "BACKTEST_REPLAY_STARTED",
            "test",
            "BACKTEST",
            String.valueOf(saved.getId()),
            "sourceBacktestId=" + backtestId + ", datasetId=" + dataset.getId()
        );

        return new BacktestRunResponse(saved.getId(), saved.getExecutionStatus().name(), saved.getTimestamp());
    }

    @Transactional
    public void deleteBacktest(Long backtestId) {
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

        if (result.getExecutionStatus() == BacktestResult.ExecutionStatus.PENDING
            || result.getExecutionStatus() == BacktestResult.ExecutionStatus.RUNNING) {
            throw new IllegalStateException("Active backtests cannot be deleted while execution is still in progress");
        }

        backtestResultRepository.delete(result);
        logger.info("Deleted backtest {} ({})", backtestId, result.getExperimentName());
        operatorAuditService.recordSuccess(
            "BACKTEST_DELETED",
            "test",
            "BACKTEST",
            String.valueOf(backtestId),
            "strategy=" + result.getStrategyId() + ", datasetId=" + result.getDatasetId()
        );
    }

    @Transactional(readOnly = true)
    public BacktestComparisonResponse compareBacktests(List<Long> requestedIds) {
        if (requestedIds == null || requestedIds.size() < 2) {
            throw new IllegalArgumentException("At least two backtest IDs are required for comparison");
        }

        List<Long> orderedIds = requestedIds.stream()
            .filter(id -> id != null && id > 0)
            .collect(Collectors.collectingAndThen(Collectors.toCollection(LinkedHashSet::new), List::copyOf));

        if (orderedIds.size() < 2) {
            throw new IllegalArgumentException("At least two unique valid backtest IDs are required for comparison");
        }
        if (orderedIds.size() > 10) {
            throw new IllegalArgumentException("Comparison supports up to 10 backtests at once");
        }

        List<BacktestResult> fetched = backtestResultRepository.findAllById(orderedIds);
        Map<Long, BacktestResult> resultById = fetched.stream()
            .collect(Collectors.toMap(BacktestResult::getId, Function.identity()));

        List<Long> missingIds = orderedIds.stream()
            .filter(id -> !resultById.containsKey(id))
            .toList();
        if (!missingIds.isEmpty()) {
            throw new EntityNotFoundException("Backtests not found: " + missingIds);
        }

        List<BacktestResult> orderedResults = orderedIds.stream()
            .map(resultById::get)
            .toList();
        Map<Long, BacktestDataset> datasetById = backtestDatasetRepository.findAllById(
                orderedResults.stream()
                    .map(BacktestResult::getDatasetId)
                    .filter(id -> id != null && id > 0)
                    .collect(Collectors.toCollection(LinkedHashSet::new))
            ).stream()
            .collect(Collectors.toMap(BacktestDataset::getId, Function.identity()));

        BacktestResult baseline = orderedResults.get(0);
        BigDecimal baselineReturnPercent = totalReturnPercent(baseline);

        List<BacktestComparisonItemResponse> items = orderedResults.stream()
            .map(result -> {
                BigDecimal returnPercent = totalReturnPercent(result);
                DatasetProvenance provenance = datasetProvenance(result, datasetById);
                return new BacktestComparisonItemResponse(
                    result.getId(),
                    result.getStrategyId(),
                    result.getDatasetName(),
                    provenance.checksumSha256(),
                    provenance.schemaVersion(),
                    provenance.uploadedAt(),
                    provenance.archived(),
                    result.getSymbol(),
                    result.getTimeframe(),
                    result.getExecutionStatus().name(),
                    result.getValidationStatus().name(),
                    result.getFeesBps(),
                    result.getSlippageBps(),
                    result.getTimestamp(),
                    result.getInitialBalance(),
                    result.getFinalBalance(),
                    returnPercent,
                    result.getSharpeRatio(),
                    result.getProfitFactor(),
                    result.getWinRate(),
                    result.getMaxDrawdown(),
                    result.getTotalTrades(),
                    result.getFinalBalance().subtract(baseline.getFinalBalance()),
                    returnPercent.subtract(baselineReturnPercent)
                );
            })
            .toList();

        return new BacktestComparisonResponse(baseline.getId(), items);
    }

    private String resolveRequestedSymbol(String requestedSymbol,
                                         String datasetSymbolsCsv,
                                         com.algotrader.bot.backtest.strategy.BacktestStrategySelectionMode selectionMode) {
        List<String> supportedSymbols = parseSymbols(datasetSymbolsCsv);

        if (selectionMode == com.algotrader.bot.backtest.strategy.BacktestStrategySelectionMode.DATASET_UNIVERSE) {
            if (requestedSymbol != null && !requestedSymbol.isBlank() && !supportedSymbols.contains(requestedSymbol)) {
                throw new IllegalArgumentException("Selected primary symbol is not present in dataset: " + requestedSymbol);
            }
            return DATASET_UNIVERSE_LABEL;
        }

        if (!supportedSymbols.contains(requestedSymbol)) {
            throw new IllegalArgumentException("Selected symbol is not present in dataset: " + requestedSymbol);
        }

        return requestedSymbol;
    }

    private List<String> parseSymbols(String datasetSymbolsCsv) {
        return List.of(datasetSymbolsCsv.split(",")).stream()
            .map(String::trim)
            .filter(symbol -> !symbol.isBlank())
            .toList();
    }

    private BacktestHistoryItemResponse toHistoryItem(BacktestResult result) {
        return new BacktestHistoryItemResponse(
            result.getId(),
            result.getStrategyId(),
            result.getDatasetName(),
            resolveExperimentName(result),
            result.getSymbol(),
            result.getTimeframe(),
            result.getExecutionStatus().name(),
            result.getValidationStatus().name(),
            result.getFeesBps(),
            result.getSlippageBps(),
            result.getTimestamp(),
            result.getInitialBalance(),
            result.getFinalBalance(),
            result.getExecutionStage().name(),
            result.getProgressPercent(),
            result.getProcessedCandles(),
            result.getTotalCandles(),
            result.getCurrentDataTimestamp(),
            result.getStatusMessage(),
            result.getLastProgressAt(),
            result.getStartedAt(),
            result.getCompletedAt()
        );
    }

    private int sanitizeLimit(int limit) {
        if (limit <= 0) {
            return DEFAULT_HISTORY_LIMIT;
        }
        return Math.min(limit, MAX_HISTORY_LIMIT);
    }

    private BacktestDetailsResponse toDetails(BacktestResult result) {
        DatasetProvenance provenance = datasetProvenance(result);
        return new BacktestDetailsResponse(
            result.getId(),
            result.getStrategyId(),
            result.getDatasetId(),
            result.getDatasetName(),
            resolveExperimentName(result),
            resolveExperimentKey(result),
            provenance.checksumSha256(),
            provenance.schemaVersion(),
            provenance.uploadedAt(),
            provenance.archived(),
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
            result.getExecutionStage().name(),
            result.getProgressPercent(),
            result.getProcessedCandles(),
            result.getTotalCandles(),
            result.getCurrentDataTimestamp(),
            result.getStatusMessage(),
            result.getLastProgressAt(),
            result.getStartedAt(),
            result.getCompletedAt(),
            result.getErrorMessage(),
            result.getEquityPoints().stream()
                .map(point -> new BacktestEquityPointResponse(
                    point.getPointTimestamp(),
                    point.getEquity(),
                    point.getDrawdownPct()
                ))
                .toList(),
            result.getTradeSeries().stream()
                .map(item -> new BacktestTradeSeriesItemResponse(
                    item.getSymbol(),
                    item.getPositionSide().name(),
                    item.getEntryTime(),
                    item.getExitTime(),
                    item.getEntryPrice(),
                    item.getExitPrice(),
                    item.getQuantity(),
                    item.getEntryValue(),
                    item.getExitValue(),
                    item.getReturnPct()
                ))
                .toList()
        );
    }

    private BacktestExperimentSummaryResponse toExperimentSummary(String experimentKey, List<BacktestResult> runs) {
        BacktestResult latest = runs.get(0);
        BigDecimal averageReturnPercent = runs.stream()
            .map(this::totalReturnPercent)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(runs.size()), 4, RoundingMode.HALF_UP);
        BigDecimal bestFinalBalance = runs.stream()
            .map(BacktestResult::getFinalBalance)
            .filter(balance -> balance != null)
            .max(BigDecimal::compareTo)
            .orElse(BigDecimal.ZERO);
        BigDecimal worstMaxDrawdown = runs.stream()
            .map(BacktestResult::getMaxDrawdown)
            .filter(drawdown -> drawdown != null)
            .max(BigDecimal::compareTo)
            .orElse(BigDecimal.ZERO);

        return new BacktestExperimentSummaryResponse(
            experimentKey,
            resolveExperimentName(latest),
            latest.getId(),
            latest.getStrategyId(),
            latest.getDatasetName(),
            latest.getSymbol(),
            latest.getTimeframe(),
            latest.getExecutionStatus().name(),
            latest.getValidationStatus().name(),
            runs.size(),
            latest.getTimestamp(),
            averageReturnPercent,
            bestFinalBalance,
            worstMaxDrawdown
        );
    }

    private BigDecimal totalReturnPercent(BacktestResult result) {
        if (result.getInitialBalance() == null
            || result.getFinalBalance() == null
            || result.getInitialBalance().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return result.getFinalBalance()
            .subtract(result.getInitialBalance())
            .divide(result.getInitialBalance(), 8, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .setScale(4, RoundingMode.HALF_UP);
    }

    private String resolveRequestedExperimentName(String requestedExperimentName,
                                                 String strategyId,
                                                 String datasetName,
                                                 String effectiveSymbol,
                                                 String timeframe,
                                                 com.algotrader.bot.backtest.strategy.BacktestStrategySelectionMode selectionMode) {
        if (requestedExperimentName != null && !requestedExperimentName.isBlank()) {
            return requestedExperimentName.trim();
        }

        String marketLabel = selectionMode == com.algotrader.bot.backtest.strategy.BacktestStrategySelectionMode.DATASET_UNIVERSE
            ? "DATASET_UNIVERSE"
            : effectiveSymbol;
        return strategyId + " | " + datasetName + " | " + marketLabel + " | " + timeframe;
    }

    private String resolveExperimentName(BacktestResult result) {
        if (result.getExperimentName() != null && !result.getExperimentName().isBlank()) {
            return result.getExperimentName();
        }

        String datasetLabel = result.getDatasetName() == null || result.getDatasetName().isBlank()
            ? "dataset-" + (result.getDatasetId() == null ? "unknown" : result.getDatasetId())
            : result.getDatasetName();
        return result.getStrategyId() + " | " + datasetLabel + " | " + result.getSymbol() + " | " + result.getTimeframe();
    }

    private String resolveExperimentKey(BacktestResult result) {
        if (result.getExperimentKey() != null && !result.getExperimentKey().isBlank()) {
            return result.getExperimentKey();
        }
        return normalizeExperimentKey(resolveExperimentName(result));
    }

    private String normalizeExperimentKey(String experimentName) {
        return experimentName
            .trim()
            .toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
    }

    private DatasetProvenance datasetProvenance(BacktestResult result) {
        if (result.getDatasetId() == null) {
            return DatasetProvenance.empty();
        }

        return backtestDatasetRepository.findById(result.getDatasetId())
            .map(BacktestManagementService::toDatasetProvenance)
            .orElseGet(DatasetProvenance::empty);
    }

    private DatasetProvenance datasetProvenance(BacktestResult result, Map<Long, BacktestDataset> datasetById) {
        if (result.getDatasetId() == null) {
            return DatasetProvenance.empty();
        }

        return toDatasetProvenance(datasetById.get(result.getDatasetId()));
    }

    private static DatasetProvenance toDatasetProvenance(BacktestDataset dataset) {
        if (dataset == null) {
            return DatasetProvenance.empty();
        }

        return new DatasetProvenance(
            dataset.getChecksumSha256(),
            dataset.getSchemaVersion(),
            dataset.getUploadedAt(),
            dataset.getArchived()
        );
    }

    private record DatasetProvenance(
        String checksumSha256,
        String schemaVersion,
        LocalDateTime uploadedAt,
        Boolean archived
    ) {
        private static DatasetProvenance empty() {
            return new DatasetProvenance(null, null, null, null);
        }
    }
}
