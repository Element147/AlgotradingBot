package com.algotrader.bot.backtest.api.response;

public record BacktestDatasetDownloadResponse(
    String originalFilename,
    String checksumSha256,
    String schemaVersion,
    byte[] csvData,
    String exportSource
) {
}
