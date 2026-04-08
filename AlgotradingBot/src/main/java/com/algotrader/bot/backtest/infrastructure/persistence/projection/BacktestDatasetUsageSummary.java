package com.algotrader.bot.backtest.infrastructure.persistence;

import java.time.LocalDateTime;

public interface BacktestDatasetUsageSummary {
    Long getDatasetId();

    long getUsageCount();

    LocalDateTime getLastUsedAt();
}
