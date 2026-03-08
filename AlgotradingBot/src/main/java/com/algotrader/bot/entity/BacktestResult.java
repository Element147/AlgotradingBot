package com.algotrader.bot.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity representing backtest results for strategy validation.
 * Stores performance metrics and validation status for backtested trading strategies.
 */
@Entity
@Table(name = "backtest_results", indexes = {
    @Index(name = "idx_backtest_strategy", columnList = "strategy_id"),
    @Index(name = "idx_backtest_symbol", columnList = "symbol"),
    @Index(name = "idx_backtest_timestamp", columnList = "timestamp")
})
public class BacktestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 50)
    @Column(nullable = false, length = 50)
    private String strategyId;

    @NotNull
    @Size(min = 3, max = 20)
    @Column(nullable = false, length = 20)
    private String symbol;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime startDate;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime endDate;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal initialBalance;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal finalBalance;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal sharpeRatio;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal profitFactor;

    @NotNull
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal winRate;

    @NotNull
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal maxDrawdown;

    @NotNull
    @Column(nullable = false)
    private Integer totalTrades;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ValidationStatus validationStatus;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    /**
     * Validation status enum for backtest results
     */
    public enum ValidationStatus {
        PENDING,
        PASSED,
        FAILED,
        PRODUCTION_READY
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public BacktestResult() {
    }

    public BacktestResult(String strategyId, String symbol, LocalDateTime startDate,
                          LocalDateTime endDate, BigDecimal initialBalance, BigDecimal finalBalance,
                          BigDecimal sharpeRatio, BigDecimal profitFactor, BigDecimal winRate,
                          BigDecimal maxDrawdown, Integer totalTrades, ValidationStatus validationStatus) {
        this.strategyId = strategyId;
        this.symbol = symbol;
        this.startDate = startDate;
        this.endDate = endDate;
        this.initialBalance = initialBalance;
        this.finalBalance = finalBalance;
        this.sharpeRatio = sharpeRatio;
        this.profitFactor = profitFactor;
        this.winRate = winRate;
        this.maxDrawdown = maxDrawdown;
        this.totalTrades = totalTrades;
        this.validationStatus = validationStatus;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
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

    public BigDecimal getSharpeRatio() {
        return sharpeRatio;
    }

    public void setSharpeRatio(BigDecimal sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }

    public BigDecimal getProfitFactor() {
        return profitFactor;
    }

    public void setProfitFactor(BigDecimal profitFactor) {
        this.profitFactor = profitFactor;
    }

    public BigDecimal getWinRate() {
        return winRate;
    }

    public void setWinRate(BigDecimal winRate) {
        this.winRate = winRate;
    }

    public BigDecimal getMaxDrawdown() {
        return maxDrawdown;
    }

    public void setMaxDrawdown(BigDecimal maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
    }

    public Integer getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(Integer totalTrades) {
        this.totalTrades = totalTrades;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public String toString() {
        return "BacktestResult{" +
                "id=" + id +
                ", strategyId='" + strategyId + '\'' +
                ", symbol='" + symbol + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", initialBalance=" + initialBalance +
                ", finalBalance=" + finalBalance +
                ", sharpeRatio=" + sharpeRatio +
                ", profitFactor=" + profitFactor +
                ", winRate=" + winRate +
                ", maxDrawdown=" + maxDrawdown +
                ", totalTrades=" + totalTrades +
                ", validationStatus=" + validationStatus +
                ", timestamp=" + timestamp +
                '}';
    }
}
