package com.algotrader.bot.system.api.response;

import java.time.LocalDateTime;

public record OperatorAuditSummaryResponse(
    Integer visibleEventCount,
    Long totalMatchingEvents,
    Integer successCount,
    Integer failedCount,
    Integer uniqueActors,
    Integer uniqueActions,
    Integer testEventCount,
    Integer paperEventCount,
    Integer liveEventCount,
    LocalDateTime latestEventAt
) {}
