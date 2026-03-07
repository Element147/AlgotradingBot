package com.algotrader.bot.controller;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Historical trade information")
public class TradeHistoryResponse {
    
    @Schema(description = "Trade ID", example = "1")
    private Long id;
    
    @Schema(description = "Trading pair symbol", example = "BTC/USDT")
    private String pair;
    
    @Schema(description = "Trade entry timestamp", example = "2024-01-15T10:30:00")
    private LocalDateTime entryTime;
    
    @Schema(description = "Entry price in USDT", example = "50000.00")
    private BigDecimal entryPrice;
    
    @Schema(description = "Trade exit timestamp", example = "2024-01-15T14:30:00")
    private LocalDateTime exitTime;
    
    @Schema(description = "Exit price in USDT", example = "51000.00")
    private BigDecimal exitPrice;
    
    @Schema(description = "Trade signal type", example = "BUY", allowableValues = {"BUY", "SELL"})
    private String signal;
    
    @Schema(description = "Position size (quantity)", example = "0.01")
    private BigDecimal positionSize;
    
    @Schema(description = "Risk amount in USDT", example = "20.00")
    private BigDecimal riskAmount;
    
    @Schema(description = "Profit/loss in USDT", example = "10.00")
    private BigDecimal pnl;
    
    @Schema(description = "Actual fees paid in USDT", example = "5.00")
    private BigDecimal feesActual;
    
    @Schema(description = "Actual slippage in USDT", example = "1.50")
    private BigDecimal slippageActual;
    
    @Schema(description = "Stop loss price", example = "49000.00")
    private BigDecimal stopLoss;
    
    @Schema(description = "Take profit price", example = "51000.00")
    private BigDecimal takeProfit;
    
    public TradeHistoryResponse() {
    }
    
    public TradeHistoryResponse(Long id, String pair, LocalDateTime entryTime, BigDecimal entryPrice,
                               LocalDateTime exitTime, BigDecimal exitPrice, String signal,
                               BigDecimal positionSize, BigDecimal riskAmount, BigDecimal pnl,
                               BigDecimal feesActual, BigDecimal slippageActual,
                               BigDecimal stopLoss, BigDecimal takeProfit) {
        this.id = id;
        this.pair = pair;
        this.entryTime = entryTime;
        this.entryPrice = entryPrice;
        this.exitTime = exitTime;
        this.exitPrice = exitPrice;
        this.signal = signal;
        this.positionSize = positionSize;
        this.riskAmount = riskAmount;
        this.pnl = pnl;
        this.feesActual = feesActual;
        this.slippageActual = slippageActual;
        this.stopLoss = stopLoss;
        this.takeProfit = takeProfit;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getPair() {
        return pair;
    }
    
    public void setPair(String pair) {
        this.pair = pair;
    }
    
    public LocalDateTime getEntryTime() {
        return entryTime;
    }
    
    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }
    
    public BigDecimal getEntryPrice() {
        return entryPrice;
    }
    
    public void setEntryPrice(BigDecimal entryPrice) {
        this.entryPrice = entryPrice;
    }
    
    public LocalDateTime getExitTime() {
        return exitTime;
    }
    
    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }
    
    public BigDecimal getExitPrice() {
        return exitPrice;
    }
    
    public void setExitPrice(BigDecimal exitPrice) {
        this.exitPrice = exitPrice;
    }
    
    public String getSignal() {
        return signal;
    }
    
    public void setSignal(String signal) {
        this.signal = signal;
    }
    
    public BigDecimal getPositionSize() {
        return positionSize;
    }
    
    public void setPositionSize(BigDecimal positionSize) {
        this.positionSize = positionSize;
    }
    
    public BigDecimal getRiskAmount() {
        return riskAmount;
    }
    
    public void setRiskAmount(BigDecimal riskAmount) {
        this.riskAmount = riskAmount;
    }
    
    public BigDecimal getPnl() {
        return pnl;
    }
    
    public void setPnl(BigDecimal pnl) {
        this.pnl = pnl;
    }
    
    public BigDecimal getFeesActual() {
        return feesActual;
    }
    
    public void setFeesActual(BigDecimal feesActual) {
        this.feesActual = feesActual;
    }
    
    public BigDecimal getSlippageActual() {
        return slippageActual;
    }
    
    public void setSlippageActual(BigDecimal slippageActual) {
        this.slippageActual = slippageActual;
    }
    
    public BigDecimal getStopLoss() {
        return stopLoss;
    }
    
    public void setStopLoss(BigDecimal stopLoss) {
        this.stopLoss = stopLoss;
    }
    
    public BigDecimal getTakeProfit() {
        return takeProfit;
    }
    
    public void setTakeProfit(BigDecimal takeProfit) {
        this.takeProfit = takeProfit;
    }
}
