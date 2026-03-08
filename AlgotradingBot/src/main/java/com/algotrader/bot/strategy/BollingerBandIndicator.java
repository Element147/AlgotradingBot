package com.algotrader.bot.strategy;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

/**
 * Calculates Bollinger Bands for technical analysis.
 * 
 * Bollinger Bands consist of:
 * - Middle band: Simple Moving Average (SMA) over a period
 * - Upper band: SMA + (standard deviation × multiplier)
 * - Lower band: SMA - (standard deviation × multiplier)
 * 
 * Default configuration: 20-period SMA with 2.0 standard deviation multiplier.
 * 
 * All calculations use BigDecimal for precision in financial calculations.
 */
public class BollingerBandIndicator {
    
    private static final int DEFAULT_PERIOD = 20;
    private static final double DEFAULT_STD_DEV_MULTIPLIER = 2.0;
    private static final MathContext MATH_CONTEXT = new MathContext(34, RoundingMode.HALF_UP);
    
    /**
     * Calculates Bollinger Bands using default parameters (20-period, 2.0 std dev).
     * 
     * @param closePrices list of closing prices (most recent last)
     * @return BollingerBands object containing upper, middle, lower bands and std dev
     * @throws IllegalArgumentException if closePrices is null, empty, or has insufficient data
     */
    public BollingerBands calculate(List<BigDecimal> closePrices) {
        return calculate(closePrices, DEFAULT_PERIOD, DEFAULT_STD_DEV_MULTIPLIER);
    }
    
    /**
     * Calculates Bollinger Bands with custom parameters.
     * 
     * @param closePrices list of closing prices (most recent last)
     * @param period the number of periods for SMA calculation
     * @param stdDevMultiplier the multiplier for standard deviation (typically 2.0)
     * @return BollingerBands object containing upper, middle, lower bands and std dev
     * @throws IllegalArgumentException if parameters are invalid
     */
    public BollingerBands calculate(List<BigDecimal> closePrices, int period, double stdDevMultiplier) {
        validateInputs(closePrices, period, stdDevMultiplier);
        
        // Calculate Simple Moving Average (middle band)
        BigDecimal sma = calculateSMA(closePrices, period);
        
        // Calculate standard deviation
        BigDecimal stdDev = calculateStandardDeviation(closePrices, period, sma);
        
        // Calculate upper and lower bands
        BigDecimal multiplier = BigDecimal.valueOf(stdDevMultiplier);
        BigDecimal upperBand = sma.add(stdDev.multiply(multiplier, MATH_CONTEXT), MATH_CONTEXT);
        BigDecimal lowerBand = sma.subtract(stdDev.multiply(multiplier, MATH_CONTEXT), MATH_CONTEXT);
        
        return new BollingerBands(upperBand, sma, lowerBand, stdDev, Instant.now());
    }
    
    /**
     * Validates input parameters for Bollinger Bands calculation.
     */
    private void validateInputs(List<BigDecimal> closePrices, int period, double stdDevMultiplier) {
        if (closePrices == null) {
            throw new IllegalArgumentException("Close prices cannot be null");
        }
        
        if (closePrices.isEmpty()) {
            throw new IllegalArgumentException("Close prices cannot be empty");
        }
        
        if (closePrices.size() < period) {
            throw new IllegalArgumentException(
                String.format("Insufficient data: need at least %d prices, got %d", 
                    period, closePrices.size())
            );
        }
        
        if (period < 2) {
            throw new IllegalArgumentException("Period must be at least 2");
        }
        
        if (stdDevMultiplier <= 0) {
            throw new IllegalArgumentException("Standard deviation multiplier must be positive");
        }
        
        // Check for null values in the price list
        for (int i = 0; i < closePrices.size(); i++) {
            if (closePrices.get(i) == null) {
                throw new IllegalArgumentException("Close prices cannot contain null values at index " + i);
            }
        }
    }
    
    /**
     * Calculates Simple Moving Average (SMA) over the specified period.
     * Uses the most recent 'period' prices from the list.
     * 
     * Formula: SMA = sum(prices) / period
     */
    private BigDecimal calculateSMA(List<BigDecimal> closePrices, int period) {
        BigDecimal sum = BigDecimal.ZERO;
        int startIndex = closePrices.size() - period;
        
        for (int i = startIndex; i < closePrices.size(); i++) {
            sum = sum.add(closePrices.get(i), MATH_CONTEXT);
        }
        
        return sum.divide(BigDecimal.valueOf(period), MATH_CONTEXT);
    }
    
    /**
     * Calculates standard deviation over the specified period.
     * Uses the most recent 'period' prices from the list.
     * 
     * Formula:
     * variance = sum((price - SMA)²) / period
     * stdDev = sqrt(variance)
     */
    private BigDecimal calculateStandardDeviation(List<BigDecimal> closePrices, int period, BigDecimal sma) {
        BigDecimal sumSquaredDifferences = BigDecimal.ZERO;
        int startIndex = closePrices.size() - period;
        
        for (int i = startIndex; i < closePrices.size(); i++) {
            BigDecimal difference = closePrices.get(i).subtract(sma, MATH_CONTEXT);
            BigDecimal squaredDifference = difference.multiply(difference, MATH_CONTEXT);
            sumSquaredDifferences = sumSquaredDifferences.add(squaredDifference, MATH_CONTEXT);
        }
        
        BigDecimal variance = sumSquaredDifferences.divide(BigDecimal.valueOf(period), MATH_CONTEXT);
        
        // Calculate square root using Newton's method for BigDecimal
        return sqrt(variance, MATH_CONTEXT);
    }
    
    /**
     * Calculates square root of a BigDecimal using Newton's method.
     * This provides precise square root calculation for financial data.
     */
    private BigDecimal sqrt(BigDecimal value, MathContext mc) {
        if (value.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new ArithmeticException("Cannot calculate square root of negative number");
        }
        
        // Initial guess: value / 2
        BigDecimal x = value.divide(BigDecimal.valueOf(2), mc);
        BigDecimal lastX;
        
        // Newton's method: x_new = (x + value/x) / 2
        // Iterate until convergence
        int iterations = 0;
        int maxIterations = 50;
        
        do {
            lastX = x;
            x = value.divide(x, mc).add(x).divide(BigDecimal.valueOf(2), mc);
            iterations++;
        } while (x.subtract(lastX).abs().compareTo(BigDecimal.valueOf(1e-10)) > 0 
                 && iterations < maxIterations);
        
        return x;
    }
}
