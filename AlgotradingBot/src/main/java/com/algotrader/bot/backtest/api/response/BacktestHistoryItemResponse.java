package com.algotrader.bot.backtest.api.response;

import com.algotrader.bot.shared.api.response.AsyncTaskMonitorResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.algotrader.bot.validation.ValidationStatus;

public record BacktestHistoryItemResponse(
    Long id,
    String strategyId,
    String datasetName,
    String experimentName,
    String symbol,
    String timeframe,
    String executionStatus,
    String validationStatus,
    Integer feesBps,
    Integer slippageBps,
    LocalDateTime timestamp,
    BigDecimal initialBalance,
    BigDecimal finalBalance,
    BigDecimal netProfit,
    Integer winningTrades,
    Integer losingTrades,
    String executionStage,
    Integer progressPercent,
    Integer processedCandles,
    Integer totalCandles,
    LocalDateTime currentDataTimestamp,
    String statusMessage,
    LocalDateTime lastProgressAt,
    LocalDateTime startedAt,
    LocalDateTime completedAt,
    AsyncTaskMonitorResponse asyncMonitor
) {}
