package com.algotrader.bot.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BacktestHistoryItemResponse {

    private Long id;
    private String strategyId;
    private String datasetName;
    private String symbol;
    private String timeframe;
    private String executionStatus;
    private String validationStatus;
    private Integer feesBps;
    private Integer slippageBps;
    private LocalDateTime timestamp;
    private BigDecimal initialBalance;
    private BigDecimal finalBalance;

    public BacktestHistoryItemResponse() {
    }

    public BacktestHistoryItemResponse(Long id,
                                       String strategyId,
                                       String datasetName,
                                       String symbol,
                                       String timeframe,
                                       String executionStatus,
                                       String validationStatus,
                                       Integer feesBps,
                                       Integer slippageBps,
                                       LocalDateTime timestamp,
                                       BigDecimal initialBalance,
                                       BigDecimal finalBalance) {
        this.id = id;
        this.strategyId = strategyId;
        this.datasetName = datasetName;
        this.symbol = symbol;
        this.timeframe = timeframe;
        this.executionStatus = executionStatus;
        this.validationStatus = validationStatus;
        this.feesBps = feesBps;
        this.slippageBps = slippageBps;
        this.timestamp = timestamp;
        this.initialBalance = initialBalance;
        this.finalBalance = finalBalance;
    }

    public Long getId() {
        return id;
    }

    public String getStrategyId() {
        return strategyId;
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

    public Integer getFeesBps() {
        return feesBps;
    }

    public Integer getSlippageBps() {
        return slippageBps;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public BigDecimal getInitialBalance() {
        return initialBalance;
    }

    public BigDecimal getFinalBalance() {
        return finalBalance;
    }
}
