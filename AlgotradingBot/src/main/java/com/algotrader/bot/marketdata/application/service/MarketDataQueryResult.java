package com.algotrader.bot.marketdata.application.service;

import java.util.List;

public record MarketDataQueryResult(
    List<MarketDataQueriedCandle> candles,
    List<MarketDataQueryGap> gaps,
    String sourceTimeframe,
    MarketDataQueryMode queryMode
) {
}
