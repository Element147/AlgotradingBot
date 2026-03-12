package com.algotrader.bot.strategy;

/**
 * Enumeration of trading signal types.
 * 
 * Used by trading strategies to indicate the recommended action:
 * - BUY: Enter a long position
 * - SELL: Exit a long position
 * - SHORT: Enter a short position
 * - COVER: Exit a short position
 * - HOLD: No action recommended, maintain current position
 */
public enum SignalType {
    /**
     * Signal to enter a long position (buy the asset).
     */
    BUY,
    
    /**
     * Signal to exit a long position.
     */
    SELL,

    /**
     * Signal to enter a short position.
     */
    SHORT,

    /**
     * Signal to exit a short position.
     */
    COVER,
    
    /**
     * Signal to maintain current position (no action).
     */
    HOLD
}
