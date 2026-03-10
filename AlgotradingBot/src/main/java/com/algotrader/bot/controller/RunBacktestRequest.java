package com.algotrader.bot.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RunBacktestRequest {

    @NotBlank(message = "Algorithm type is required")
    private String algorithmType;

    @NotNull(message = "Dataset ID is required")
    @Positive(message = "Dataset ID must be positive")
    private Long datasetId;

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotBlank(message = "Timeframe is required")
    private String timeframe;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Initial balance is required")
    @Positive(message = "Initial balance must be positive")
    private BigDecimal initialBalance;

    @NotNull(message = "Fees assumption is required")
    @PositiveOrZero(message = "Fees must be non-negative")
    @Max(value = 200, message = "Fees must be <= 200 bps")
    private Integer feesBps = 10;

    @NotNull(message = "Slippage assumption is required")
    @PositiveOrZero(message = "Slippage must be non-negative")
    @Max(value = 200, message = "Slippage must be <= 200 bps")
    private Integer slippageBps = 3;

    public String getAlgorithmType() {
        return algorithmType;
    }

    public void setAlgorithmType(String algorithmType) {
        this.algorithmType = algorithmType;
    }

    public Long getDatasetId() {
        return datasetId;
    }

    public void setDatasetId(Long datasetId) {
        this.datasetId = datasetId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getTimeframe() {
        return timeframe;
    }

    public void setTimeframe(String timeframe) {
        this.timeframe = timeframe;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getInitialBalance() {
        return initialBalance;
    }

    public void setInitialBalance(BigDecimal initialBalance) {
        this.initialBalance = initialBalance;
    }

    public Integer getFeesBps() {
        return feesBps;
    }

    public void setFeesBps(Integer feesBps) {
        this.feesBps = feesBps;
    }

    public Integer getSlippageBps() {
        return slippageBps;
    }

    public void setSlippageBps(Integer slippageBps) {
        this.slippageBps = slippageBps;
    }
}
