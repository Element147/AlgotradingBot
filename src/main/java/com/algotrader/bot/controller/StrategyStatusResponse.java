package com.algotrader.bot.controller;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Current status and performance metrics of a trading strategy")
public class StrategyStatusResponse {
    
    @Schema(description = "Current account value in USDT", example = "1100.00")
    private BigDecimal accountValue;
    
    @Schema(description = "Total profit/loss in USDT", example = "100.00")
    private BigDecimal pnl;
    
    @Schema(description = "Profit/loss as a percentage", example = "10.00")
    private BigDecimal pnlPercent;
    
    @Schema(description = "Sharpe ratio (risk-adjusted return)", example = "1.25")
    private BigDecimal sharpeRatio;
    
    @Schema(description = "Maximum drawdown in USDT", example = "50.00")
    private BigDecimal maxDrawdown;
    
    @Schema(description = "Maximum drawdown as a percentage", example = "5.00")
    private BigDecimal maxDrawdownPercent;
    
    @Schema(description = "Number of currently open positions", example = "2")
    private int openPositions;
    
    @Schema(description = "Total number of trades executed", example = "25")
    private int totalTrades;
    
    @Schema(description = "Win rate as a percentage", example = "52.50")
    private BigDecimal winRate;
    
    @Schema(description = "Profit factor (gross profit / gross loss)", example = "1.75")
    private BigDecimal profitFactor;
    
    @Schema(description = "Account status", example = "ACTIVE", allowableValues = {"ACTIVE", "STOPPED", "CIRCUIT_BREAKER_TRIGGERED"})
    private String status;
    
    public StrategyStatusResponse() {
    }
    
    public StrategyStatusResponse(BigDecimal accountValue, BigDecimal pnl, BigDecimal pnlPercent,
                                 BigDecimal sharpeRatio, BigDecimal maxDrawdown, BigDecimal maxDrawdownPercent,
                                 int openPositions, int totalTrades, BigDecimal winRate,
                                 BigDecimal profitFactor, String status) {
        this.accountValue = accountValue;
        this.pnl = pnl;
        this.pnlPercent = pnlPercent;
        this.sharpeRatio = sharpeRatio;
        this.maxDrawdown = maxDrawdown;
        this.maxDrawdownPercent = maxDrawdownPercent;
        this.openPositions = openPositions;
        this.totalTrades = totalTrades;
        this.winRate = winRate;
        this.profitFactor = profitFactor;
        this.status = status;
    }
    
    public BigDecimal getAccountValue() {
        return accountValue;
    }
    
    public void setAccountValue(BigDecimal accountValue) {
        this.accountValue = accountValue;
    }
    
    public BigDecimal getPnl() {
        return pnl;
    }
    
    public void setPnl(BigDecimal pnl) {
        this.pnl = pnl;
    }
    
    public BigDecimal getPnlPercent() {
        return pnlPercent;
    }
    
    public void setPnlPercent(BigDecimal pnlPercent) {
        this.pnlPercent = pnlPercent;
    }
    
    public BigDecimal getSharpeRatio() {
        return sharpeRatio;
    }
    
    public void setSharpeRatio(BigDecimal sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }
    
    public BigDecimal getMaxDrawdown() {
        return maxDrawdown;
    }
    
    public void setMaxDrawdown(BigDecimal maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
    }
    
    public BigDecimal getMaxDrawdownPercent() {
        return maxDrawdownPercent;
    }
    
    public void setMaxDrawdownPercent(BigDecimal maxDrawdownPercent) {
        this.maxDrawdownPercent = maxDrawdownPercent;
    }
    
    public int getOpenPositions() {
        return openPositions;
    }
    
    public void setOpenPositions(int openPositions) {
        this.openPositions = openPositions;
    }
    
    public int getTotalTrades() {
        return totalTrades;
    }
    
    public void setTotalTrades(int totalTrades) {
        this.totalTrades = totalTrades;
    }
    
    public BigDecimal getWinRate() {
        return winRate;
    }
    
    public void setWinRate(BigDecimal winRate) {
        this.winRate = winRate;
    }
    
    public BigDecimal getProfitFactor() {
        return profitFactor;
    }
    
    public void setProfitFactor(BigDecimal profitFactor) {
        this.profitFactor = profitFactor;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
