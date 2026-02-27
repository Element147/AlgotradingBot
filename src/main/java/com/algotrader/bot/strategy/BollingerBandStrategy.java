package com.algotrader.bot.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

/**
 * Bollinger Bands Mean Reversion Trading Strategy.
 * 
 * Strategy Logic:
 * - BUY Signal: Price touches/crosses below lower band and starts bouncing back up
 * - SELL Signal: Price reaches middle band (take profit) or stop-loss triggered
 * - Signal Strength: Based on distance from lower band (2% distance = max strength)
 * - Stop-Loss: 2-3% below entry price
 * - Take-Profit: Middle band (primary target)
 * 
 * Risk Management:
 * - Filters weak signals (signal strength < 0.5)
 * - Always calculates stop-loss and take-profit levels
 * - Uses BigDecimal for all financial calculations
 */
public class BollingerBandStrategy {
    
    private static final Logger logger = LoggerFactory.getLogger(BollingerBandStrategy.class);
    
    private static final MathContext MATH_CONTEXT = new MathContext(34, RoundingMode.HALF_UP);
    private static final double MIN_SIGNAL_STRENGTH = 0.5;
    private static final BigDecimal STOP_LOSS_PERCENTAGE = new BigDecimal("0.025"); // 2.5%
    private static final BigDecimal MAX_SIGNAL_DISTANCE = new BigDecimal("0.02"); // 2% for max strength
    
    private final BollingerBandIndicator indicator;
    
    /**
     * Creates a new BollingerBandStrategy with default indicator.
     */
    public BollingerBandStrategy() {
        this.indicator = new BollingerBandIndicator();
    }
    
    /**
     * Creates a new BollingerBandStrategy with custom indicator.
     * 
     * @param indicator the Bollinger Band indicator to use
     */
    public BollingerBandStrategy(BollingerBandIndicator indicator) {
        if (indicator == null) {
            throw new IllegalArgumentException("Indicator cannot be null");
        }
        this.indicator = indicator;
    }
    
    /**
     * Generates a trading signal based on current price and historical data.
     * 
     * @param closePrices list of historical closing prices (most recent last)
     * @param currentPrice the current market price
     * @param symbol the trading symbol (e.g., "BTC/USDT")
     * @return TradeSignal with BUY, SELL, or HOLD recommendation
     * @throws IllegalArgumentException if parameters are invalid
     */
    public TradeSignal generateSignal(List<BigDecimal> closePrices, BigDecimal currentPrice, String symbol) {
        validateInputs(closePrices, currentPrice, symbol);
        
        // Calculate Bollinger Bands
        BollingerBands bands = indicator.calculate(closePrices);
        
        // Check for BUY signal (lower band bounce)
        TradeSignal buySignal = checkBuySignal(closePrices, currentPrice, symbol, bands);
        if (buySignal != null) {
            return buySignal;
        }
        
        // Check for SELL signal (middle band reached)
        TradeSignal sellSignal = checkSellSignal(currentPrice, symbol, bands);
        if (sellSignal != null) {
            return sellSignal;
        }
        
        // No signal - return HOLD
        return createHoldSignal(currentPrice, symbol);
    }
    
    /**
     * Checks if conditions are met for a BUY signal.
     * 
     * BUY conditions:
     * 1. Price is at or below lower band
     * 2. Price is bouncing back up (current > previous)
     * 3. Signal strength >= minimum threshold
     */
    private TradeSignal checkBuySignal(List<BigDecimal> closePrices, BigDecimal currentPrice, 
                                       String symbol, BollingerBands bands) {
        BigDecimal lowerBand = bands.getLowerBand();
        BigDecimal previousPrice = closePrices.get(closePrices.size() - 1);
        
        // Check if price is at or below lower band
        boolean atOrBelowLowerBand = currentPrice.compareTo(lowerBand) <= 0;
        
        // Check if price is bouncing back up
        boolean bouncingUp = currentPrice.compareTo(previousPrice) > 0;
        
        if (atOrBelowLowerBand && bouncingUp) {
            // Calculate signal strength based on distance from lower band
            double signalStrength = calculateSignalStrength(currentPrice, lowerBand);
            
            // Filter weak signals
            if (signalStrength >= MIN_SIGNAL_STRENGTH) {
                BigDecimal entryPrice = currentPrice;
                BigDecimal stopLoss = calculateStopLoss(entryPrice);
                BigDecimal takeProfit = bands.getMiddleBand();
                
                String reason = String.format(
                    "BUY: Price %.2f bounced from lower band %.2f (strength: %.2f)",
                    currentPrice.doubleValue(), lowerBand.doubleValue(), signalStrength
                );
                
                logger.info("Generated BUY signal for {}: {}", symbol, reason);
                
                return new TradeSignal(
                    SignalType.BUY,
                    symbol,
                    entryPrice,
                    stopLoss,
                    takeProfit,
                    signalStrength,
                    Instant.now(),
                    reason
                );
            } else {
                logger.debug("Weak BUY signal filtered out for {} (strength: {})", symbol, signalStrength);
            }
        }
        
        return null;
    }
    
    /**
     * Checks if conditions are met for a SELL signal.
     * 
     * SELL conditions:
     * - Price has reached middle band (take profit target)
     */
    private TradeSignal checkSellSignal(BigDecimal currentPrice, String symbol, BollingerBands bands) {
        BigDecimal middleBand = bands.getMiddleBand();
        
        // Check if price has reached middle band (within 0.5% tolerance)
        BigDecimal tolerance = middleBand.multiply(new BigDecimal("0.005"), MATH_CONTEXT);
        BigDecimal upperThreshold = middleBand.add(tolerance, MATH_CONTEXT);
        BigDecimal lowerThreshold = middleBand.subtract(tolerance, MATH_CONTEXT);
        
        boolean atMiddleBand = currentPrice.compareTo(lowerThreshold) >= 0 
                            && currentPrice.compareTo(upperThreshold) <= 0;
        
        if (atMiddleBand) {
            // Calculate stop-loss and take-profit for the SELL signal
            // For a SELL signal (closing position), we use current price as entry
            BigDecimal entryPrice = currentPrice;
            BigDecimal stopLoss = calculateStopLoss(entryPrice);
            BigDecimal takeProfit = currentPrice; // Already at target
            
            String reason = String.format(
                "SELL: Price %.2f reached middle band %.2f (take profit)",
                currentPrice.doubleValue(), middleBand.doubleValue()
            );
            
            logger.info("Generated SELL signal for {}: {}", symbol, reason);
            
            return new TradeSignal(
                SignalType.SELL,
                symbol,
                entryPrice,
                stopLoss,
                takeProfit,
                1.0, // Max strength when target is reached
                Instant.now(),
                reason
            );
        }
        
        return null;
    }
    
    /**
     * Creates a HOLD signal when no trading action is recommended.
     */
    private TradeSignal createHoldSignal(BigDecimal currentPrice, String symbol) {
        return new TradeSignal(
            SignalType.HOLD,
            symbol,
            currentPrice,
            currentPrice, // No stop-loss for HOLD
            currentPrice, // No take-profit for HOLD
            0.0,
            Instant.now(),
            "HOLD: No trading signal detected"
        );
    }
    
    /**
     * Calculates signal strength based on distance from lower band.
     * 
     * Formula: signalStrength = min(1.0, distance / 0.02)
     * Where distance = (lowerBand - currentPrice) / lowerBand
     * 
     * A 2% distance from lower band = maximum strength (1.0)
     */
    private double calculateSignalStrength(BigDecimal currentPrice, BigDecimal lowerBand) {
        if (lowerBand.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        
        // Calculate distance as percentage: (lowerBand - currentPrice) / lowerBand
        BigDecimal distance = lowerBand.subtract(currentPrice, MATH_CONTEXT)
                                      .divide(lowerBand, MATH_CONTEXT)
                                      .abs();
        
        // Normalize by max distance (2% = 1.0 strength)
        BigDecimal strength = distance.divide(MAX_SIGNAL_DISTANCE, MATH_CONTEXT);
        
        // Cap at 1.0
        if (strength.compareTo(BigDecimal.ONE) > 0) {
            return 1.0;
        }
        
        return strength.doubleValue();
    }
    
    /**
     * Calculates stop-loss price at 2.5% below entry price.
     * 
     * Formula: stopLoss = entryPrice × (1 - 0.025)
     */
    private BigDecimal calculateStopLoss(BigDecimal entryPrice) {
        BigDecimal multiplier = BigDecimal.ONE.subtract(STOP_LOSS_PERCENTAGE, MATH_CONTEXT);
        return entryPrice.multiply(multiplier, MATH_CONTEXT);
    }
    
    /**
     * Validates input parameters.
     */
    private void validateInputs(List<BigDecimal> closePrices, BigDecimal currentPrice, String symbol) {
        if (closePrices == null || closePrices.isEmpty()) {
            throw new IllegalArgumentException("Close prices cannot be null or empty");
        }
        
        if (currentPrice == null) {
            throw new IllegalArgumentException("Current price cannot be null");
        }
        
        if (currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Current price must be positive");
        }
        
        if (symbol == null || symbol.trim().isEmpty()) {
            throw new IllegalArgumentException("Symbol cannot be null or empty");
        }
    }
}
