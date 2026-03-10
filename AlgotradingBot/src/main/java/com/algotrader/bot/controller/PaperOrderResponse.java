package com.algotrader.bot.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaperOrderResponse {

    private Long id;
    private String symbol;
    private String side;
    private String status;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal fillPrice;
    private BigDecimal fees;
    private BigDecimal slippage;
    private LocalDateTime createdAt;

    public PaperOrderResponse(Long id,
                              String symbol,
                              String side,
                              String status,
                              BigDecimal quantity,
                              BigDecimal price,
                              BigDecimal fillPrice,
                              BigDecimal fees,
                              BigDecimal slippage,
                              LocalDateTime createdAt) {
        this.id = id;
        this.symbol = symbol;
        this.side = side;
        this.status = status;
        this.quantity = quantity;
        this.price = price;
        this.fillPrice = fillPrice;
        this.fees = fees;
        this.slippage = slippage;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getSide() {
        return side;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getFillPrice() {
        return fillPrice;
    }

    public BigDecimal getFees() {
        return fees;
    }

    public BigDecimal getSlippage() {
        return slippage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
