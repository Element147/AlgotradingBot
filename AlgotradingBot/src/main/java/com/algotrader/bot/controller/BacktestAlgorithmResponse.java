package com.algotrader.bot.controller;

public class BacktestAlgorithmResponse {

    private final String id;
    private final String label;
    private final String description;

    public BacktestAlgorithmResponse(String id, String label, String description) {
        this.id = id;
        this.label = label;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }
}
