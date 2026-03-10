package com.algotrader.bot.controller;

import java.math.BigDecimal;

public class StrategyDetailsResponse {

    private Long id;
    private String name;
    private String type;
    private String status;
    private String symbol;
    private String timeframe;
    private BigDecimal riskPerTrade;
    private BigDecimal minPositionSize;
    private BigDecimal maxPositionSize;
    private BigDecimal profitLoss;
    private Integer tradeCount;
    private BigDecimal currentDrawdown;
    private Boolean paperMode;

    public StrategyDetailsResponse() {
    }

    public StrategyDetailsResponse(Long id,
                                   String name,
                                   String type,
                                   String status,
                                   String symbol,
                                   String timeframe,
                                   BigDecimal riskPerTrade,
                                   BigDecimal minPositionSize,
                                   BigDecimal maxPositionSize,
                                   BigDecimal profitLoss,
                                   Integer tradeCount,
                                   BigDecimal currentDrawdown,
                                   Boolean paperMode) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.status = status;
        this.symbol = symbol;
        this.timeframe = timeframe;
        this.riskPerTrade = riskPerTrade;
        this.minPositionSize = minPositionSize;
        this.maxPositionSize = maxPositionSize;
        this.profitLoss = profitLoss;
        this.tradeCount = tradeCount;
        this.currentDrawdown = currentDrawdown;
        this.paperMode = paperMode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getTimeframe() {
        return timeframe;
    }

    public void setTimeframe(String timeframe) {
        this.timeframe = timeframe;
    }

    public BigDecimal getRiskPerTrade() {
        return riskPerTrade;
    }

    public void setRiskPerTrade(BigDecimal riskPerTrade) {
        this.riskPerTrade = riskPerTrade;
    }

    public BigDecimal getMinPositionSize() {
        return minPositionSize;
    }

    public void setMinPositionSize(BigDecimal minPositionSize) {
        this.minPositionSize = minPositionSize;
    }

    public BigDecimal getMaxPositionSize() {
        return maxPositionSize;
    }

    public void setMaxPositionSize(BigDecimal maxPositionSize) {
        this.maxPositionSize = maxPositionSize;
    }

    public BigDecimal getProfitLoss() {
        return profitLoss;
    }

    public void setProfitLoss(BigDecimal profitLoss) {
        this.profitLoss = profitLoss;
    }

    public Integer getTradeCount() {
        return tradeCount;
    }

    public void setTradeCount(Integer tradeCount) {
        this.tradeCount = tradeCount;
    }

    public BigDecimal getCurrentDrawdown() {
        return currentDrawdown;
    }

    public void setCurrentDrawdown(BigDecimal currentDrawdown) {
        this.currentDrawdown = currentDrawdown;
    }

    public Boolean getPaperMode() {
        return paperMode;
    }

    public void setPaperMode(Boolean paperMode) {
        this.paperMode = paperMode;
    }
}
