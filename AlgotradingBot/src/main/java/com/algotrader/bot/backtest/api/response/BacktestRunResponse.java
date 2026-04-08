package com.algotrader.bot.backtest.api.response;

import com.algotrader.bot.shared.api.response.AsyncTaskMonitorResponse;
import java.time.LocalDateTime;

public record BacktestRunResponse(
    Long id,
    String status,
    LocalDateTime submittedAt,
    AsyncTaskMonitorResponse asyncMonitor
) {}
