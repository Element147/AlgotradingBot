package com.algotrader.bot.shared.api.response;

import java.time.LocalDateTime;

public record AsyncTaskMonitorResponse(
    String state,
    Integer attemptCount,
    Integer maxAttempts,
    LocalDateTime nextRetryAt,
    Boolean retryEligible,
    Boolean timedOut,
    Long timeoutThresholdSeconds
) {
}
