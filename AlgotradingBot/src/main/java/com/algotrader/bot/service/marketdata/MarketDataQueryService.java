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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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
        return queryCandlesForSeries(seriesId, timeframe, windowStart, windowEnd, MarketDataQueryMode.BEST_AVAILABLE).candles();
    }

    public MarketDataQueryResult queryCandlesForSeries(Long seriesId,
                                                       String timeframe,
                                                       LocalDateTime windowStart,
                                                       LocalDateTime windowEnd,
                                                       MarketDataQueryMode queryMode) {
        List<MarketDataQueriedCandle> exactCandles = marketDataCandleRepository.findCandlesInRange(seriesId, timeframe, windowStart, windowEnd).stream()
            .map(this::toQueriedCandle)
            .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
            .toList();
        return new MarketDataQueryResult(
            exactCandles,
            buildGaps(exactCandles, timeframe, windowStart, windowEnd, Set.of()),
            timeframe,
            queryMode
        );
    }

    public List<MarketDataQueriedCandle> loadCandlesForDataset(Long datasetId,
                                                               String timeframe,
                                                               LocalDateTime windowStart,
                                                               LocalDateTime windowEnd,
                                                               Set<String> requestedSymbols) {
        return queryCandlesForDataset(
            datasetId,
            timeframe,
            windowStart,
            windowEnd,
            requestedSymbols,
            MarketDataQueryMode.BEST_AVAILABLE
        ).candles();
    }

    public MarketDataQueryResult queryCandlesForDataset(Long datasetId,
                                                        String timeframe,
                                                        LocalDateTime windowStart,
                                                        LocalDateTime windowEnd,
                                                        Set<String> requestedSymbols,
                                                        MarketDataQueryMode queryMode) {
        Set<String> normalizedSymbols = normalizeRequestedSymbols(requestedSymbols);
        List<MarketDataQueriedCandle> exactCandles = loadExactDatasetCandles(datasetId, timeframe, windowStart, windowEnd, normalizedSymbols);
        List<MarketDataQueriedCandle> mergedCandles = exactCandles;
        String sourceTimeframe = timeframe;

        boolean relationalSourceSeen = !exactCandles.isEmpty();
        if (queryMode.allowsRollup()) {
            RollupAttemptResult rollupAttempt = rollUpFromFinerTimeframe(
                datasetId,
                timeframe,
                windowStart,
                windowEnd,
                normalizedSymbols
            );
            List<MarketDataQueriedCandle> rolledCandles = rollupAttempt.candles();
            relationalSourceSeen = relationalSourceSeen || rollupAttempt.sourceSeen();
            if (!rolledCandles.isEmpty()) {
                mergedCandles = mergeCandles(exactCandles, rolledCandles);
                if (exactCandles.isEmpty()) {
                    sourceTimeframe = rolledCandles.stream()
                        .map(candle -> candle.provenance() == null ? null : candle.provenance().timeframe())
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElse(timeframe);
                }
            }
        }

        List<MarketDataQueryGap> gaps = buildGaps(mergedCandles, timeframe, windowStart, windowEnd, normalizedSymbols);
        if (!mergedCandles.isEmpty() || relationalSourceSeen) {
            return new MarketDataQueryResult(mergedCandles, gaps, sourceTimeframe, queryMode);
        }

        logger.info(
            "No relational candles found for dataset {} timeframe {} symbols {} in window {} to {}. Falling back to legacy CSV compatibility path.",
            datasetId,
            timeframe,
            normalizedSymbols.isEmpty() ? "<all>" : normalizedSymbols,
            windowStart,
            windowEnd
        );
        List<MarketDataQueriedCandle> legacyCandles = loadLegacyCandles(datasetId, timeframe, windowStart, windowEnd, normalizedSymbols);
        return new MarketDataQueryResult(
            legacyCandles,
            buildGaps(legacyCandles, timeframe, windowStart, windowEnd, normalizedSymbols),
            timeframe,
            queryMode
        );
    }

    private List<MarketDataQueriedCandle> loadExactDatasetCandles(Long datasetId,
                                                                  String timeframe,
                                                                  LocalDateTime windowStart,
                                                                  LocalDateTime windowEnd,
                                                                  Set<String> normalizedSymbols) {
        return normalizedSymbols.isEmpty()
            ? marketDataCandleRepository.findDatasetCandlesInRange(datasetId, timeframe, windowStart, windowEnd).stream()
                .map(this::toQueriedCandle)
                .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
                .toList()
            : normalizedSymbols.stream()
                .flatMap(symbol -> marketDataCandleRepository
                    .findDatasetCandlesForSymbolInRange(datasetId, timeframe, symbol, windowStart, windowEnd)
                    .stream())
                .map(this::toQueriedCandle)
                .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
                .toList();
    }

    private RollupAttemptResult rollUpFromFinerTimeframe(Long datasetId,
                                                         String timeframe,
                                                         LocalDateTime windowStart,
                                                         LocalDateTime windowEnd,
                                                         Set<String> normalizedSymbols) {
        MarketDataTimeframe requestedTimeframe = MarketDataTimeframe.from(timeframe);
        Map<String, MarketDataQueriedCandle> merged = new LinkedHashMap<>();
        boolean sourceSeen = false;
        for (MarketDataTimeframe candidate : finerTimeframesFor(requestedTimeframe)) {
            List<MarketDataQueriedCandle> sourceCandles = loadExactDatasetCandles(
                datasetId,
                candidate.id(),
                windowStart,
                windowEnd,
                normalizedSymbols
            );
            if (sourceCandles.isEmpty()) {
                continue;
            }
            sourceSeen = true;

            List<MarketDataQueriedCandle> rolledCandles = marketDataResampler.resampleQueriedCandles(
                sourceCandles,
                candidate.id(),
                timeframe
            );
            if (!rolledCandles.isEmpty()) {
                rolledCandles.forEach(candle -> merged.putIfAbsent(bucketKey(candle.symbol(), candle.timestamp()), candle));
                logger.info(
                    "Rolled up {} {} candles into timeframe {} for dataset {} between {} and {}.",
                    sourceCandles.size(),
                    candidate.id(),
                    timeframe,
                    datasetId,
                    windowStart,
                    windowEnd
                );
            }
        }
        return new RollupAttemptResult(
            merged.values().stream()
                .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
                .toList(),
            sourceSeen
        );
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
            .filter(candle -> requestedSymbols.isEmpty() || requestedSymbols.contains(candle.getSymbol().toUpperCase(Locale.ROOT)))
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

    private List<MarketDataQueriedCandle> mergeCandles(List<MarketDataQueriedCandle> exactCandles,
                                                       List<MarketDataQueriedCandle> rolledCandles) {
        Map<String, MarketDataQueriedCandle> merged = new LinkedHashMap<>();
        rolledCandles.forEach(candle -> merged.put(bucketKey(candle.symbol(), candle.timestamp()), candle));
        exactCandles.forEach(candle -> merged.put(bucketKey(candle.symbol(), candle.timestamp()), candle));
        return merged.values().stream()
            .sorted(Comparator.comparing(MarketDataQueriedCandle::timestamp).thenComparing(MarketDataQueriedCandle::symbol))
            .toList();
    }

    private List<MarketDataQueryGap> buildGaps(List<MarketDataQueriedCandle> candles,
                                               String timeframe,
                                               LocalDateTime windowStart,
                                               LocalDateTime windowEnd,
                                               Set<String> requestedSymbols) {
        if (candles.isEmpty() && requestedSymbols.isEmpty()) {
            return List.of();
        }

        MarketDataTimeframe requestedTimeframe = MarketDataTimeframe.from(timeframe);
        Set<String> symbols = requestedSymbols.isEmpty()
            ? candles.stream().map(MarketDataQueriedCandle::symbol).collect(Collectors.toCollection(LinkedHashSet::new))
            : requestedSymbols;
        if (symbols.isEmpty()) {
            return List.of();
        }

        Set<String> availableBuckets = candles.stream()
            .map(candle -> bucketKey(candle.symbol(), candle.timestamp()))
            .collect(Collectors.toSet());
        List<MarketDataQueryGap> gaps = new ArrayList<>();
        LocalDateTime current = alignToBucket(windowStart, requestedTimeframe);
        while (!current.isAfter(windowEnd)) {
            for (String symbol : symbols) {
                if (!availableBuckets.contains(bucketKey(symbol, current))) {
                    gaps.add(new MarketDataQueryGap(symbol, timeframe, current));
                }
            }
            current = current.plus(requestedTimeframe.step());
        }
        return gaps;
    }

    private Set<String> normalizeRequestedSymbols(Set<String> requestedSymbols) {
        if (requestedSymbols == null || requestedSymbols.isEmpty()) {
            return Set.of();
        }
        return requestedSymbols.stream()
            .filter(symbol -> symbol != null && !symbol.isBlank())
            .map(String::trim)
            .map(symbol -> symbol.toUpperCase(Locale.ROOT))
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private List<MarketDataTimeframe> finerTimeframesFor(MarketDataTimeframe requestedTimeframe) {
        return Arrays.stream(MarketDataTimeframe.values())
            .filter(candidate -> candidate.isFinerThan(requestedTimeframe))
            .sorted(Comparator.comparing(MarketDataTimeframe::step))
            .toList();
    }

    private LocalDateTime alignToBucket(LocalDateTime timestamp, MarketDataTimeframe targetTimeframe) {
        if (targetTimeframe == MarketDataTimeframe.ONE_DAY) {
            return timestamp.toLocalDate().atStartOfDay();
        }
        long stepMinutes = targetTimeframe.step().toMinutes();
        long minutesFromMidnight = timestamp.getHour() * 60L + timestamp.getMinute();
        long bucketStartMinutes = (minutesFromMidnight / stepMinutes) * stepMinutes;
        return timestamp.toLocalDate().atStartOfDay().plusMinutes(bucketStartMinutes);
    }

    private String bucketKey(String symbol, LocalDateTime bucketStart) {
        return symbol.toUpperCase(Locale.ROOT) + "|" + bucketStart;
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

    private record RollupAttemptResult(List<MarketDataQueriedCandle> candles, boolean sourceSeen) {
    }
}
