package com.algotrader.bot.controller;

import java.time.LocalDateTime;

public class ExchangeConnectionStatusResponse {

    private boolean connected;
    private String exchange;
    private LocalDateTime lastSync;
    private String rateLimitUsage;
    private String error;

    public ExchangeConnectionStatusResponse() {
    }

    public ExchangeConnectionStatusResponse(
        boolean connected,
        String exchange,
        LocalDateTime lastSync,
        String rateLimitUsage,
        String error
    ) {
        this.connected = connected;
        this.exchange = exchange;
        this.lastSync = lastSync;
        this.rateLimitUsage = rateLimitUsage;
        this.error = error;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public LocalDateTime getLastSync() {
        return lastSync;
    }

    public void setLastSync(LocalDateTime lastSync) {
        this.lastSync = lastSync;
    }

    public String getRateLimitUsage() {
        return rateLimitUsage;
    }

    public void setRateLimitUsage(String rateLimitUsage) {
        this.rateLimitUsage = rateLimitUsage;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
