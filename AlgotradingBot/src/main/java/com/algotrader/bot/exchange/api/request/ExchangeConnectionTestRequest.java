package com.algotrader.bot.exchange.api.request;

public record ExchangeConnectionTestRequest(
    String exchange,
    String apiKey,
    String apiSecret,
    Boolean testnet
) {}
