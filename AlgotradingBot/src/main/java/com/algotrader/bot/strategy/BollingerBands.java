package com.algotrader.bot.strategy;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Immutable value object representing Bollinger Bands calculation results.
 * 
 * Bollinger Bands consist of:
 * - Middle band: Simple Moving Average (SMA)
 * - Upper band: SMA + (standard deviation × multiplier)
 * - Lower band: SMA - (standard deviation × multiplier)
 * 
 * Used for mean reversion trading strategy.
 */
public final class BollingerBands {
    
    private final BigDecimal upperBand;
    private final BigDecimal middleBand;
    private final BigDecimal lowerBand;
    private final BigDecimal standardDeviation;
    private final Instant timestamp;
    
    /**
     * Creates a new BollingerBands instance.
     * 
     * @param upperBand the upper Bollinger Band value
     * @param middleBand the middle band (SMA) value
     * @param lowerBand the lower Bollinger Band value
     * @param standardDeviation the standard deviation used in calculation
     * @param timestamp the time when these bands were calculated
     * @throws IllegalArgumentException if any parameter is null
     */
    public BollingerBands(BigDecimal upperBand, BigDecimal middleBand, BigDecimal lowerBand, 
                          BigDecimal standardDeviation, Instant timestamp) {
        if (upperBand == null || middleBand == null || lowerBand == null || 
            standardDeviation == null || timestamp == null) {
            throw new IllegalArgumentException("All parameters must be non-null");
        }
        
        this.upperBand = upperBand;
        this.middleBand = middleBand;
        this.lowerBand = lowerBand;
        this.standardDeviation = standardDeviation;
        this.timestamp = timestamp;
    }
    
    public BigDecimal getUpperBand() {
        return upperBand;
    }
    
    public BigDecimal getMiddleBand() {
        return middleBand;
    }
    
    public BigDecimal getLowerBand() {
        return lowerBand;
    }
    
    public BigDecimal getStandardDeviation() {
        return standardDeviation;
    }
    
    public Instant getTimestamp() {
        return timestamp;
    }
    
    @Override
    public String toString() {
        return "BollingerBands{" +
                "upperBand=" + upperBand +
                ", middleBand=" + middleBand +
                ", lowerBand=" + lowerBand +
                ", standardDeviation=" + standardDeviation +
                ", timestamp=" + timestamp +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        BollingerBands that = (BollingerBands) o;
        
        if (!upperBand.equals(that.upperBand)) return false;
        if (!middleBand.equals(that.middleBand)) return false;
        if (!lowerBand.equals(that.lowerBand)) return false;
        if (!standardDeviation.equals(that.standardDeviation)) return false;
        return timestamp.equals(that.timestamp);
    }
    
    @Override
    public int hashCode() {
        int result = upperBand.hashCode();
        result = 31 * result + middleBand.hashCode();
        result = 31 * result + lowerBand.hashCode();
        result = 31 * result + standardDeviation.hashCode();
        result = 31 * result + timestamp.hashCode();
        return result;
    }
}
