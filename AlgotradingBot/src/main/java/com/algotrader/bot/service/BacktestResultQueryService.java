package com.algotrader.bot.service;

import com.algotrader.bot.controller.BacktestComparisonItemResponse;
import com.algotrader.bot.controller.BacktestComparisonResponse;
import com.algotrader.bot.controller.BacktestDetailsResponse;
import com.algotrader.bot.controller.BacktestEquityPointResponse;
import com.algotrader.bot.controller.BacktestExperimentSummaryResponse;
import com.algotrader.bot.controller.BacktestHistoryItemResponse;
import com.algotrader.bot.controller.BacktestSummaryResponse;
import com.algotrader.bot.controller.BacktestSymbolTelemetryResponse;
import com.algotrader.bot.controller.BacktestTelemetryQueryResponse;
import com.algotrader.bot.controller.BacktestTradeSeriesItemResponse;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import com.algotrader.bot.repository.BacktestResultRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BacktestResultQueryService {

    private static final int DEFAULT_HISTORY_LIMIT = 20;
    private static final int MAX_HISTORY_LIMIT = 500;

    private final BacktestResultRepository backtestResultRepository;
    private final BacktestDatasetRepository backtestDatasetRepository;
    private final BacktestTelemetryService backtestTelemetryService;
    private final BackendOperationMetrics backendOperationMetrics;

    public BacktestResultQueryService(BacktestResultRepository backtestResultRepository,
                                      BacktestDatasetRepository backtestDatasetRepository,
                                      BacktestTelemetryService backtestTelemetryService,
                                      BackendOperationMetrics backendOperationMetrics) {
        this.backtestResultRepository = backtestResultRepository;
        this.backtestDatasetRepository = backtestDatasetRepository;
        this.backtestTelemetryService = backtestTelemetryService;
        this.backendOperationMetrics = backendOperationMetrics;
    }

    @Transactional(readOnly = true)
    public List<BacktestHistoryItemResponse> getHistory(int limit) {
        long startedAt = System.nanoTime();
        int boundedLimit = sanitizeLimit(limit);
        List<BacktestHistoryItemResponse> history = backtestResultRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, boundedLimit)).stream()
            .map(this::toHistoryItem)
            .toList();
        backendOperationMetrics.record("read", "backtest_history", "list", System.nanoTime() - startedAt, history.size(), 0L);
        return history;
    }

    @Transactional(readOnly = true)
    public List<BacktestExperimentSummaryResponse> getExperimentSummaries() {
        return backtestResultRepository.findExperimentSummaries().stream()
            .map(summary -> new BacktestExperimentSummaryResponse(
                summary.getExperimentKey(),
                summary.getExperimentName(),
                summary.getLatestBacktestId(),
                summary.getStrategyId(),
                summary.getDatasetName(),
                summary.getSymbol(),
                summary.getTimeframe(),
                summary.getExecutionStatus(),
                summary.getValidationStatus(),
                Math.toIntExact(summary.getRunCount()),
                summary.getLatestRunAt(),
                summary.getAverageReturnPercent(),
                summary.getBestFinalBalance(),
                summary.getWorstMaxDrawdown()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public BacktestDetailsResponse getDetails(Long backtestId) {
        long startedAt = System.nanoTime();
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

        BacktestDetailsResponse details = toDetails(result);
        backendOperationMetrics.record(
            "read",
            "backtest_details",
            "overview",
            System.nanoTime() - startedAt,
            details.availableTelemetrySymbols().size(),
            0L
        );
        return details;
    }

    @Transactional(readOnly = true)
    public BacktestSummaryResponse getSummary(Long backtestId) {
        long startedAt = System.nanoTime();
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));
        BacktestSummaryResponse summary = toSummary(result);
        backendOperationMetrics.record("read", "backtest_summary", "single", System.nanoTime() - startedAt, 1, 0L);
        return summary;
    }

    @Transactional(readOnly = true)
    public List<BacktestEquityPointResponse> getEquityCurve(Long backtestId) {
        long startedAt = System.nanoTime();
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));
        List<BacktestEquityPointResponse> equityCurve = result.getEquityPoints().stream()
            .map(point -> new BacktestEquityPointResponse(
                point.getPointTimestamp(),
                point.getEquity(),
                point.getDrawdownPct()
            ))
            .toList();
        backendOperationMetrics.record(
            "read",
            "backtest_equity_curve",
            "series",
            System.nanoTime() - startedAt,
            equityCurve.size(),
            0L
        );
        return equityCurve;
    }

    @Transactional(readOnly = true)
    public List<BacktestTradeSeriesItemResponse> getTradeSeries(Long backtestId) {
        long startedAt = System.nanoTime();
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));
        List<BacktestTradeSeriesItemResponse> tradeSeries = result.getTradeSeries().stream()
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
            .toList();
        backendOperationMetrics.record(
            "read",
            "backtest_trade_series",
            "series",
            System.nanoTime() - startedAt,
            tradeSeries.size(),
            0L
        );
        return tradeSeries;
    }

    @Transactional(readOnly = true)
    public BacktestTelemetryQueryResponse getTelemetry(Long backtestId, String requestedSymbol) {
        long startedAt = System.nanoTime();
        BacktestResult result = backtestResultRepository.findById(backtestId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest not found: " + backtestId));

        List<String> availableSymbols = resolveTelemetrySymbols(result);
        BacktestSymbolTelemetryResponse telemetry = backtestTelemetryService.buildTelemetry(result, requestedSymbol)
            .stream()
            .findFirst()
            .orElseThrow(() -> new EntityNotFoundException("Telemetry not available for backtest: " + backtestId));

        LinkedHashSet<String> resolvedSymbols = new LinkedHashSet<>(availableSymbols);
        resolvedSymbols.add(telemetry.symbol());

        int payloadItems = telemetry.points().size()
            + telemetry.actions().size()
            + telemetry.indicators().stream().mapToInt(indicator -> indicator.points().size()).sum();
        backendOperationMetrics.record(
            "read",
            "backtest_telemetry",
            "symbol_response",
            System.nanoTime() - startedAt,
            payloadItems,
            0L
        );
        return new BacktestTelemetryQueryResponse(
            requestedSymbol,
            telemetry.symbol(),
            List.copyOf(resolvedSymbols),
            telemetry
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

    private BacktestDetailsResponse toDetails(BacktestResult result) {
        BacktestSummaryResponse summary = toSummary(result);
        return new BacktestDetailsResponse(
            summary.id(),
            summary.strategyId(),
            summary.datasetId(),
            summary.datasetName(),
            summary.experimentName(),
            summary.experimentKey(),
            summary.datasetChecksumSha256(),
            summary.datasetSchemaVersion(),
            summary.datasetUploadedAt(),
            summary.datasetArchived(),
            summary.symbol(),
            summary.timeframe(),
            summary.executionStatus(),
            summary.validationStatus(),
            summary.initialBalance(),
            summary.finalBalance(),
            summary.sharpeRatio(),
            summary.profitFactor(),
            summary.winRate(),
            summary.maxDrawdown(),
            summary.totalTrades(),
            summary.feesBps(),
            summary.slippageBps(),
            summary.startDate(),
            summary.endDate(),
            summary.timestamp(),
            summary.executionStage(),
            summary.progressPercent(),
            summary.processedCandles(),
            summary.totalCandles(),
            summary.currentDataTimestamp(),
            summary.statusMessage(),
            summary.lastProgressAt(),
            summary.startedAt(),
            summary.completedAt(),
            summary.errorMessage(),
            resolveTelemetrySymbols(result)
        );
    }

    private BacktestSummaryResponse toSummary(BacktestResult result) {
        DatasetProvenance provenance = datasetProvenance(result);
        return new BacktestSummaryResponse(
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
            result.getErrorMessage()
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
            .map(BacktestResultQueryService::toDatasetProvenance)
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

    private int sanitizeLimit(int limit) {
        if (limit <= 0) {
            return DEFAULT_HISTORY_LIMIT;
        }
        return Math.min(limit, MAX_HISTORY_LIMIT);
    }

    private List<String> resolveTelemetrySymbols(BacktestResult result) {
        LinkedHashSet<String> symbols = new LinkedHashSet<>();
        if (result.getSymbol() != null
            && !result.getSymbol().isBlank()
            && !"DATASET_UNIVERSE".equalsIgnoreCase(result.getSymbol())) {
            symbols.add(result.getSymbol());
        }
        result.getTradeSeries().stream()
            .map(item -> item.getSymbol())
            .filter(Objects::nonNull)
            .filter(symbol -> !symbol.isBlank())
            .forEach(symbols::add);
        return List.copyOf(symbols);
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
