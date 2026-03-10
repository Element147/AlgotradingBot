package com.algotrader.bot.controller;

import java.math.BigDecimal;

public class RiskStatusResponse {

    private BigDecimal currentDrawdown;
    private BigDecimal maxDrawdownLimit;
    private BigDecimal dailyLoss;
    private BigDecimal dailyLossLimit;
    private BigDecimal openRiskExposure;
    private BigDecimal positionCorrelation;
    private Boolean circuitBreakerActive;
    private String circuitBreakerReason;

    public RiskStatusResponse() {
    }

    public RiskStatusResponse(BigDecimal currentDrawdown,
                              BigDecimal maxDrawdownLimit,
                              BigDecimal dailyLoss,
                              BigDecimal dailyLossLimit,
                              BigDecimal openRiskExposure,
                              BigDecimal positionCorrelation,
                              Boolean circuitBreakerActive,
                              String circuitBreakerReason) {
        this.currentDrawdown = currentDrawdown;
        this.maxDrawdownLimit = maxDrawdownLimit;
        this.dailyLoss = dailyLoss;
        this.dailyLossLimit = dailyLossLimit;
        this.openRiskExposure = openRiskExposure;
        this.positionCorrelation = positionCorrelation;
        this.circuitBreakerActive = circuitBreakerActive;
        this.circuitBreakerReason = circuitBreakerReason;
    }

    public BigDecimal getCurrentDrawdown() {
        return currentDrawdown;
    }

    public BigDecimal getMaxDrawdownLimit() {
        return maxDrawdownLimit;
    }

    public BigDecimal getDailyLoss() {
        return dailyLoss;
    }

    public BigDecimal getDailyLossLimit() {
        return dailyLossLimit;
    }

    public BigDecimal getOpenRiskExposure() {
        return openRiskExposure;
    }

    public BigDecimal getPositionCorrelation() {
        return positionCorrelation;
    }

    public Boolean getCircuitBreakerActive() {
        return circuitBreakerActive;
    }

    public String getCircuitBreakerReason() {
        return circuitBreakerReason;
    }
}
