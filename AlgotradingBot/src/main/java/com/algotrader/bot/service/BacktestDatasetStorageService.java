package com.algotrader.bot.service;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.controller.BacktestDatasetDownloadResponse;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import com.algotrader.bot.service.marketdata.LegacyMarketDataMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
public class BacktestDatasetStorageService {

    private static final long MAX_UPLOAD_BYTES = 25L * 1024L * 1024L;

    private final BacktestDatasetRepository backtestDatasetRepository;
    private final HistoricalDataCsvParser historicalDataCsvParser;
    private final LegacyMarketDataMigrationService legacyMarketDataMigrationService;

    public BacktestDatasetStorageService(BacktestDatasetRepository backtestDatasetRepository,
                                         HistoricalDataCsvParser historicalDataCsvParser) {
        this(backtestDatasetRepository, historicalDataCsvParser, null);
    }

    @Autowired
    public BacktestDatasetStorageService(BacktestDatasetRepository backtestDatasetRepository,
                                         HistoricalDataCsvParser historicalDataCsvParser,
                                         LegacyMarketDataMigrationService legacyMarketDataMigrationService) {
        this.backtestDatasetRepository = backtestDatasetRepository;
        this.historicalDataCsvParser = historicalDataCsvParser;
        this.legacyMarketDataMigrationService = legacyMarketDataMigrationService;
    }

    public BacktestDataset storeUploadedDataset(String requestedName, MultipartFile file) {
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

        return saveDataset(requestedName, filename, csvData, "UPLOAD", "Persisted from uploaded dataset CSV.");
    }

    public BacktestDataset storeImportedDataset(String requestedName, String filename, byte[] csvData) {
        return storeImportedDataset(requestedName, filename, csvData, "Imported dataset.");
    }

    public BacktestDataset storeImportedDataset(String requestedName, String filename, byte[] csvData, String sourceDetails) {
        String detail = sourceDetails == null || sourceDetails.isBlank()
            ? "Imported dataset."
            : "Imported dataset from " + sourceDetails + ".";
        return saveDataset(requestedName, filename, csvData, "IMPORT_JOB", detail);
    }

    public BacktestDataset getDataset(Long datasetId) {
        return backtestDatasetRepository.findById(datasetId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest dataset not found: " + datasetId));
    }

    public BacktestDatasetDownloadResponse downloadDataset(Long datasetId) {
        BacktestDataset dataset = getDataset(datasetId);
        return new BacktestDatasetDownloadResponse(
            dataset.getOriginalFilename(),
            dataset.getChecksumSha256(),
            dataset.getSchemaVersion(),
            dataset.getCsvData()
        );
    }

    public void validateDatasetSize(long payloadSizeBytes) {
        if (payloadSizeBytes > MAX_UPLOAD_BYTES) {
            throw new IllegalArgumentException("CSV file is too large. Max size is 25MB");
        }
    }

    private BacktestDataset saveDataset(String requestedName,
                                        String filename,
                                        byte[] csvData,
                                        String normalizedSourceType,
                                        String normalizedNotes) {
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
        BacktestDataset saved = backtestDatasetRepository.save(dataset);
        if (legacyMarketDataMigrationService != null) {
            legacyMarketDataMigrationService.ingestDataset(
                saved,
                normalizedSourceType,
                normalizedNotes,
                saved.getChecksumSha256()
            );
        }
        return saved;
    }

    private String sha256Hex(byte[] payload) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(messageDigest.digest(payload));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 not available", exception);
        }
    }
}
