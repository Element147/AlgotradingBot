package com.algotrader.bot.strategy;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TradeSignal DTO.
 */
class TradeSignalTest {
    
    @Test
    void testValidTradeSignalCreation() {
        // Arrange
        SignalType signalType = SignalType.BUY;
        String symbol = "BTC/USDT";
        BigDecimal entryPrice = new BigDecimal("50000.00");
        BigDecimal stopLossPrice = new BigDecimal("49000.00");
        BigDecimal takeProfitPrice = new BigDecimal("51000.00");
        double signalStrength = 0.85;
        Instant timestamp = Instant.now();
        String reason = "Price bounced off lower Bollinger Band";
        
        // Act
        TradeSignal signal = new TradeSignal(
            signalType, symbol, entryPrice, stopLossPrice, takeProfitPrice,
            signalStrength, timestamp, reason
        );
        
        // Assert
        assertEquals(signalType, signal.getSignalType());
        assertEquals(symbol, signal.getSymbol());
        assertEquals(entryPrice, signal.getEntryPrice());
        assertEquals(stopLossPrice, signal.getStopLossPrice());
        assertEquals(takeProfitPrice, signal.getTakeProfitPrice());
        assertEquals(signalStrength, signal.getSignalStrength());
        assertEquals(timestamp, signal.getTimestamp());
        assertEquals(reason, signal.getReason());
    }
    
    @Test
    void testNullSignalTypeThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                null, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNullSymbolThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, null, new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testEmptySymbolThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "  ", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNullEntryPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", null,
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNullStopLossPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                null, new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNullTakeProfitPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), null,
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNullTimestampThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, null, "Test reason"
            );
        });
    }
    
    @Test
    void testNullReasonThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, Instant.now(), null
            );
        });
    }
    
    @Test
    void testSignalStrengthBelowZeroThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                -0.1, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testSignalStrengthAboveOneThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                1.1, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testSignalStrengthAtZeroIsValid() {
        assertDoesNotThrow(() -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.0, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testSignalStrengthAtOneIsValid() {
        assertDoesNotThrow(() -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                1.0, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testZeroEntryPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", BigDecimal.ZERO,
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNegativeEntryPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("-50000"),
                new BigDecimal("49000"), new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testZeroStopLossPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                BigDecimal.ZERO, new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNegativeStopLossPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("-49000"), new BigDecimal("51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testZeroTakeProfitPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), BigDecimal.ZERO,
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testNegativeTakeProfitPriceThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            new TradeSignal(
                SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
                new BigDecimal("49000"), new BigDecimal("-51000"),
                0.8, Instant.now(), "Test reason"
            );
        });
    }
    
    @Test
    void testToStringContainsAllFields() {
        // Arrange
        TradeSignal signal = new TradeSignal(
            SignalType.SELL, "ETH/USDT", new BigDecimal("3000.00"),
            new BigDecimal("2900.00"), new BigDecimal("3100.00"),
            0.75, Instant.parse("2024-01-01T12:00:00Z"), "Middle band reached"
        );
        
        // Act
        String result = signal.toString();
        
        // Assert
        assertTrue(result.contains("SELL"));
        assertTrue(result.contains("ETH/USDT"));
        assertTrue(result.contains("3000.00"));
        assertTrue(result.contains("2900.00"));
        assertTrue(result.contains("3100.00"));
        assertTrue(result.contains("0.75"));
        assertTrue(result.contains("Middle band reached"));
    }
    
    @Test
    void testEqualsWithSameValues() {
        // Arrange
        Instant timestamp = Instant.now();
        TradeSignal signal1 = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        TradeSignal signal2 = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        
        // Assert
        assertEquals(signal1, signal2);
        assertEquals(signal1.hashCode(), signal2.hashCode());
    }
    
    @Test
    void testEqualsWithDifferentSignalType() {
        // Arrange
        Instant timestamp = Instant.now();
        TradeSignal signal1 = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        TradeSignal signal2 = new TradeSignal(
            SignalType.SELL, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        
        // Assert
        assertNotEquals(signal1, signal2);
    }
    
    @Test
    void testEqualsWithDifferentSymbol() {
        // Arrange
        Instant timestamp = Instant.now();
        TradeSignal signal1 = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        TradeSignal signal2 = new TradeSignal(
            SignalType.BUY, "ETH/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        
        // Assert
        assertNotEquals(signal1, signal2);
    }
    
    @Test
    void testEqualsWithDifferentEntryPrice() {
        // Arrange
        Instant timestamp = Instant.now();
        TradeSignal signal1 = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        TradeSignal signal2 = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50001.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, timestamp, "Test reason"
        );
        
        // Assert
        assertNotEquals(signal1, signal2);
    }
    
    @Test
    void testEqualsWithNull() {
        // Arrange
        TradeSignal signal = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, Instant.now(), "Test reason"
        );
        
        // Assert
        assertNotEquals(signal, null);
    }
    
    @Test
    void testEqualsWithSameInstance() {
        // Arrange
        TradeSignal signal = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000.00"),
            new BigDecimal("49000.00"), new BigDecimal("51000.00"),
            0.85, Instant.now(), "Test reason"
        );
        
        // Assert
        assertEquals(signal, signal);
    }
    
    @Test
    void testAllSignalTypes() {
        // Test that all signal types can be used
        Instant timestamp = Instant.now();
        
        TradeSignal buySignal = new TradeSignal(
            SignalType.BUY, "BTC/USDT", new BigDecimal("50000"),
            new BigDecimal("49000"), new BigDecimal("51000"),
            0.8, timestamp, "Buy signal"
        );
        assertEquals(SignalType.BUY, buySignal.getSignalType());
        
        TradeSignal sellSignal = new TradeSignal(
            SignalType.SELL, "BTC/USDT", new BigDecimal("50000"),
            new BigDecimal("49000"), new BigDecimal("51000"),
            0.8, timestamp, "Sell signal"
        );
        assertEquals(SignalType.SELL, sellSignal.getSignalType());

        TradeSignal shortSignal = new TradeSignal(
            SignalType.SHORT, "BTC/USDT", new BigDecimal("50000"),
            new BigDecimal("51000"), new BigDecimal("49000"),
            0.8, timestamp, "Short signal"
        );
        assertEquals(SignalType.SHORT, shortSignal.getSignalType());

        TradeSignal coverSignal = new TradeSignal(
            SignalType.COVER, "BTC/USDT", new BigDecimal("50000"),
            new BigDecimal("51000"), new BigDecimal("49000"),
            0.8, timestamp, "Cover signal"
        );
        assertEquals(SignalType.COVER, coverSignal.getSignalType());
        
        TradeSignal holdSignal = new TradeSignal(
            SignalType.HOLD, "BTC/USDT", new BigDecimal("50000"),
            new BigDecimal("49000"), new BigDecimal("51000"),
            0.8, timestamp, "Hold signal"
        );
        assertEquals(SignalType.HOLD, holdSignal.getSignalType());
    }
    
    @Test
    void testImmutability() {
        // Arrange
        BigDecimal entryPrice = new BigDecimal("50000.00");
        BigDecimal stopLossPrice = new BigDecimal("49000.00");
        BigDecimal takeProfitPrice = new BigDecimal("51000.00");
        
        TradeSignal signal = new TradeSignal(
            SignalType.BUY, "BTC/USDT", entryPrice,
            stopLossPrice, takeProfitPrice,
            0.85, Instant.now(), "Test reason"
        );
        
        // Act - modify the original BigDecimal objects
        entryPrice = entryPrice.add(BigDecimal.ONE);
        stopLossPrice = stopLossPrice.add(BigDecimal.ONE);
        takeProfitPrice = takeProfitPrice.add(BigDecimal.ONE);
        
        // Assert - signal values should remain unchanged
        assertEquals(new BigDecimal("50000.00"), signal.getEntryPrice());
        assertEquals(new BigDecimal("49000.00"), signal.getStopLossPrice());
        assertEquals(new BigDecimal("51000.00"), signal.getTakeProfitPrice());
    }
}
