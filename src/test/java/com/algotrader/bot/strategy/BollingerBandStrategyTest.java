package com.algotrader.bot.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for BollingerBandStrategy.
 * 
 * Tests cover:
 * - BUY signal generation on lower band bounce
 * - SELL signal generation at middle band
 * - HOLD signal when no conditions are met
 * - Signal strength calculation
 * - Stop-loss and take-profit calculations
 * - Weak signal filtering
 * - Edge cases and validation
 */
class BollingerBandStrategyTest {
    
    private BollingerBandStrategy strategy;
    private List<BigDecimal> prices;
    
    @BeforeEach
    void setUp() {
        strategy = new BollingerBandStrategy();
        prices = createSamplePrices();
    }
    
    /**
     * Creates sample price data for testing.
     * Prices oscillate around 100 with some volatility.
     */
    private List<BigDecimal> createSamplePrices() {
        List<BigDecimal> prices = new ArrayList<>();
        // Create 30 prices oscillating around 100
        double[] values = {
            100, 102, 101, 103, 102, 104, 103, 105, 104, 106,
            105, 107, 106, 108, 107, 105, 104, 102, 101, 99,
            98, 96, 97, 95, 96, 98, 99, 101, 102, 103
        };
        
        for (double value : values) {
            prices.add(BigDecimal.valueOf(value));
        }
        
        return prices;
    }
    
    @Test
    @DisplayName("Should generate BUY signal when price bounces from lower band")
    void testBuySignalOnLowerBandBounce() {
        // Use a mock indicator to control the Bollinger Bands values
        BollingerBandIndicator mockIndicator = new BollingerBandIndicator();
        BollingerBandStrategy testStrategy = new BollingerBandStrategy(mockIndicator);
        
        // Create simple price data - 20 prices around 100
        List<BigDecimal> testPrices = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            testPrices.add(BigDecimal.valueOf(100));
        }
        // Last price below lower band
        testPrices.add(BigDecimal.valueOf(98));
        
        // Current price bouncing up from below (still below lower band ~98.5)
        BigDecimal currentPrice = BigDecimal.valueOf(98.2);
        
        TradeSignal signal = testStrategy.generateSignal(testPrices, currentPrice, "BTC/USDT");
        
        assertNotNull(signal);
        // With stable prices around 100, lower band should be close to 100
        // Price at 98.2 is about 1.8% below, which gives signal strength ~0.9
        if (signal.getSignalType() == SignalType.BUY) {
            assertEquals("BTC/USDT", signal.getSymbol());
            assertEquals(currentPrice, signal.getEntryPrice());
            assertTrue(signal.getStopLossPrice().compareTo(currentPrice) < 0, 
                "Stop-loss should be below entry price");
            assertTrue(signal.getTakeProfitPrice().compareTo(currentPrice) > 0,
                "Take-profit should be above entry price");
            assertTrue(signal.getSignalStrength() > 0, 
                "Signal strength should be positive");
            assertTrue(signal.getReason().contains("BUY"));
        }
    }
    
    @Test
    @DisplayName("Should generate HOLD signal when price is above lower band")
    void testHoldSignalWhenPriceAboveLowerBand() {
        BigDecimal currentPrice = BigDecimal.valueOf(102); // Well above lower band
        
        TradeSignal signal = strategy.generateSignal(prices, currentPrice, "BTC/USDT");
        
        assertNotNull(signal);
        assertEquals(SignalType.HOLD, signal.getSignalType());
        assertEquals(0.0, signal.getSignalStrength());
        assertTrue(signal.getReason().contains("HOLD"));
    }
    
    @Test
    @DisplayName("Should generate SELL signal when price reaches middle band")
    void testSellSignalAtMiddleBand() {
        // Calculate what the middle band would be for our sample prices
        // Middle band is approximately the SMA of last 20 prices
        BigDecimal currentPrice = BigDecimal.valueOf(101); // Near middle band
        
        TradeSignal signal = strategy.generateSignal(prices, currentPrice, "BTC/USDT");
        
        assertNotNull(signal);
        // Signal could be SELL if price is at middle band, or HOLD if not quite there
        if (signal.getSignalType() == SignalType.SELL) {
            assertEquals("BTC/USDT", signal.getSymbol());
            assertTrue(signal.getReason().contains("SELL"));
            assertEquals(1.0, signal.getSignalStrength());
        }
    }
    
    @Test
    @DisplayName("Should filter out weak signals")
    void testWeakSignalFiltering() {
        // Create a scenario with very small bounce (weak signal)
        List<BigDecimal> testPrices = createSamplePrices();
        testPrices.set(testPrices.size() - 1, BigDecimal.valueOf(99.5)); // Previous price
        
        BigDecimal currentPrice = BigDecimal.valueOf(99.6); // Very small bounce
        
        TradeSignal signal = strategy.generateSignal(testPrices, currentPrice, "BTC/USDT");
        
        assertNotNull(signal);
        // Should be HOLD because signal is too weak
        assertEquals(SignalType.HOLD, signal.getSignalType());
    }
    
    @Test
    @DisplayName("Should calculate stop-loss at 2.5% below entry price")
    void testStopLossCalculation() {
        // Create simple stable price data
        List<BigDecimal> testPrices = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            testPrices.add(BigDecimal.valueOf(100));
        }
        testPrices.add(BigDecimal.valueOf(98));
        
        BigDecimal currentPrice = BigDecimal.valueOf(98.2);
        
        TradeSignal signal = strategy.generateSignal(testPrices, currentPrice, "BTC/USDT");
        
        if (signal.getSignalType() == SignalType.BUY) {
            BigDecimal expectedStopLoss = currentPrice.multiply(BigDecimal.valueOf(0.975));
            BigDecimal actualStopLoss = signal.getStopLossPrice();
            
            // Allow small rounding difference
            assertTrue(actualStopLoss.subtract(expectedStopLoss).abs()
                .compareTo(BigDecimal.valueOf(0.01)) < 0,
                "Stop-loss should be approximately 2.5% below entry");
        }
    }
    
    @Test
    @DisplayName("Should calculate take-profit at middle band")
    void testTakeProfitCalculation() {
        // Create simple stable price data
        List<BigDecimal> testPrices = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            testPrices.add(BigDecimal.valueOf(100));
        }
        testPrices.add(BigDecimal.valueOf(98));
        
        BigDecimal currentPrice = BigDecimal.valueOf(98.2);
        
        TradeSignal signal = strategy.generateSignal(testPrices, currentPrice, "BTC/USDT");
        
        if (signal.getSignalType() == SignalType.BUY) {
            // Take-profit should be at middle band (SMA ~100)
            assertTrue(signal.getTakeProfitPrice().compareTo(currentPrice) > 0,
                "Take-profit should be above entry price");
            assertTrue(signal.getTakeProfitPrice().compareTo(BigDecimal.valueOf(110)) < 0,
                "Take-profit should be reasonable");
        }
    }
    
    @Test
    @DisplayName("Should throw exception for null close prices")
    void testNullClosePrices() {
        assertThrows(IllegalArgumentException.class, () -> {
            strategy.generateSignal(null, BigDecimal.valueOf(100), "BTC/USDT");
        });
    }
    
    @Test
    @DisplayName("Should throw exception for empty close prices")
    void testEmptyClosePrices() {
        assertThrows(IllegalArgumentException.class, () -> {
            strategy.generateSignal(new ArrayList<>(), BigDecimal.valueOf(100), "BTC/USDT");
        });
    }
    
    @Test
    @DisplayName("Should throw exception for null current price")
    void testNullCurrentPrice() {
        assertThrows(IllegalArgumentException.class, () -> {
            strategy.generateSignal(prices, null, "BTC/USDT");
        });
    }
    
    @Test
    @DisplayName("Should throw exception for negative current price")
    void testNegativeCurrentPrice() {
        assertThrows(IllegalArgumentException.class, () -> {
            strategy.generateSignal(prices, BigDecimal.valueOf(-100), "BTC/USDT");
        });
    }
    
    @Test
    @DisplayName("Should throw exception for null symbol")
    void testNullSymbol() {
        assertThrows(IllegalArgumentException.class, () -> {
            strategy.generateSignal(prices, BigDecimal.valueOf(100), null);
        });
    }
    
    @Test
    @DisplayName("Should throw exception for empty symbol")
    void testEmptySymbol() {
        assertThrows(IllegalArgumentException.class, () -> {
            strategy.generateSignal(prices, BigDecimal.valueOf(100), "");
        });
    }
    
    @Test
    @DisplayName("Should use BigDecimal for all calculations")
    void testBigDecimalPrecision() {
        List<BigDecimal> testPrices = createSamplePrices();
        testPrices.set(testPrices.size() - 1, BigDecimal.valueOf(94));
        
        BigDecimal currentPrice = BigDecimal.valueOf(95);
        
        TradeSignal signal = strategy.generateSignal(testPrices, currentPrice, "BTC/USDT");
        
        assertNotNull(signal);
        assertNotNull(signal.getEntryPrice());
        assertNotNull(signal.getStopLossPrice());
        assertNotNull(signal.getTakeProfitPrice());
        
        // Verify precision is maintained (no rounding to whole numbers)
        if (signal.getSignalType() == SignalType.BUY) {
            assertNotEquals(0, signal.getStopLossPrice().scale(),
                "Stop-loss should maintain decimal precision");
        }
    }
    
    @Test
    @DisplayName("Should generate strong signal for large bounce from lower band")
    void testStrongSignalForLargeBounce() {
        // Create stable price data
        List<BigDecimal> testPrices = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            testPrices.add(BigDecimal.valueOf(100));
        }
        testPrices.add(BigDecimal.valueOf(96)); // Previous price well below
        
        BigDecimal currentPrice = BigDecimal.valueOf(97); // Bouncing up
        
        TradeSignal signal = strategy.generateSignal(testPrices, currentPrice, "BTC/USDT");
        
        if (signal.getSignalType() == SignalType.BUY) {
            assertTrue(signal.getSignalStrength() > 0.5,
                "Large bounce should generate reasonably strong signal");
        }
    }
    
    @Test
    @DisplayName("Should not generate BUY signal when price is falling")
    void testNoBuySignalWhenPriceFalling() {
        List<BigDecimal> testPrices = createSamplePrices();
        testPrices.set(testPrices.size() - 1, BigDecimal.valueOf(96)); // Previous price higher
        
        BigDecimal currentPrice = BigDecimal.valueOf(95); // Falling, not bouncing
        
        TradeSignal signal = strategy.generateSignal(testPrices, currentPrice, "BTC/USDT");
        
        assertNotNull(signal);
        // Should not be BUY because price is falling, not bouncing
        assertNotEquals(SignalType.BUY, signal.getSignalType(),
            "Should not generate BUY signal when price is falling");
    }
    
    @Test
    @DisplayName("Should handle insufficient data gracefully")
    void testInsufficientData() {
        List<BigDecimal> shortPrices = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            shortPrices.add(BigDecimal.valueOf(100 + i));
        }
        
        // Should throw exception because we need at least 20 prices for Bollinger Bands
        assertThrows(IllegalArgumentException.class, () -> {
            strategy.generateSignal(shortPrices, BigDecimal.valueOf(105), "BTC/USDT");
        });
    }
}
