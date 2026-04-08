package com.algotrader.bot.backtest.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BacktestEquityPointResponse(
    LocalDateTime timestamp,
    BigDecimal equity,
    BigDecimal drawdownPct
) {
}
