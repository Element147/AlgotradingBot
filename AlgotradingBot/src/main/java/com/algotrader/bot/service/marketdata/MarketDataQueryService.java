package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.MarketDataCandle;
import com.algotrader.bot.entity.MarketDataCandleSegment;
import com.algotrader.bot.entity.MarketDataSeries;
import com.algotrader.bot.repository.MarketDataCandleRepository;
import com.algotrader.bot.service.BacktestDatasetCandleCache;
import com.algotrader.bot.service.BacktestDatasetStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class MarketDataQueryService {

    private static final Logger logger = LoggerFactory.getLogger(MarketDataQueryService.class);

    private final MarketDataCandleRepository marketDataCandleRepository;
    private final BacktestDatasetStorageService backtestDatasetStorageService;
    private final BacktestDatasetCandleCache backtestDatasetCandleCache;
    private final MarketDataResampler marketDataResampler;

    public MarketDataQueryService(MarketDataCandleRepository marketDataCandleRepository,
                                  BacktestDatasetStorageService backtestDatasetStorageService,
                                  BacktestDatasetCandleCache backtestDatasetCandleCache,
                                  MarketDataResampler marketDataResampler) {
        this.marketDataCandleRepository = marketDataCandleRepository;
        this.backtestDatasetStorageService = backtestDatasetStorageService;
        this.backtestDatasetCandleCache = backtestDatasetCandleCache;
        this.marketDataResampler = marketDataResampler;
    }

    public List<MarketDataQueriedCandle> loadCandlesForSeries(Long seriesId,
                                                              String timeframe,
                                                              LocalDateTime windowStart,
                                                              LocalDateTime windowEnd) {
        return marketDataCandleRepository.findCandlesInRange(seriesId, timeframe, windowStart, windowEnd).stream()
            .map(this::toQueriedCandle)
            .toList();
    }

    public List<MarketDataQueriedCandle> loadCandlesForDataset(Long datasetId,
                                                               String timeframe,
                                                               LocalDateTime windowStart,
                                                               LocalDateTime windowEnd,
                                                               Set<String> requestedSymbols) {
        Set<String> normalizedSymbols = normalizeRequestedSymbols(requestedSymbols);
        List<MarketDataQueriedCandle> relationalCandles = normalizedSymbols.isEmpty()
            ? marketDataCandleRepository.findDatasetCandlesInRange(datasetId, timeframe, windowStart, windowEnd).stream()
                .map(this::toQueriedCandle)
                .toList()
            : normalizedSymbols.stream()
                .flatMap(symbol -> marketDataCandleRepository
                    .findDatasetCandlesForSymbolInRange(datasetId, timeframe, symbol, windowStart, windowEnd)
                    .stream()
                )
                .map(this::toQueriedCandle)
                .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
                .toList();
        if (!relationalCandles.isEmpty()) {
            return relationalCandles;
        }

        logger.info(
            "No relational candles found for dataset {} timeframe {} symbols {} in window {} to {}. Falling back to legacy CSV compatibility path.",
            datasetId,
            timeframe,
            normalizedSymbols.isEmpty() ? "<all>" : normalizedSymbols,
            windowStart,
            windowEnd
        );
        return loadLegacyCandles(datasetId, timeframe, windowStart, windowEnd, normalizedSymbols);
    }

    private List<MarketDataQueriedCandle> loadLegacyCandles(Long datasetId,
                                                            String timeframe,
                                                            LocalDateTime windowStart,
                                                            LocalDateTime windowEnd,
                                                            Set<String> requestedSymbols) {
        BacktestDataset dataset = backtestDatasetStorageService.getDataset(datasetId);
        List<OHLCVData> filtered = backtestDatasetCandleCache.getOrParse(dataset).stream()
            .filter(candle -> !candle.getTimestamp().isBefore(windowStart))
            .filter(candle -> !candle.getTimestamp().isAfter(windowEnd))
            .filter(candle -> requestedSymbols.isEmpty() || requestedSymbols.contains(candle.getSymbol()))
            .sorted(Comparator.comparing(OHLCVData::getSymbol).thenComparing(OHLCVData::getTimestamp))
            .toList();
        if (filtered.isEmpty()) {
            return List.of();
        }

        return marketDataResampler.resample(filtered, timeframe).stream()
            .map(candle -> new MarketDataQueriedCandle(
                candle.getTimestamp(),
                candle.getSymbol(),
                candle.getOpen(),
                candle.getHigh(),
                candle.getLow(),
                candle.getClose(),
                candle.getVolume(),
                MarketDataCandleProvenance.legacy(datasetId, candle.getSymbol(), timeframe)
            ))
            .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
            .toList();
    }

    private Set<String> normalizeRequestedSymbols(Set<String> requestedSymbols) {
        if (requestedSymbols == null || requestedSymbols.isEmpty()) {
            return Set.of();
        }
        return requestedSymbols.stream()
            .filter(symbol -> symbol != null && !symbol.isBlank())
            .map(String::trim)
            .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private MarketDataQueriedCandle toQueriedCandle(MarketDataCandle candle) {
        MarketDataSeries series = candle.getSeries();
        MarketDataCandleSegment segment = candle.getSegment();
        return new MarketDataQueriedCandle(
            candle.getId().getBucketStart(),
            series.getSymbolDisplay(),
            candle.getOpenPrice(),
            candle.getHighPrice(),
            candle.getLowPrice(),
            candle.getClosePrice(),
            candle.getVolume(),
            new MarketDataCandleProvenance(
                segment.getDataset().getId(),
                segment.getImportJob() == null ? null : segment.getImportJob().getId(),
                segment.getId(),
                series.getId(),
                series.getProviderId(),
                series.getExchangeId(),
                series.getSymbolDisplay(),
                candle.getId().getTimeframe(),
                segment.getResolutionTier(),
                segment.getSourceType(),
                segment.getCoverageStart(),
                segment.getCoverageEnd()
            )
        );
    }
}
