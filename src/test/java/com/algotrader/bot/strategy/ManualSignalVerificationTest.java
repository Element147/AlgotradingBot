package com.algotrader.bot.strategy;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Manual verification test for Bollinger Band signal generation.
 * 
 * This test demonstrates the strategy with sample price data and prints
 * detailed information about Bollinger Bands calculations and generated signals.
 * 
 * Run with: ./gradlew test --tests ManualSignalVerificationTest
 */
class ManualSignalVerificationTest {
    
    @Test
    void manualVerification() {
        System.out.println("\n=== Bollinger Band Strategy - Manual Signal Verification ===\n");
        
        BollingerBandStrategy strategy = new BollingerBandStrategy();
        
        // Scenario 1: Lower band bounce (should generate BUY signal)
        System.out.println("--- Scenario 1: Lower Band Bounce (BUY Signal Expected) ---");
        testLowerBandBounce(strategy);
        
        // Scenario 2: Middle band reached (should generate SELL signal)
        System.out.println("\n--- Scenario 2: Middle Band Reached (SELL Signal Expected) ---");
        testMiddleBandReached(strategy);
        
        // Scenario 3: No signal (price in middle range)
        System.out.println("\n--- Scenario 3: Price in Middle Range (HOLD Expected) ---");
        testNoSignal(strategy);
        
        // Scenario 4: Weak signal filtered out
        System.out.println("\n--- Scenario 4: Weak Signal (HOLD Expected - Filtered) ---");
        testWeakSignal(strategy);
        
        System.out.println("\n=== Manual Verification Complete ===");
        System.out.println("Review the output above to verify:");
        System.out.println("1. Bollinger Bands calculations are correct");
        System.out.println("2. BUY signals generated on lower band bounces");
        System.out.println("3. SELL signals generated at middle band");
        System.out.println("4. Stop-loss is ~2.5% below entry price");
        System.out.println("5. Take-profit is at middle band for BUY signals");
        System.out.println("6. Weak signals are filtered out (strength < 0.5)\n");
    }
    
    /**
     * Test Scenario 1: Price bounces from lower band (BUY signal expected)
     */
    private void testLowerBandBounce(BollingerBandStrategy strategy) {
        // Create price data with downtrend - last price well below lower band
        List<BigDecimal> prices = createPriceData(
            100.0, 102.0, 101.0, 103.0, 102.0, 104.0, 103.0, 105.0, 104.0, 106.0,
            105.0, 104.0, 103.0, 102.0, 101.0, 100.0, 99.0, 98.0, 97.0, 94.0
        );
        
        // Current price bouncing up from 94, but still below lower band
        BigDecimal currentPrice = new BigDecimal("94.5"); 
        String symbol = "BTC/USDT";
        
        // Calculate Bollinger Bands for reference
        BollingerBandIndicator indicator = new BollingerBandIndicator();
        BollingerBands bands = indicator.calculate(prices);
        
        printBollingerBands(bands);
        printPriceInfo(currentPrice, prices.get(prices.size() - 1));
        
        // Generate signal
        TradeSignal signal = strategy.generateSignal(prices, currentPrice, symbol);
        printSignal(signal);
        
        // Verify stop-loss calculation
        if (signal.getSignalType() == SignalType.BUY) {
            verifyStopLoss(signal.getEntryPrice(), signal.getStopLossPrice());
        }
    }
    
    /**
     * Test Scenario 2: Price reaches middle band (SELL signal expected)
     */
    private void testMiddleBandReached(BollingerBandStrategy strategy) {
        // Create price data with uptrend reaching middle band
        List<BigDecimal> prices = createPriceData(
            100.0, 102.0, 101.0, 103.0, 102.0, 104.0, 103.0, 105.0, 104.0, 106.0,
            105.0, 104.0, 103.0, 102.0, 101.0, 100.0, 99.0, 100.0, 101.0, 102.0
        );
        
        // Calculate middle band
        BollingerBandIndicator indicator = new BollingerBandIndicator();
        BollingerBands bands = indicator.calculate(prices);
        BigDecimal currentPrice = bands.getMiddleBand(); // At middle band
        
        String symbol = "ETH/USDT";
        
        printBollingerBands(bands);
        printPriceInfo(currentPrice, prices.get(prices.size() - 1));
        
        // Generate signal
        TradeSignal signal = strategy.generateSignal(prices, currentPrice, symbol);
        printSignal(signal);
    }
    
    /**
     * Test Scenario 3: Price in middle range (HOLD expected)
     */
    private void testNoSignal(BollingerBandStrategy strategy) {
        // Create stable price data
        List<BigDecimal> prices = createPriceData(
            100.0, 102.0, 101.0, 103.0, 102.0, 104.0, 103.0, 105.0, 104.0, 106.0,
            105.0, 104.0, 103.0, 102.0, 101.0, 100.0, 101.0, 102.0, 101.0, 102.0
        );
        
        BigDecimal currentPrice = new BigDecimal("103.0"); // In middle range
        String symbol = "BTC/USDT";
        
        BollingerBandIndicator indicator = new BollingerBandIndicator();
        BollingerBands bands = indicator.calculate(prices);
        
        printBollingerBands(bands);
        printPriceInfo(currentPrice, prices.get(prices.size() - 1));
        
        // Generate signal
        TradeSignal signal = strategy.generateSignal(prices, currentPrice, symbol);
        printSignal(signal);
    }
    
    /**
     * Test Scenario 4: Weak signal that should be filtered out
     */
    private void testWeakSignal(BollingerBandStrategy strategy) {
        // Create price data with small bounce (weak signal)
        List<BigDecimal> prices = createPriceData(
            100.0, 102.0, 101.0, 103.0, 102.0, 104.0, 103.0, 105.0, 104.0, 106.0,
            105.0, 104.0, 103.0, 102.0, 101.0, 100.0, 99.0, 98.5, 98.0, 97.8
        );
        
        BigDecimal currentPrice = new BigDecimal("97.9"); // Very small bounce
        String symbol = "BTC/USDT";
        
        BollingerBandIndicator indicator = new BollingerBandIndicator();
        BollingerBands bands = indicator.calculate(prices);
        
        printBollingerBands(bands);
        printPriceInfo(currentPrice, prices.get(prices.size() - 1));
        
        // Generate signal
        TradeSignal signal = strategy.generateSignal(prices, currentPrice, symbol);
        printSignal(signal);
    }
    
    /**
     * Helper: Create price data from doubles
     */
    private List<BigDecimal> createPriceData(double... prices) {
        List<BigDecimal> priceList = new ArrayList<>();
        for (double price : prices) {
            priceList.add(new BigDecimal(String.valueOf(price)));
        }
        return priceList;
    }
    
    /**
     * Helper: Print Bollinger Bands information
     */
    private void printBollingerBands(BollingerBands bands) {
        System.out.println("Bollinger Bands:");
        System.out.printf("  Upper Band:  $%.2f%n", bands.getUpperBand());
        System.out.printf("  Middle Band: $%.2f (SMA)%n", bands.getMiddleBand());
        System.out.printf("  Lower Band:  $%.2f%n", bands.getLowerBand());
        System.out.printf("  Std Dev:     $%.2f%n", bands.getStandardDeviation());
    }
    
    /**
     * Helper: Print current price information
     */
    private void printPriceInfo(BigDecimal currentPrice, BigDecimal previousPrice) {
        System.out.println("\nPrice Information:");
        System.out.printf("  Previous Price: $%.2f%n", previousPrice);
        System.out.printf("  Current Price:  $%.2f%n", currentPrice);
        
        BigDecimal change = currentPrice.subtract(previousPrice);
        System.out.printf("  Change:         $%.2f (%s)%n", 
            change.abs(), 
            change.compareTo(BigDecimal.ZERO) >= 0 ? "UP" : "DOWN");
    }
    
    /**
     * Helper: Print trade signal information
     */
    private void printSignal(TradeSignal signal) {
        System.out.println("\nGenerated Signal:");
        System.out.printf("  Type:          %s%n", signal.getSignalType());
        System.out.printf("  Symbol:        %s%n", signal.getSymbol());
        System.out.printf("  Entry Price:   $%.2f%n", signal.getEntryPrice());
        System.out.printf("  Stop Loss:     $%.2f%n", signal.getStopLossPrice());
        System.out.printf("  Take Profit:   $%.2f%n", signal.getTakeProfitPrice());
        System.out.printf("  Strength:      %.2f%n", signal.getSignalStrength());
        System.out.printf("  Reason:        %s%n", signal.getReason());
    }
    
    /**
     * Helper: Verify stop-loss is approximately 2.5% below entry
     */
    private void verifyStopLoss(BigDecimal entryPrice, BigDecimal stopLoss) {
        BigDecimal expectedStopLoss = entryPrice.multiply(new BigDecimal("0.975"));
        BigDecimal difference = expectedStopLoss.subtract(stopLoss).abs();
        BigDecimal tolerance = new BigDecimal("0.01");
        
        System.out.println("\nStop-Loss Verification:");
        System.out.printf("  Expected (2.5%% below): $%.2f%n", expectedStopLoss);
        System.out.printf("  Actual:                 $%.2f%n", stopLoss);
        System.out.printf("  Difference:             $%.2f%n", difference);
        System.out.printf("  Status:                 %s%n", 
            difference.compareTo(tolerance) < 0 ? "✓ PASS" : "✗ FAIL");
    }
}
