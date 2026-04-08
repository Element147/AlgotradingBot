package com.algotrader.bot.risk.api;

import java.math.BigDecimal;

public record RiskConfigResponse(
    BigDecimal maxRiskPerTrade,
    BigDecimal maxDailyLossLimit,
    BigDecimal maxDrawdownLimit,
    Integer maxOpenPositions,
    BigDecimal correlationLimit,
    Boolean circuitBreakerActive,
    String circuitBreakerReason
) {}
