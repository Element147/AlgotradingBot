package com.algotrader.bot.backtest.api.response;

import java.util.List;

public record BacktestSymbolTelemetryResponse(
    String symbol,
    List<BacktestTelemetryPointResponse> points,
    List<BacktestActionMarkerResponse> actions,
    List<BacktestIndicatorSeriesResponse> indicators,
    List<BacktestTelemetryProvenanceResponse> provenance
) {}
