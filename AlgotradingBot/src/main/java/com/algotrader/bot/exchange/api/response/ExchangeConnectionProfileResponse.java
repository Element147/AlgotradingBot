package com.algotrader.bot.exchange.api;

import java.time.LocalDateTime;

public record ExchangeConnectionProfileResponse(
    String id,
    String name,
    String exchange,
    String apiKey,
    String apiSecret,
    boolean testnet,
    boolean active,
    LocalDateTime updatedAt
) {}
