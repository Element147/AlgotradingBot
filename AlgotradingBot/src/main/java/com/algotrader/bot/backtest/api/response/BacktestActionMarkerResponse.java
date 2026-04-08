package com.algotrader.bot.backtest.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BacktestActionMarkerResponse(
    LocalDateTime timestamp,
    String action,
    BigDecimal price,
    String label
) {}
