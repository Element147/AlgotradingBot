package com.algotrader.bot.backtest;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BacktestTradeSample(
    String symbol,
    LocalDateTime entryTime,
    LocalDateTime exitTime,
    BigDecimal entryPrice,
    BigDecimal exitPrice,
    BigDecimal quantity,
    BigDecimal entryValue,
    BigDecimal exitValue,
    BigDecimal returnPct
) {
}
