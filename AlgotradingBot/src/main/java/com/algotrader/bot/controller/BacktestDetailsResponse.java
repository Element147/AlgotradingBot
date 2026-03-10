package com.algotrader.bot.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BacktestDetailsResponse {

    private Long id;
    private String strategyId;
    private Long datasetId;
    private String datasetName;
    private String symbol;
    private String timeframe;
    private String executionStatus;
    private String validationStatus;
    private BigDecimal initialBalance;
    private BigDecimal finalBalance;
    private BigDecimal sharpeRatio;
    private BigDecimal profitFactor;
    private BigDecimal winRate;
    private BigDecimal maxDrawdown;
    private Integer totalTrades;
    private Integer feesBps;
    private Integer slippageBps;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime timestamp;
    private String errorMessage;

    public BacktestDetailsResponse() {
    }

    public BacktestDetailsResponse(Long id,
                                   String strategyId,
                                   Long datasetId,
                                   String datasetName,
                                   String symbol,
                                   String timeframe,
                                   String executionStatus,
                                   String validationStatus,
                                   BigDecimal initialBalance,
                                   BigDecimal finalBalance,
                                   BigDecimal sharpeRatio,
                                   BigDecimal profitFactor,
                                   BigDecimal winRate,
                                   BigDecimal maxDrawdown,
                                   Integer totalTrades,
                                   Integer feesBps,
                                   Integer slippageBps,
                                   LocalDateTime startDate,
                                   LocalDateTime endDate,
                                   LocalDateTime timestamp,
                                   String errorMessage) {
        this.id = id;
        this.strategyId = strategyId;
        this.datasetId = datasetId;
        this.datasetName = datasetName;
        this.symbol = symbol;
        this.timeframe = timeframe;
        this.executionStatus = executionStatus;
        this.validationStatus = validationStatus;
        this.initialBalance = initialBalance;
        this.finalBalance = finalBalance;
        this.sharpeRatio = sharpeRatio;
        this.profitFactor = profitFactor;
        this.winRate = winRate;
        this.maxDrawdown = maxDrawdown;
        this.totalTrades = totalTrades;
        this.feesBps = feesBps;
        this.slippageBps = slippageBps;
        this.startDate = startDate;
        this.endDate = endDate;
        this.timestamp = timestamp;
        this.errorMessage = errorMessage;
    }

    public Long getId() {
        return id;
    }

    public String getStrategyId() {
        return strategyId;
    }

    public Long getDatasetId() {
        return datasetId;
    }

    public String getDatasetName() {
        return datasetName;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getTimeframe() {
        return timeframe;
    }

    public String getExecutionStatus() {
        return executionStatus;
    }

    public String getValidationStatus() {
        return validationStatus;
    }

    public BigDecimal getInitialBalance() {
        return initialBalance;
    }

    public BigDecimal getFinalBalance() {
        return finalBalance;
    }

    public BigDecimal getSharpeRatio() {
        return sharpeRatio;
    }

    public BigDecimal getProfitFactor() {
        return profitFactor;
    }

    public BigDecimal getWinRate() {
        return winRate;
    }

    public BigDecimal getMaxDrawdown() {
        return maxDrawdown;
    }

    public Integer getTotalTrades() {
        return totalTrades;
    }

    public Integer getFeesBps() {
        return feesBps;
    }

    public Integer getSlippageBps() {
        return slippageBps;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
