package com.algotrader.bot.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaperTradingStateResponse {

    private Boolean paperMode;
    private BigDecimal cashBalance;
    private Integer positionCount;
    private Long totalOrders;
    private Long openOrders;
    private Long filledOrders;
    private Long cancelledOrders;
    private LocalDateTime lastOrderAt;

    public PaperTradingStateResponse(Boolean paperMode,
                                     BigDecimal cashBalance,
                                     Integer positionCount,
                                     Long totalOrders,
                                     Long openOrders,
                                     Long filledOrders,
                                     Long cancelledOrders,
                                     LocalDateTime lastOrderAt) {
        this.paperMode = paperMode;
        this.cashBalance = cashBalance;
        this.positionCount = positionCount;
        this.totalOrders = totalOrders;
        this.openOrders = openOrders;
        this.filledOrders = filledOrders;
        this.cancelledOrders = cancelledOrders;
        this.lastOrderAt = lastOrderAt;
    }

    public Boolean getPaperMode() {
        return paperMode;
    }

    public BigDecimal getCashBalance() {
        return cashBalance;
    }

    public Integer getPositionCount() {
        return positionCount;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public Long getOpenOrders() {
        return openOrders;
    }

    public Long getFilledOrders() {
        return filledOrders;
    }

    public Long getCancelledOrders() {
        return cancelledOrders;
    }

    public LocalDateTime getLastOrderAt() {
        return lastOrderAt;
    }
}
