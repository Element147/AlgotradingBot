package com.algotrader.bot.risk.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CircuitBreakerOverrideRequest(
    @NotBlank
    String confirmationCode,
    @NotBlank
    @Size(min = 5, max = 255)
    String reason
) {}
