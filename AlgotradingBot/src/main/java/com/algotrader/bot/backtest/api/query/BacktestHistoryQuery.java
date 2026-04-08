package com.algotrader.bot.backtest.api.query;

import com.algotrader.bot.validation.ValidationStatus;

public record BacktestHistoryQuery(
    Integer page,
    Integer pageSize,
    String sortBy,
    String sortDirection,
    String search,
    String strategyId,
    String datasetName,
    String experimentName,
    String market,
    String executionStatus,
    String validationStatus,
    Integer feesBpsMin,
    Integer feesBpsMax,
    Integer slippageBpsMin,
    Integer slippageBpsMax
) {}
