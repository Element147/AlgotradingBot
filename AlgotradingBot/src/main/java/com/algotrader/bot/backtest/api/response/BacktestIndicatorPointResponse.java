package com.algotrader.bot.backtest.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BacktestIndicatorPointResponse(
    LocalDateTime timestamp,
    BigDecimal value
) {}
