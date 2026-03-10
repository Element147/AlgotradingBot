package com.algotrader.bot.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for account balance endpoint.
 * Returns total, available, and locked balance with asset breakdown.
 */
public class BalanceResponse {

    private String total;
    private String available;
    private String locked;
    private List<AssetBalance> assets;
    private LocalDateTime lastSync;

    public BalanceResponse() {
    }

    public BalanceResponse(String total, String available, String locked, 
                          List<AssetBalance> assets, LocalDateTime lastSync) {
        this.total = total;
        this.available = available;
        this.locked = locked;
        this.assets = assets;
        this.lastSync = lastSync;
    }

    public static class AssetBalance {
        private String symbol;
        private String amount;
        private String valueUSD;

        public AssetBalance() {
        }

        public AssetBalance(String symbol, String amount, String valueUSD) {
            this.symbol = symbol;
            this.amount = amount;
            this.valueUSD = valueUSD;
        }

        public String getSymbol() {
            return symbol;
        }

        public void setSymbol(String symbol) {
            this.symbol = symbol;
        }

        public String getAmount() {
            return amount;
        }

        public void setAmount(String amount) {
            this.amount = amount;
        }

        public String getValueUSD() {
            return valueUSD;
        }

        public void setValueUSD(String valueUSD) {
            this.valueUSD = valueUSD;
        }
    }

    public String getTotal() {
        return total;
    }

    public void setTotal(String total) {
        this.total = total;
    }

    public String getAvailable() {
        return available;
    }

    public void setAvailable(String available) {
        this.available = available;
    }

    public String getLocked() {
        return locked;
    }

    public void setLocked(String locked) {
        this.locked = locked;
    }

    public List<AssetBalance> getAssets() {
        return assets;
    }

    public void setAssets(List<AssetBalance> assets) {
        this.assets = assets;
    }

    public LocalDateTime getLastSync() {
        return lastSync;
    }

    public void setLastSync(LocalDateTime lastSync) {
        this.lastSync = lastSync;
    }
}
