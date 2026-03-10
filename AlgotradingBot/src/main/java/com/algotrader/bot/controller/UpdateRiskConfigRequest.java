package com.algotrader.bot.controller;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class UpdateRiskConfigRequest {

    @NotNull
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "0.05")
    private BigDecimal maxRiskPerTrade;

    @NotNull
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "0.10")
    private BigDecimal maxDailyLossLimit;

    @NotNull
    @DecimalMin(value = "0.10")
    @DecimalMax(value = "0.50")
    private BigDecimal maxDrawdownLimit;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer maxOpenPositions;

    @NotNull
    @DecimalMin(value = "0.10")
    @DecimalMax(value = "1.00")
    private BigDecimal correlationLimit;

    public BigDecimal getMaxRiskPerTrade() {
        return maxRiskPerTrade;
    }

    public void setMaxRiskPerTrade(BigDecimal maxRiskPerTrade) {
        this.maxRiskPerTrade = maxRiskPerTrade;
    }

    public BigDecimal getMaxDailyLossLimit() {
        return maxDailyLossLimit;
    }

    public void setMaxDailyLossLimit(BigDecimal maxDailyLossLimit) {
        this.maxDailyLossLimit = maxDailyLossLimit;
    }

    public BigDecimal getMaxDrawdownLimit() {
        return maxDrawdownLimit;
    }

    public void setMaxDrawdownLimit(BigDecimal maxDrawdownLimit) {
        this.maxDrawdownLimit = maxDrawdownLimit;
    }

    public Integer getMaxOpenPositions() {
        return maxOpenPositions;
    }

    public void setMaxOpenPositions(Integer maxOpenPositions) {
        this.maxOpenPositions = maxOpenPositions;
    }

    public BigDecimal getCorrelationLimit() {
        return correlationLimit;
    }

    public void setCorrelationLimit(BigDecimal correlationLimit) {
        this.correlationLimit = correlationLimit;
    }
}
