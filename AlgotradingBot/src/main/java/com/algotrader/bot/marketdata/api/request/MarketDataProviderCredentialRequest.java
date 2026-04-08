package com.algotrader.bot.marketdata.api;

import jakarta.validation.constraints.Size;

public record MarketDataProviderCredentialRequest(
    @Size(max = 500, message = "API key must be <= 500 characters")
    String apiKey,
    @Size(max = 500, message = "Note must be <= 500 characters")
    String note
) {
}
