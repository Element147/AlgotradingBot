package com.algotrader.bot.backtest.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BacktestEquityPointSample(
    LocalDateTime timestamp,
    BigDecimal equity,
    BigDecimal drawdownPct
) {
}
