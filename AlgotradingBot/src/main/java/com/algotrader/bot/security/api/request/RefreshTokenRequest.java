package com.algotrader.bot.security.api;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for refresh token endpoint.
 */
public record RefreshTokenRequest(
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {}
