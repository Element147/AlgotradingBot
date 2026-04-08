package com.algotrader.bot.backtest.api;

import java.time.LocalDateTime;

public record BacktestDatasetRetentionReportResponse(
    long totalDatasets,
    long activeDatasets,
    long archivedDatasets,
    long archiveCandidateDatasets,
    long duplicateDatasetCount,
    long referencedDatasetCount,
    LocalDateTime oldestActiveUploadedAt,
    LocalDateTime newestUploadedAt
) {}
