package com.algotrader.bot.backtest.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BacktestEquityPointResponse(
    LocalDateTime timestamp,
    BigDecimal equity,
    BigDecimal drawdownPct
) {
}
