package com.algotrader.bot.exchange.api;

public record ExchangeConnectionTestRequest(
    String exchange,
    String apiKey,
    String apiSecret,
    Boolean testnet
) {}
