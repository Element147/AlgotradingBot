package com.algotrader.bot.backtest.api;

import com.algotrader.bot.shared.api.AsyncTaskMonitorResponse;
import java.time.LocalDateTime;

public record BacktestRunResponse(
    Long id,
    String status,
    LocalDateTime submittedAt,
    AsyncTaskMonitorResponse asyncMonitor
) {}
