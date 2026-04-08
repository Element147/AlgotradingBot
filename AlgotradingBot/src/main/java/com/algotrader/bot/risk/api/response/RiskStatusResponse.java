package com.algotrader.bot.risk.api;

import java.math.BigDecimal;

public record RiskStatusResponse(
    BigDecimal currentDrawdown,
    BigDecimal maxDrawdownLimit,
    BigDecimal dailyLoss,
    BigDecimal dailyLossLimit,
    BigDecimal openRiskExposure,
    BigDecimal positionCorrelation,
    Boolean circuitBreakerActive,
    String circuitBreakerReason
) {}
