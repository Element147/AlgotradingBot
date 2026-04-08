package com.algotrader.bot.marketdata.application;

public enum MarketDataImportJobStatus {
    QUEUED,
    RUNNING,
    WAITING_RETRY,
    COMPLETED,
    FAILED,
    CANCELLED
}
