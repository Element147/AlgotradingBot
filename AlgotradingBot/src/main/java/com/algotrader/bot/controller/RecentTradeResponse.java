package com.algotrader.bot.controller;

import java.time.LocalDateTime;

/**
 * Response DTO for recent trades endpoint.
 * Returns completed trades with entry/exit details and P&L.
 */
public class RecentTradeResponse {

    private Long id;
    private String symbol;
    private String side;
    private String entryPrice;
    private String exitPrice;
    private String quantity;
    private String profitLoss;
    private String profitLossPercentage;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;

    public RecentTradeResponse() {
    }

    public RecentTradeResponse(Long id, String symbol, String side, String entryPrice,
                              String exitPrice, String quantity, String profitLoss,
                              String profitLossPercentage, LocalDateTime entryTime,
                              LocalDateTime exitTime) {
        this.id = id;
        this.symbol = symbol;
        this.side = side;
        this.entryPrice = entryPrice;
        this.exitPrice = exitPrice;
        this.quantity = quantity;
        this.profitLoss = profitLoss;
        this.profitLossPercentage = profitLossPercentage;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
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

    public String getSide() {
        return side;
    }

    public void setSide(String side) {
        this.side = side;
    }

    public String getEntryPrice() {
        return entryPrice;
    }

    public void setEntryPrice(String entryPrice) {
        this.entryPrice = entryPrice;
    }

    public String getExitPrice() {
        return exitPrice;
    }

    public void setExitPrice(String exitPrice) {
        this.exitPrice = exitPrice;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public String getProfitLoss() {
        return profitLoss;
    }

    public void setProfitLoss(String profitLoss) {
        this.profitLoss = profitLoss;
    }

    public String getProfitLossPercentage() {
        return profitLossPercentage;
    }

    public void setProfitLossPercentage(String profitLossPercentage) {
        this.profitLossPercentage = profitLossPercentage;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    public LocalDateTime getExitTime() {
        return exitTime;
    }

    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }
}
