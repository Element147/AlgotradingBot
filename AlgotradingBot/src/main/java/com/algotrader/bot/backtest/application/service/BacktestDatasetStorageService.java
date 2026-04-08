package com.algotrader.bot.backtest.application.service;

import com.algotrader.bot.backtest.infrastructure.persistence.entity.BacktestDataset;
import com.algotrader.bot.backtest.infrastructure.persistence.repository.BacktestDatasetRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class BacktestDatasetStorageService {

    private static final String PENDING_CHECKSUM_SHA256 = "0000000000000000000000000000000000000000000000000000000000000000";

    private final BacktestDatasetRepository backtestDatasetRepository;

    public BacktestDatasetStorageService(BacktestDatasetRepository backtestDatasetRepository) {
        this.backtestDatasetRepository = backtestDatasetRepository;
    }

    @Transactional(readOnly = true)
    public BacktestDataset getDataset(Long datasetId) {
        return backtestDatasetRepository.findById(datasetId)
            .orElseThrow(() -> new EntityNotFoundException("Backtest dataset not found: " + datasetId));
    }

    @Transactional
    public BacktestDataset createPendingProviderDataset(String requestedName,
                                                        String originalFilename,
                                                        String symbolsCsv,
                                                        LocalDateTime requestedStart,
                                                        LocalDateTime requestedEnd) {
        String normalizedName = normalizeName(requestedName);
        BacktestDataset dataset = new BacktestDataset();
        dataset.setName(normalizedName);
        dataset.setOriginalFilename(normalizeOriginalFilename(originalFilename));
        dataset.setRowCount(0);
        dataset.setSymbolsCsv(symbolsCsv);
        dataset.setDataStart(requestedStart);
        dataset.setDataEnd(requestedEnd);
        dataset.setChecksumSha256(PENDING_CHECKSUM_SHA256);
        dataset.setSchemaVersion("ohlcv-v1");
        dataset.setArchived(Boolean.FALSE);
        dataset.setReady(Boolean.FALSE);
        return backtestDatasetRepository.save(dataset);
    }

    @Transactional
    public BacktestDataset finalizeProviderDataset(Long datasetId,
                                                   int rowCount,
                                                   String checksumSha256,
                                                   LocalDateTime dataStart,
                                                   LocalDateTime dataEnd) {
        if (rowCount <= 0) {
            throw new IllegalArgumentException("Provider-imported datasets must contain at least one candle.");
        }
        BacktestDataset dataset = getDataset(datasetId);
        dataset.setRowCount(rowCount);
        dataset.setChecksumSha256(checksumSha256);
        dataset.setDataStart(dataStart);
        dataset.setDataEnd(dataEnd);
        dataset.setReady(Boolean.TRUE);
        return backtestDatasetRepository.save(dataset);
    }

    @Transactional
    public void deleteDataset(Long datasetId) {
        if (datasetId != null) {
            backtestDatasetRepository.deleteById(datasetId);
        }
    }

    private String normalizeName(String requestedName) {
        if (requestedName == null || requestedName.isBlank()) {
            throw new IllegalArgumentException("Dataset name is required.");
        }
        String normalized = requestedName.trim();
        if (normalized.length() < 3 || normalized.length() > 100) {
            throw new IllegalArgumentException("Dataset name must be between 3 and 100 characters");
        }
        return normalized;
    }

    private String normalizeOriginalFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "provider-import";
        }
        String normalized = originalFilename.trim();
        return normalized.length() > 255 ? normalized.substring(0, 255) : normalized;
    }
}
