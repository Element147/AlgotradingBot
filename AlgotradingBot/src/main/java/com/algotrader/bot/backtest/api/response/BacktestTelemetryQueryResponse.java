package com.algotrader.bot.backtest.api;

import java.util.List;

public record BacktestTelemetryQueryResponse(
    String requestedSymbol,
    String resolvedSymbol,
    List<String> availableSymbols,
    BacktestSymbolTelemetryResponse telemetry
) {}
