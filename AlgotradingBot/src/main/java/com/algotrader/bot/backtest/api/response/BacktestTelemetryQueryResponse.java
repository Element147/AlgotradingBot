package com.algotrader.bot.backtest.api.response;

import java.util.List;

public record BacktestTelemetryQueryResponse(
    String requestedSymbol,
    String resolvedSymbol,
    List<String> availableSymbols,
    BacktestSymbolTelemetryResponse telemetry
) {}
