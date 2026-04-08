package com.algotrader.bot.risk.api.response;

import java.time.LocalDateTime;

public record RiskAlertResponse(
    Long id,
    String type,
    String severity,
    String message,
    String actionTaken,
    LocalDateTime timestamp
) {}
