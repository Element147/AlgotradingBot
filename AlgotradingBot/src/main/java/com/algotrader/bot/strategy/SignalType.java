package com.algotrader.bot.strategy;

/**
 * Enumeration of trading signal types.
 * 
 * Used by trading strategies to indicate the recommended action:
 * - BUY: Enter a long position
 * - SELL: Exit a position or enter a short position
 * - HOLD: No action recommended, maintain current position
 */
public enum SignalType {
    /**
     * Signal to enter a long position (buy the asset).
     */
    BUY,
    
    /**
     * Signal to exit a position or enter a short position (sell the asset).
     */
    SELL,
    
    /**
     * Signal to maintain current position (no action).
     */
    HOLD
}
