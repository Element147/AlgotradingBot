package com.algotrader.bot.controller;

import java.time.LocalDateTime;

/**
 * Response DTO for open positions endpoint.
 * Returns current open positions with unrealized P&L.
 */
public class OpenPositionResponse {

    private Long id;
    private String symbol;
    private String entryPrice;
    private String currentPrice;
    private String positionSize;
    private String unrealizedPnL;
    private String unrealizedPnLPercentage;
    private LocalDateTime entryTime;

    public OpenPositionResponse() {
    }

    public OpenPositionResponse(Long id, String symbol, String entryPrice, String currentPrice,
                               String positionSize, String unrealizedPnL, 
                               String unrealizedPnLPercentage, LocalDateTime entryTime) {
        this.id = id;
        this.symbol = symbol;
        this.entryPrice = entryPrice;
        this.currentPrice = currentPrice;
        this.positionSize = positionSize;
        this.unrealizedPnL = unrealizedPnL;
        this.unrealizedPnLPercentage = unrealizedPnLPercentage;
        this.entryTime = entryTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getEntryPrice() {
        return entryPrice;
    }

    public void setEntryPrice(String entryPrice) {
        this.entryPrice = entryPrice;
    }

    public String getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(String currentPrice) {
        this.currentPrice = currentPrice;
    }

    public String getPositionSize() {
        return positionSize;
    }

    public void setPositionSize(String positionSize) {
        this.positionSize = positionSize;
    }

    public String getUnrealizedPnL() {
        return unrealizedPnL;
    }

    public void setUnrealizedPnL(String unrealizedPnL) {
        this.unrealizedPnL = unrealizedPnL;
    }

    public String getUnrealizedPnLPercentage() {
        return unrealizedPnLPercentage;
    }

    public void setUnrealizedPnLPercentage(String unrealizedPnLPercentage) {
        this.unrealizedPnLPercentage = unrealizedPnLPercentage;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }
}
