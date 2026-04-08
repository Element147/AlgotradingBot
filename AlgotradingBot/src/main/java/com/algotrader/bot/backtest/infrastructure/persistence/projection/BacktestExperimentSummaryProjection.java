package com.algotrader.bot.backtest.infrastructure.persistence;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface BacktestExperimentSummaryProjection {

    String getExperimentKey();

    String getExperimentName();

    Long getLatestBacktestId();

    String getStrategyId();

    String getDatasetName();

    String getSymbol();

    String getTimeframe();

    String getExecutionStatus();

    String getValidationStatus();

    Long getRunCount();

    LocalDateTime getLatestRunAt();

    BigDecimal getAverageReturnPercent();

    BigDecimal getBestFinalBalance();

    BigDecimal getWorstMaxDrawdown();
}
