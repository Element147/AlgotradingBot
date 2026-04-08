package com.algotrader.bot.marketdata.infrastructure.persistence;

import com.algotrader.bot.marketdata.infrastructure.persistence.MarketDataSeries;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarketDataSeriesRepository extends JpaRepository<MarketDataSeries, Long> {

    Optional<MarketDataSeries> findByProviderIdAndExchangeIdAndSymbolNormalizedAndAssetClass(
        String providerId,
        String exchangeId,
        String symbolNormalized,
        String assetClass
    );

    List<MarketDataSeries> findByAssetClassAndBaseAssetAndQuoteAssetOrderBySymbolNormalizedAsc(
        String assetClass,
        String baseAsset,
        String quoteAsset
    );
}
