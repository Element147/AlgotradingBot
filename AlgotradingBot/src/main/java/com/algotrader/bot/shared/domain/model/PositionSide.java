package com.algotrader.bot.shared.domain.model;

public enum PositionSide {
    LONG,
    SHORT;

    public boolean isLong() {
        return this == LONG;
    }

    public boolean isShort() {
        return this == SHORT;
    }
}
