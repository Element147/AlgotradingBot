package com.algotrader.bot.marketdata.application.service;

public enum MarketDataImportJobStatus {
    QUEUED,
    RUNNING,
    WAITING_RETRY,
    COMPLETED,
    FAILED,
    CANCELLED
}
