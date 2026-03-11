package com.algotrader.bot.service;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.controller.BacktestDatasetResponse;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
public class BacktestDatasetService {

    private static final long MAX_UPLOAD_BYTES = 25L * 1024L * 1024L;

    private final BacktestDatasetRepository backtestDatasetRepository;
    private final HistoricalDataCsvParser historicalDataCsvParser;

    public BacktestDatasetService(BacktestDatasetRepository backtestDatasetRepository,
                                  HistoricalDataCsvParser historicalDataCsvParser) {
        this.backtestDatasetRepository = backtestDatasetRepository;
        this.historicalDataCsvParser = historicalDataCsvParser;
    }

    @Transactional
    public BacktestDatasetResponse uploadDataset(String requestedName, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new IllegalArgumentException("CSV file is too large. Max size is 25MB");
        }

        String filename = file.getOriginalFilename() == null ? "dataset.csv" : file.getOriginalFilename();
        String name = (requestedName == null || requestedName.isBlank()) ? filename : requestedName.trim();
        if (name.length() < 3 || name.length() > 100) {
            throw new IllegalArgumentException("Dataset name must be between 3 and 100 characters");
        }

        byte[] csvData;
        try {
            csvData = file.getBytes();
        } catch (IOException exception) {
            throw new IllegalArgumentException("Unable to read uploaded file");
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

        BacktestDataset saved = backtestDatasetRepository.save(dataset);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BacktestDatasetResponse> listDatasets() {
        return backtestDatasetRepository.findAllByOrderByUploadedAtDesc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BacktestDataset getDataset(Long datasetId) {
        return backtestDatasetRepository.findById(datasetId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest dataset not found: " + datasetId));
    }

    private BacktestDatasetResponse toResponse(BacktestDataset dataset) {
        return new BacktestDatasetResponse(
            dataset.getId(),
            dataset.getName(),
            dataset.getOriginalFilename(),
            dataset.getRowCount(),
            dataset.getSymbolsCsv(),
            dataset.getDataStart(),
            dataset.getDataEnd(),
            dataset.getUploadedAt()
        );
    }
}
