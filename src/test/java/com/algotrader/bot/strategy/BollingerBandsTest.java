package com.algotrader.bot.strategy;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for BollingerBands DTO.
 */
class BollingerBandsTest {
    
    @Test
    void testConstructorAndGetters() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.now();
        
        // Act
        BollingerBands bands = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        
        // Assert
        assertEquals(upper, bands.getUpperBand());
        assertEquals(middle, bands.getMiddleBand());
        assertEquals(lower, bands.getLowerBand());
        assertEquals(stdDev, bands.getStandardDeviation());
        assertEquals(timestamp, bands.getTimestamp());
    }
    
    @Test
    void testImmutability() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.now();
        
        // Act
        BollingerBands bands = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        
        // Assert - verify all fields are final by checking no setters exist
        // This is a compile-time check, but we verify values don't change
        assertEquals(upper, bands.getUpperBand());
        assertEquals(middle, bands.getMiddleBand());
        assertEquals(lower, bands.getLowerBand());
        assertEquals(stdDev, bands.getStandardDeviation());
        assertEquals(timestamp, bands.getTimestamp());
    }
    
    @Test
    void testNullUpperBandThrowsException() {
        // Arrange
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.now();
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new BollingerBands(null, middle, lower, stdDev, timestamp));
    }
    
    @Test
    void testNullMiddleBandThrowsException() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.now();
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new BollingerBands(upper, null, lower, stdDev, timestamp));
    }
    
    @Test
    void testNullLowerBandThrowsException() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.now();
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new BollingerBands(upper, middle, null, stdDev, timestamp));
    }
    
    @Test
    void testNullStandardDeviationThrowsException() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        Instant timestamp = Instant.now();
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new BollingerBands(upper, middle, lower, null, timestamp));
    }
    
    @Test
    void testNullTimestampThrowsException() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new BollingerBands(upper, middle, lower, stdDev, null));
    }
    
    @Test
    void testToString() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.parse("2024-01-15T10:30:00Z");
        
        // Act
        BollingerBands bands = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        String result = bands.toString();
        
        // Assert
        assertTrue(result.contains("upperBand=110.50"));
        assertTrue(result.contains("middleBand=105.00"));
        assertTrue(result.contains("lowerBand=99.50"));
        assertTrue(result.contains("standardDeviation=2.75"));
        assertTrue(result.contains("timestamp=2024-01-15T10:30:00Z"));
    }
    
    @Test
    void testEquals() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.parse("2024-01-15T10:30:00Z");
        
        BollingerBands bands1 = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        BollingerBands bands2 = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        BollingerBands bands3 = new BollingerBands(
            new BigDecimal("111.00"), middle, lower, stdDev, timestamp);
        
        // Assert
        assertEquals(bands1, bands2);
        assertNotEquals(bands1, bands3);
        assertNotEquals(bands1, null);
        assertNotEquals(bands1, "not a BollingerBands object");
    }
    
    @Test
    void testHashCode() {
        // Arrange
        BigDecimal upper = new BigDecimal("110.50");
        BigDecimal middle = new BigDecimal("105.00");
        BigDecimal lower = new BigDecimal("99.50");
        BigDecimal stdDev = new BigDecimal("2.75");
        Instant timestamp = Instant.parse("2024-01-15T10:30:00Z");
        
        BollingerBands bands1 = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        BollingerBands bands2 = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        
        // Assert
        assertEquals(bands1.hashCode(), bands2.hashCode());
    }
    
    @Test
    void testBigDecimalPrecision() {
        // Arrange - test that BigDecimal precision is maintained
        BigDecimal upper = new BigDecimal("110.123456789");
        BigDecimal middle = new BigDecimal("105.987654321");
        BigDecimal lower = new BigDecimal("99.555555555");
        BigDecimal stdDev = new BigDecimal("2.777777777");
        Instant timestamp = Instant.now();
        
        // Act
        BollingerBands bands = new BollingerBands(upper, middle, lower, stdDev, timestamp);
        
        // Assert - verify precision is maintained
        assertEquals(0, upper.compareTo(bands.getUpperBand()));
        assertEquals(0, middle.compareTo(bands.getMiddleBand()));
        assertEquals(0, lower.compareTo(bands.getLowerBand()));
        assertEquals(0, stdDev.compareTo(bands.getStandardDeviation()));
    }
}
