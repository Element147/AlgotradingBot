package com.algotrader.bot.controller;

public class ExchangeConnectionTestRequest {

    private String exchange;
    private String apiKey;
    private String apiSecret;
    private Boolean testnet;

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiSecret() {
        return apiSecret;
    }

    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }

    public Boolean getTestnet() {
        return testnet;
    }

    public void setTestnet(Boolean testnet) {
        this.testnet = testnet;
    }
}
