package com.algotrader.bot.controller;

/**
 * Response DTO for account performance endpoint.
 * Returns performance metrics for specified timeframe.
 */
public class PerformanceResponse {

    private String totalProfitLoss;
    private String profitLossPercentage;
    private String winRate;
    private Integer tradeCount;
    private String cashRatio;

    public PerformanceResponse() {
    }

    public PerformanceResponse(String totalProfitLoss, String profitLossPercentage, 
                              String winRate, Integer tradeCount, String cashRatio) {
        this.totalProfitLoss = totalProfitLoss;
        this.profitLossPercentage = profitLossPercentage;
        this.winRate = winRate;
        this.tradeCount = tradeCount;
        this.cashRatio = cashRatio;
    }

    public String getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public void setTotalProfitLoss(String totalProfitLoss) {
        this.totalProfitLoss = totalProfitLoss;
    }

    public String getProfitLossPercentage() {
        return profitLossPercentage;
    }

    public void setProfitLossPercentage(String profitLossPercentage) {
        this.profitLossPercentage = profitLossPercentage;
    }

    public String getWinRate() {
        return winRate;
    }

    public void setWinRate(String winRate) {
        this.winRate = winRate;
    }

    public Integer getTradeCount() {
        return tradeCount;
    }

    public void setTradeCount(Integer tradeCount) {
        this.tradeCount = tradeCount;
    }

    public String getCashRatio() {
        return cashRatio;
    }

    public void setCashRatio(String cashRatio) {
        this.cashRatio = cashRatio;
    }
}
