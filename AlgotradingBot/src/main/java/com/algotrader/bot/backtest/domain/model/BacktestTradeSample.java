package com.algotrader.bot.backtest.domain.model;

import com.algotrader.bot.shared.domain.model.PositionSide;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BacktestTradeSample(
    String symbol,
    PositionSide side,
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
