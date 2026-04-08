package com.algotrader.bot.exchange.api.response;

import java.time.LocalDateTime;

public record ExchangeConnectionStatusResponse(
    boolean connected,
    String exchange,
    LocalDateTime lastSync,
    String rateLimitUsage,
    String error
) {}
