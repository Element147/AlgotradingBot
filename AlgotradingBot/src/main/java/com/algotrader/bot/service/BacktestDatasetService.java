package com.algotrader.bot.service;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.controller.BacktestDatasetArchiveRequest;
import com.algotrader.bot.controller.BacktestDatasetDownloadResponse;
import com.algotrader.bot.controller.BacktestDatasetResponse;
import com.algotrader.bot.controller.BacktestDatasetRetentionReportResponse;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import com.algotrader.bot.repository.BacktestDatasetUsageSummary;
import com.algotrader.bot.repository.BacktestResultRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

@Service
public class BacktestDatasetService {

    private static final long MAX_UPLOAD_BYTES = 25L * 1024L * 1024L;
    private static final int UNUSED_ARCHIVE_CANDIDATE_DAYS = 14;
    private static final int STALE_REFERENCE_DAYS = 60;

    private final BacktestDatasetRepository backtestDatasetRepository;
    private final BacktestResultRepository backtestResultRepository;
    private final HistoricalDataCsvParser historicalDataCsvParser;
    private final OperatorAuditService operatorAuditService;

    public BacktestDatasetService(BacktestDatasetRepository backtestDatasetRepository,
                                  BacktestResultRepository backtestResultRepository,
                                  HistoricalDataCsvParser historicalDataCsvParser,
                                  OperatorAuditService operatorAuditService) {
        this.backtestDatasetRepository = backtestDatasetRepository;
        this.backtestResultRepository = backtestResultRepository;
        this.historicalDataCsvParser = historicalDataCsvParser;
        this.operatorAuditService = operatorAuditService;
    }

    @Transactional
    public BacktestDatasetResponse uploadDataset(String requestedName, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }
        String filename = file.getOriginalFilename() == null ? "dataset.csv" : file.getOriginalFilename();

        byte[] csvData;
        try {
            csvData = file.getBytes();
        } catch (IOException exception) {
            throw new IllegalArgumentException("Unable to read uploaded file");
        }

        BacktestDataset saved = saveDataset(requestedName, filename, csvData);
        operatorAuditService.recordSuccess(
            "BACKTEST_DATASET_UPLOADED",
            "test",
            "BACKTEST_DATASET",
            String.valueOf(saved.getId()),
            "name=" + saved.getName() + ", rows=" + saved.getRowCount()
        );
        List<BacktestDataset> datasets = backtestDatasetRepository.findAllByOrderByUploadedAtDesc();
        return toResponse(saved, getUsageStatsByDatasetId(), getDuplicateCountByChecksum(datasets));
    }

    @Transactional
    public BacktestDatasetResponse importDataset(String requestedName, String filename, byte[] csvData, String sourceDetails) {
        BacktestDataset saved = saveDataset(requestedName, filename, csvData);
        operatorAuditService.recordSuccess(
            "BACKTEST_DATASET_IMPORTED",
            "test",
            "BACKTEST_DATASET",
            String.valueOf(saved.getId()),
            "name=" + saved.getName() + ", rows=" + saved.getRowCount() + ", source=" + sourceDetails
        );
        List<BacktestDataset> datasets = backtestDatasetRepository.findAllByOrderByUploadedAtDesc();
        return toResponse(saved, getUsageStatsByDatasetId(), getDuplicateCountByChecksum(datasets));
    }

    @Transactional(readOnly = true)
    public List<BacktestDatasetResponse> listDatasets() {
        List<BacktestDataset> datasets = backtestDatasetRepository.findAllByOrderByUploadedAtDesc();
        Map<Long, DatasetUsageStats> usageStatsByDatasetId = getUsageStatsByDatasetId();
        Map<String, Integer> duplicateCountByChecksum = getDuplicateCountByChecksum(datasets);

        return datasets.stream()
            .map(dataset -> toResponse(dataset, usageStatsByDatasetId, duplicateCountByChecksum))
            .toList();
    }

    @Transactional(readOnly = true)
    public BacktestDatasetRetentionReportResponse getRetentionReport() {
        List<BacktestDataset> datasets = backtestDatasetRepository.findAllByOrderByUploadedAtDesc();
        Map<Long, DatasetUsageStats> usageStatsByDatasetId = getUsageStatsByDatasetId();
        Map<String, Integer> duplicateCountByChecksum = getDuplicateCountByChecksum(datasets);

        long archivedDatasets = datasets.stream()
            .filter(dataset -> Boolean.TRUE.equals(dataset.getArchived()))
            .count();
        long activeDatasets = datasets.size() - archivedDatasets;
        long archiveCandidateDatasets = datasets.stream()
            .filter(dataset -> isArchiveCandidate(dataset, usageStatsByDatasetId.get(dataset.getId()), duplicateCountByChecksum))
            .count();
        long duplicateDatasetCount = duplicateCountByChecksum.values().stream()
            .filter(count -> count > 1)
            .mapToLong(Long::valueOf)
            .sum();
        long referencedDatasetCount = usageStatsByDatasetId.values().stream()
            .filter(stats -> stats.usageCount() > 0)
            .count();
        LocalDateTime oldestActiveUploadedAt = datasets.stream()
            .filter(dataset -> !Boolean.TRUE.equals(dataset.getArchived()))
            .map(BacktestDataset::getUploadedAt)
            .min(Comparator.naturalOrder())
            .orElse(null);
        LocalDateTime newestUploadedAt = datasets.stream()
            .map(BacktestDataset::getUploadedAt)
            .max(Comparator.naturalOrder())
            .orElse(null);

        return new BacktestDatasetRetentionReportResponse(
            datasets.size(),
            activeDatasets,
            archivedDatasets,
            archiveCandidateDatasets,
            duplicateDatasetCount,
            referencedDatasetCount,
            oldestActiveUploadedAt,
            newestUploadedAt
        );
    }

    @Transactional(readOnly = true)
    public BacktestDataset getDataset(Long datasetId) {
        return backtestDatasetRepository.findById(datasetId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest dataset not found: " + datasetId));
    }

    @Transactional(readOnly = true)
    public BacktestDatasetDownloadResponse downloadDataset(Long datasetId) {
        BacktestDataset dataset = getDataset(datasetId);
        return new BacktestDatasetDownloadResponse(
            dataset.getOriginalFilename(),
            dataset.getChecksumSha256(),
            dataset.getSchemaVersion(),
            dataset.getCsvData()
        );
    }

    @Transactional
    public BacktestDatasetResponse archiveDataset(Long datasetId, BacktestDatasetArchiveRequest request) {
        BacktestDataset dataset = getDataset(datasetId);
        if (Boolean.TRUE.equals(dataset.getArchived())) {
            return toResponse(dataset, getUsageStatsByDatasetId(), getDuplicateCountByChecksum(List.of(dataset)));
        }

        String reason = request == null || request.reason() == null || request.reason().isBlank()
            ? "Archived from dataset inventory."
            : request.reason().trim();
        dataset.setArchived(Boolean.TRUE);
        dataset.setArchivedAt(LocalDateTime.now());
        dataset.setArchiveReason(reason);

        BacktestDataset saved = backtestDatasetRepository.save(dataset);
        operatorAuditService.recordSuccess(
            "BACKTEST_DATASET_ARCHIVED",
            "test",
            "BACKTEST_DATASET",
            String.valueOf(saved.getId()),
            "name=" + saved.getName() + ", reason=" + reason
        );

        List<BacktestDataset> datasets = backtestDatasetRepository.findAllByOrderByUploadedAtDesc();
        return toResponse(saved, getUsageStatsByDatasetId(), getDuplicateCountByChecksum(datasets));
    }

    @Transactional
    public BacktestDatasetResponse restoreDataset(Long datasetId) {
        BacktestDataset dataset = getDataset(datasetId);
        dataset.setArchived(Boolean.FALSE);
        dataset.setArchivedAt(null);
        dataset.setArchiveReason(null);

        BacktestDataset saved = backtestDatasetRepository.save(dataset);
        operatorAuditService.recordSuccess(
            "BACKTEST_DATASET_RESTORED",
            "test",
            "BACKTEST_DATASET",
            String.valueOf(saved.getId()),
            "name=" + saved.getName()
        );

        List<BacktestDataset> datasets = backtestDatasetRepository.findAllByOrderByUploadedAtDesc();
        return toResponse(saved, getUsageStatsByDatasetId(), getDuplicateCountByChecksum(datasets));
    }

    public void validateDatasetAvailableForNewRuns(Long datasetId) {
        BacktestDataset dataset = getDataset(datasetId);
        if (Boolean.TRUE.equals(dataset.getArchived())) {
            throw new IllegalArgumentException(
                "Archived datasets cannot be used for new backtests. Restore the dataset or upload a new active version."
            );
        }
    }

    private BacktestDatasetResponse toResponse(BacktestDataset dataset,
                                               Map<Long, DatasetUsageStats> usageStatsByDatasetId,
                                               Map<String, Integer> duplicateCountByChecksum) {
        DatasetUsageStats usageStats = usageStatsByDatasetId.getOrDefault(dataset.getId(), DatasetUsageStats.empty());
        int duplicateCount = duplicateCountByChecksum.getOrDefault(dataset.getChecksumSha256(), 1);

        return new BacktestDatasetResponse(
            dataset.getId(),
            dataset.getName(),
            dataset.getOriginalFilename(),
            dataset.getRowCount(),
            dataset.getSymbolsCsv(),
            dataset.getDataStart(),
            dataset.getDataEnd(),
            dataset.getUploadedAt(),
            dataset.getChecksumSha256(),
            dataset.getSchemaVersion(),
            dataset.getArchived(),
            dataset.getArchivedAt(),
            dataset.getArchiveReason(),
            usageStats.usageCount(),
            usageStats.lastUsedAt(),
            usageStats.usageCount() > 0,
            duplicateCount,
            resolveRetentionStatus(dataset, usageStats, duplicateCount)
        );
    }

    private Map<Long, DatasetUsageStats> getUsageStatsByDatasetId() {
        Map<Long, DatasetUsageStats> usageStatsByDatasetId = new HashMap<>();
        for (BacktestDatasetUsageSummary summary : backtestResultRepository.summarizeDatasetUsage()) {
            usageStatsByDatasetId.put(
                summary.getDatasetId(),
                new DatasetUsageStats(summary.getUsageCount(), summary.getLastUsedAt())
            );
        }
        return usageStatsByDatasetId;
    }

    private Map<String, Integer> getDuplicateCountByChecksum(List<BacktestDataset> datasets) {
        Map<String, Integer> duplicateCountByChecksum = new HashMap<>();
        for (BacktestDataset dataset : datasets) {
            duplicateCountByChecksum.merge(dataset.getChecksumSha256(), 1, Integer::sum);
        }
        return duplicateCountByChecksum;
    }

    private boolean isArchiveCandidate(BacktestDataset dataset,
                                       DatasetUsageStats usageStats,
                                       Map<String, Integer> duplicateCountByChecksum) {
        if (Boolean.TRUE.equals(dataset.getArchived())) {
            return false;
        }

        int duplicateCount = duplicateCountByChecksum.getOrDefault(dataset.getChecksumSha256(), 1);
        if (duplicateCount > 1 && (usageStats == null || usageStats.usageCount() == 0)) {
            return true;
        }

        if (usageStats == null || usageStats.usageCount() == 0) {
            return dataset.getUploadedAt().isBefore(LocalDateTime.now().minusDays(UNUSED_ARCHIVE_CANDIDATE_DAYS));
        }

        return false;
    }

    private String resolveRetentionStatus(BacktestDataset dataset,
                                          DatasetUsageStats usageStats,
                                          int duplicateCount) {
        if (Boolean.TRUE.equals(dataset.getArchived())) {
            return "ARCHIVED";
        }
        if (duplicateCount > 1 && usageStats.usageCount() == 0) {
            return "ARCHIVE_CANDIDATE_DUPLICATE";
        }
        if (usageStats.usageCount() == 0
            && dataset.getUploadedAt().isBefore(LocalDateTime.now().minusDays(UNUSED_ARCHIVE_CANDIDATE_DAYS))) {
            return "ARCHIVE_CANDIDATE_UNUSED";
        }
        if (duplicateCount > 1) {
            return "ACTIVE_DUPLICATE_RETAINED";
        }
        if (usageStats.lastUsedAt() != null
            && usageStats.lastUsedAt().isBefore(LocalDateTime.now().minusDays(STALE_REFERENCE_DAYS))) {
            return "ACTIVE_STALE_RETAINED";
        }
        return "ACTIVE";
    }

    private String sha256Hex(byte[] payload) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(messageDigest.digest(payload));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 not available", exception);
        }
    }

    private BacktestDataset saveDataset(String requestedName, String filename, byte[] csvData) {
        validateDatasetSize(csvData == null ? 0 : csvData.length);
        String name = (requestedName == null || requestedName.isBlank()) ? filename : requestedName.trim();
        if (name.length() < 3 || name.length() > 100) {
            throw new IllegalArgumentException("Dataset name must be between 3 and 100 characters");
        }

        List<OHLCVData> candles = historicalDataCsvParser.parse(csvData);
        if (candles.isEmpty()) {
            throw new IllegalArgumentException("CSV dataset does not contain any rows");
        }

        Set<String> symbols = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        LocalDateTime start = null;
        LocalDateTime end = null;

        for (OHLCVData candle : candles) {
            symbols.add(candle.getSymbol());
            LocalDateTime timestamp = candle.getTimestamp();
            if (start == null || timestamp.isBefore(start)) {
                start = timestamp;
            }
            if (end == null || timestamp.isAfter(end)) {
                end = timestamp;
            }
        }

        BacktestDataset dataset = new BacktestDataset();
        dataset.setName(name);
        dataset.setOriginalFilename(filename);
        dataset.setCsvData(csvData);
        dataset.setRowCount(candles.size());
        dataset.setSymbolsCsv(String.join(",", symbols));
        dataset.setDataStart(start);
        dataset.setDataEnd(end);
        dataset.setChecksumSha256(sha256Hex(csvData));
        dataset.setSchemaVersion("ohlcv-v1");
        dataset.setArchived(Boolean.FALSE);
        return backtestDatasetRepository.save(dataset);
    }

    public void validateDatasetSize(long payloadSizeBytes) {
        if (payloadSizeBytes > MAX_UPLOAD_BYTES) {
            throw new IllegalArgumentException("CSV file is too large. Max size is 25MB");
        }
    }

    private record DatasetUsageStats(long usageCount, LocalDateTime lastUsedAt) {
        private static DatasetUsageStats empty() {
            return new DatasetUsageStats(0L, null);
        }
    }
}
