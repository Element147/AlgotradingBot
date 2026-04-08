package com.algotrader.bot.marketdata.application.service;

import java.net.http.HttpHeaders;

public record MarketDataHttpResponse(
    int statusCode,
    String body,
    HttpHeaders headers
) {
}
