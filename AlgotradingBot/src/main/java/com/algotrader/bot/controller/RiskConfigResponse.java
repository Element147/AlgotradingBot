package com.algotrader.bot.controller;

import java.math.BigDecimal;

public class RiskConfigResponse {

    private BigDecimal maxRiskPerTrade;
    private BigDecimal maxDailyLossLimit;
    private BigDecimal maxDrawdownLimit;
    private Integer maxOpenPositions;
    private BigDecimal correlationLimit;
    private Boolean circuitBreakerActive;
    private String circuitBreakerReason;

    public RiskConfigResponse() {
    }

    public RiskConfigResponse(BigDecimal maxRiskPerTrade,
                              BigDecimal maxDailyLossLimit,
                              BigDecimal maxDrawdownLimit,
                              Integer maxOpenPositions,
                              BigDecimal correlationLimit,
                              Boolean circuitBreakerActive,
                              String circuitBreakerReason) {
        this.maxRiskPerTrade = maxRiskPerTrade;
        this.maxDailyLossLimit = maxDailyLossLimit;
        this.maxDrawdownLimit = maxDrawdownLimit;
        this.maxOpenPositions = maxOpenPositions;
        this.correlationLimit = correlationLimit;
        this.circuitBreakerActive = circuitBreakerActive;
        this.circuitBreakerReason = circuitBreakerReason;
    }

    public BigDecimal getMaxRiskPerTrade() {
        return maxRiskPerTrade;
    }

    public BigDecimal getMaxDailyLossLimit() {
        return maxDailyLossLimit;
    }

    public BigDecimal getMaxDrawdownLimit() {
        return maxDrawdownLimit;
    }

    public Integer getMaxOpenPositions() {
        return maxOpenPositions;
    }

    public BigDecimal getCorrelationLimit() {
        return correlationLimit;
    }

    public Boolean getCircuitBreakerActive() {
        return circuitBreakerActive;
    }

    public String getCircuitBreakerReason() {
        return circuitBreakerReason;
    }
}
