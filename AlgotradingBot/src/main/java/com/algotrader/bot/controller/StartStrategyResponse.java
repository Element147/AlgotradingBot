package com.algotrader.bot.controller;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Response after starting a trading strategy")
public class StartStrategyResponse {
    
    @Schema(description = "Created account ID", example = "1")
    private Long accountId;
    
    @Schema(description = "Account status", example = "ACTIVE")
    private String status;
    
    @Schema(description = "Initial balance in USDT", example = "1000.00")
    private BigDecimal initialBalance;
    
    @Schema(description = "Success message", example = "Trading strategy started successfully")
    private String message;
    
    public StartStrategyResponse() {
    }
    
    public StartStrategyResponse(Long accountId, String status, BigDecimal initialBalance, String message) {
        this.accountId = accountId;
        this.status = status;
        this.initialBalance = initialBalance;
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
    
    public BigDecimal getInitialBalance() {
        return initialBalance;
    }
    
    public void setInitialBalance(BigDecimal initialBalance) {
        this.initialBalance = initialBalance;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
