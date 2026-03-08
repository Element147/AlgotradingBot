package com.algotrader.bot.controller;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Backtest result with comprehensive performance metrics")
public class BacktestResultResponse {
    
    @Schema(description = "Strategy identifier", example = "bollinger-bands-v1")
    private String strategyId;
    
    @Schema(description = "Trading pair symbol", example = "BTC/USDT")
    private String symbol;
    
    @Schema(description = "Date range of backtest", example = "2022-01-01 to 2024-01-01")
    private String dateRange;
    
    @Schema(description = "Initial balance in USDT", example = "1000.00")
    private BigDecimal initialBalance;
    
    @Schema(description = "Final balance in USDT", example = "1500.00")
    private BigDecimal finalBalance;
    
    @Schema(description = "Total return as percentage", example = "50.00")
    private BigDecimal totalReturn;
    
    @Schema(description = "Annualized return as percentage", example = "25.00")
    private BigDecimal annualReturn;
    
    @Schema(description = "Sharpe ratio (risk-adjusted return)", example = "1.25")
    private BigDecimal sharpeRatio;
    
    @Schema(description = "Calmar ratio (return / max drawdown)", example = "1.80")
    private BigDecimal calmarRatio;
    
    @Schema(description = "Maximum drawdown as percentage", example = "18.50")
    private BigDecimal maxDrawdown;
    
    @Schema(description = "Win rate as percentage", example = "52.50")
    private BigDecimal winRate;
    
    @Schema(description = "Profit factor (gross profit / gross loss)", example = "1.75")
    private BigDecimal profitFactor;
    
    @Schema(description = "Total number of trades", example = "150")
    private int totalTrades;
    
    @Schema(description = "Number of winning sessions", example = "78")
    private int winningSessions;
    
    @Schema(description = "Number of losing sessions", example = "72")
    private int losingSessions;
    
    @Schema(description = "Validation status", example = "PASSED", allowableValues = {"PASSED", "FAILED", "PENDING"})
    private String validationStatus;
    
    public BacktestResultResponse() {
    }
    
    public BacktestResultResponse(String strategyId, String symbol, String dateRange,
                                 BigDecimal initialBalance, BigDecimal finalBalance,
                                 BigDecimal totalReturn, BigDecimal annualReturn,
                                 BigDecimal sharpeRatio, BigDecimal calmarRatio,
                                 BigDecimal maxDrawdown, BigDecimal winRate,
                                 BigDecimal profitFactor, int totalTrades,
                                 int winningSessions, int losingSessions,
                                 String validationStatus) {
        this.strategyId = strategyId;
        this.symbol = symbol;
        this.dateRange = dateRange;
        this.initialBalance = initialBalance;
        this.finalBalance = finalBalance;
        this.totalReturn = totalReturn;
        this.annualReturn = annualReturn;
        this.sharpeRatio = sharpeRatio;
        this.calmarRatio = calmarRatio;
        this.maxDrawdown = maxDrawdown;
        this.winRate = winRate;
        this.profitFactor = profitFactor;
        this.totalTrades = totalTrades;
        this.winningSessions = winningSessions;
        this.losingSessions = losingSessions;
        this.validationStatus = validationStatus;
    }
    
    public String getStrategyId() {
        return strategyId;
    }
    
    public void setStrategyId(String strategyId) {
        this.strategyId = strategyId;
    }
    
    public String getSymbol() {
        return symbol;
    }
    
    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }
    
    public String getDateRange() {
        return dateRange;
    }
    
    public void setDateRange(String dateRange) {
        this.dateRange = dateRange;
    }
    
    public BigDecimal getInitialBalance() {
        return initialBalance;
    }
    
    public void setInitialBalance(BigDecimal initialBalance) {
        this.initialBalance = initialBalance;
    }
    
    public BigDecimal getFinalBalance() {
        return finalBalance;
    }
    
    public void setFinalBalance(BigDecimal finalBalance) {
        this.finalBalance = finalBalance;
    }
    
    public BigDecimal getTotalReturn() {
        return totalReturn;
    }
    
    public void setTotalReturn(BigDecimal totalReturn) {
        this.totalReturn = totalReturn;
    }
    
    public BigDecimal getAnnualReturn() {
        return annualReturn;
    }
    
    public void setAnnualReturn(BigDecimal annualReturn) {
        this.annualReturn = annualReturn;
    }
    
    public BigDecimal getSharpeRatio() {
        return sharpeRatio;
    }
    
    public void setSharpeRatio(BigDecimal sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }
    
    public BigDecimal getCalmarRatio() {
        return calmarRatio;
    }
    
    public void setCalmarRatio(BigDecimal calmarRatio) {
        this.calmarRatio = calmarRatio;
    }
    
    public BigDecimal getMaxDrawdown() {
        return maxDrawdown;
    }
    
    public void setMaxDrawdown(BigDecimal maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
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
    
    public int getTotalTrades() {
        return totalTrades;
    }
    
    public void setTotalTrades(int totalTrades) {
        this.totalTrades = totalTrades;
    }
    
    public int getWinningSessions() {
        return winningSessions;
    }
    
    public void setWinningSessions(int winningSessions) {
        this.winningSessions = winningSessions;
    }
    
    public int getLosingSessions() {
        return losingSessions;
    }
    
    public void setLosingSessions(int losingSessions) {
        this.losingSessions = losingSessions;
    }
    
    public String getValidationStatus() {
        return validationStatus;
    }
    
    public void setValidationStatus(String validationStatus) {
        this.validationStatus = validationStatus;
    }
}
