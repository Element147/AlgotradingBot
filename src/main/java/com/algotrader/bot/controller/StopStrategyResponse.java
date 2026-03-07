package com.algotrader.bot.controller;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Response after stopping a trading strategy")
public class StopStrategyResponse {
    
    @Schema(description = "Account ID", example = "1")
    private Long accountId;
    
    @Schema(description = "Account status", example = "STOPPED")
    private String status;
    
    @Schema(description = "Final balance in USDT", example = "1100.00")
    private BigDecimal finalBalance;
    
    @Schema(description = "Total profit/loss in USDT", example = "100.00")
    private BigDecimal totalPnl;
    
    @Schema(description = "Profit/loss as percentage", example = "10.00")
    private BigDecimal pnlPercent;
    
    @Schema(description = "Success message", example = "Trading strategy stopped successfully")
    private String message;
    
    public StopStrategyResponse() {
    }
    
    public StopStrategyResponse(Long accountId, String status, BigDecimal finalBalance, 
                               BigDecimal totalPnl, BigDecimal pnlPercent, String message) {
        this.accountId = accountId;
        this.status = status;
        this.finalBalance = finalBalance;
        this.totalPnl = totalPnl;
        this.pnlPercent = pnlPercent;
        this.message = message;
    }
    
    public Long getAccountId() {
        return accountId;
    }
    
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public BigDecimal getFinalBalance() {
        return finalBalance;
    }
    
    public void setFinalBalance(BigDecimal finalBalance) {
        this.finalBalance = finalBalance;
    }
    
    public BigDecimal getTotalPnl() {
        return totalPnl;
    }
    
    public void setTotalPnl(BigDecimal totalPnl) {
        this.totalPnl = totalPnl;
    }
    
    public BigDecimal getPnlPercent() {
        return pnlPercent;
    }
    
    public void setPnlPercent(BigDecimal pnlPercent) {
        this.pnlPercent = pnlPercent;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
