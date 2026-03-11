package com.algotrader.bot.controller;

public class BacktestAlgorithmResponse {

    private final String id;
    private final String label;
    private final String description;
    private final String selectionMode;

    public BacktestAlgorithmResponse(String id, String label, String description, String selectionMode) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.selectionMode = selectionMode;
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

    public String getSelectionMode() {
        return selectionMode;
    }
}
