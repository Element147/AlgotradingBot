package com.algotrader.bot.controller;

public class StrategyActionResponse {

    private Long strategyId;
    private String status;
    private String message;

    public StrategyActionResponse() {
    }

    public StrategyActionResponse(Long strategyId, String status, String message) {
        this.strategyId = strategyId;
        this.status = status;
        this.message = message;
    }

    public Long getStrategyId() {
        return strategyId;
    }

    public void setStrategyId(Long strategyId) {
        this.strategyId = strategyId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
