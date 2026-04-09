package com.algotrader.bot.marketdata.application.service;

import com.algotrader.bot.backtest.application.service.BacktestDatasetStorageService;
import com.algotrader.bot.backtest.domain.model.OHLCVData;
import com.algotrader.bot.backtest.infrastructure.persistence.entity.BacktestDataset;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataCandle;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataCandleId;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataCandleSegment;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataImportJob;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataSeries;
import com.algotrader.bot.marketdata.infrastructure.persistence.repository.MarketDataCandleRepository;
import com.algotrader.bot.marketdata.infrastructure.persistence.repository.MarketDataCandleSegmentRepository;
import com.algotrader.bot.marketdata.infrastructure.persistence.repository.MarketDataSeriesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MarketDataDatasetIngestionService {

    private static final Pattern PAIR_SPLITTER = Pattern.compile("[/_:-]");
    private static final List<String> QUOTE_ASSET_SUFFIXES = List.of("USDT", "USDC", "USD", "BTC", "ETH", "EUR");

    private final BacktestDatasetStorageService backtestDatasetStorageService;
    private final MarketDataSeriesRepository marketDataSeriesRepository;
    private final MarketDataCandleSegmentRepository marketDataCandleSegmentRepository;
    private final MarketDataCandleRepository marketDataCandleRepository;

    public MarketDataDatasetIngestionService(BacktestDatasetStorageService backtestDatasetStorageService,
                                             MarketDataSeriesRepository marketDataSeriesRepository,
                                             MarketDataCandleSegmentRepository marketDataCandleSegmentRepository,
                                             MarketDataCandleRepository marketDataCandleRepository) {
        this.backtestDatasetStorageService = backtestDatasetStorageService;
        this.marketDataSeriesRepository = marketDataSeriesRepository;
        this.marketDataCandleSegmentRepository = marketDataCandleSegmentRepository;
        this.marketDataCandleRepository = marketDataCandleRepository;
    }

    @Transactional
    public BacktestDataset ensurePendingDataset(MarketDataImportJob job, MarketDataProvider provider) {
        if (job.getDatasetId() != null) {
            return backtestDatasetStorageService.getDataset(job.getDatasetId());
        }

        BacktestDataset dataset = backtestDatasetStorageService.createPendingProviderDataset(
            job.getDatasetName(),
            buildOriginalFilename(job, provider),
            job.getSymbolsCsv(),
            job.getStartDate().atStartOfDay(),
            job.getEndDate().atTime(23, 59, 59)
        );
        job.setDatasetId(dataset.getId());
        return dataset;
    }

    @Transactional
    public int appendBars(MarketDataImportJob job,
                          MarketDataProvider provider,
                          List<OHLCVData> fetchedBars) {
        if (fetchedBars == null || fetchedBars.isEmpty()) {
            return 0;
        }

        BacktestDataset dataset = ensurePendingDataset(job, provider);
        int insertedCandleCount = 0;
        Map<String, List<OHLCVData>> candlesBySymbol = fetchedBars.stream()
            .sorted(Comparator.comparing(OHLCVData::getSymbol).thenComparing(OHLCVData::getTimestamp))
            .collect(Collectors.groupingBy(
                OHLCVData::getSymbol,
                LinkedHashMap::new,
                Collectors.toList()
            ));

        for (Map.Entry<String, List<OHLCVData>> entry : candlesBySymbol.entrySet()) {
            List<OHLCVData> symbolCandles = canonicalizeSymbolCandles(job, entry.getKey(), entry.getValue());
            if (symbolCandles.isEmpty()) {
                continue;
            }

            SeriesDescriptor descriptor = inferSeriesDescriptor(job, provider, entry.getKey());
            MarketDataSeries series = findOrCreateSeries(descriptor);
            String checksum = checksumForCandles(symbolCandles);
            if (marketDataCandleSegmentRepository.findByDatasetSeriesTimeframeAndChecksum(
                dataset.getId(),
                series.getId(),
                job.getTimeframe(),
                checksum
            ).isPresent()) {
                continue;
            }

            LocalDateTime coverageStart = symbolCandles.getFirst().getTimestamp();
            LocalDateTime coverageEnd = symbolCandles.getLast().getTimestamp();
            Map<LocalDateTime, MarketDataCandle> existingCandlesByBucket = marketDataCandleRepository.findDatasetSeriesCandlesInRange(
                    dataset.getId(),
                    series.getId(),
                    job.getTimeframe(),
                    coverageStart,
                    coverageEnd
                ).stream()
                .collect(Collectors.toMap(
                    candle -> candle.getId().getBucketStart(),
                    candle -> candle,
                    (left, _right) -> left,
                    LinkedHashMap::new
                ));

            List<OHLCVData> candlesToInsert = new ArrayList<>(symbolCandles.size());
            for (OHLCVData candle : symbolCandles) {
                MarketDataCandle existing = existingCandlesByBucket.get(candle.getTimestamp());
                if (existing == null) {
                    candlesToInsert.add(candle);
                    continue;
                }
                if (!matches(existing, candle)) {
                    throw new IllegalStateException(
                        "Conflicting candle already exists for provider import job " + job.getId()
                            + ", symbol " + entry.getKey()
                            + ", timeframe " + job.getTimeframe()
                            + ", bucket " + candle.getTimestamp()
                    );
                }
            }

            if (candlesToInsert.isEmpty()) {
                continue;
            }

            MarketDataCandleSegment segment = marketDataCandleSegmentRepository.save(
                buildSegment(job, dataset, series, provider, coverageStart, coverageEnd, symbolCandles.size(), checksum, entry.getKey())
            );
            MarketDataSeries persistedSeries = series;
            marketDataCandleRepository.saveAll(
                candlesToInsert.stream()
                    .map(candle -> toMarketDataCandle(persistedSeries, segment, candle))
                    .toList()
            );
            insertedCandleCount += candlesToInsert.size();
        }

        return insertedCandleCount;
    }

    @Transactional
    public BacktestDataset finalizeDataset(MarketDataImportJob job) {
        if (job.getDatasetId() == null) {
            throw new IllegalStateException("Import finished without any fetched bars to persist.");
        }

        List<MarketDataCandle> candles = marketDataCandleRepository.findByDatasetIdOrdered(job.getDatasetId());
        if (candles.isEmpty()) {
            throw new IllegalStateException("Import finished without any normalized candles to finalize.");
        }

        LocalDateTime dataStart = candles.getFirst().getId().getBucketStart();
        LocalDateTime dataEnd = candles.getLast().getId().getBucketStart();
        return backtestDatasetStorageService.finalizeProviderDataset(
            job.getDatasetId(),
            candles.size(),
            checksumForMarketDataCandles(candles),
            dataStart,
            dataEnd
        );
    }

    @Transactional
    public void discardPendingDataset(Long datasetId) {
        if (datasetId == null) {
            return;
        }
        marketDataCandleRepository.deleteByDatasetId(datasetId);
        marketDataCandleSegmentRepository.deleteByDatasetId(datasetId);
        backtestDatasetStorageService.deleteDataset(datasetId);
    }

    private MarketDataSeries findOrCreateSeries(SeriesDescriptor descriptor) {
        return marketDataSeriesRepository.findByProviderIdAndExchangeIdAndSymbolNormalizedAndAssetClass(
                descriptor.providerId(),
                descriptor.exchangeId(),
                descriptor.symbolNormalized(),
                descriptor.assetClass()
            )
            .orElseGet(() -> marketDataSeriesRepository.save(descriptor.toSeriesEntity()));
    }

    private SeriesDescriptor inferSeriesDescriptor(MarketDataImportJob job,
                                                   MarketDataProvider provider,
                                                   String rawSymbol) {
        if (job.getAssetType() == MarketDataAssetType.STOCK) {
            String symbol = rawSymbol.trim().toUpperCase(Locale.ROOT);
            return new SeriesDescriptor(
                provider.definition().id(),
                "",
                provider.definition().id().toUpperCase(Locale.ROOT),
                "EXCHANGE",
                "EQUITY",
                "EQUITY",
                symbol.replaceAll("[^A-Z0-9.]", ""),
                symbol,
                "",
                "",
                "USD",
                "US",
                "America/New_York",
                "US_EQUITIES",
                "{\"providerImport\":true,\"providerId\":\"" + provider.definition().id() + "\"}"
            );
        }

        String normalizedInput = rawSymbol.trim().toUpperCase(Locale.ROOT);
        String[] explicitTokens = PAIR_SPLITTER.split(normalizedInput);
        if (explicitTokens.length == 2 && !explicitTokens[0].isBlank() && !explicitTokens[1].isBlank()) {
            return cryptoDescriptor(provider, explicitTokens[0], explicitTokens[1]);
        }
        for (String quoteAsset : QUOTE_ASSET_SUFFIXES) {
            if (normalizedInput.endsWith(quoteAsset) && normalizedInput.length() > quoteAsset.length()) {
                String baseAsset = normalizedInput.substring(0, normalizedInput.length() - quoteAsset.length());
                if (baseAsset.length() >= 2) {
                    return cryptoDescriptor(provider, baseAsset, quoteAsset);
                }
            }
        }
        throw new IllegalArgumentException("Unsupported crypto symbol format for provider import: " + rawSymbol);
    }

    private SeriesDescriptor cryptoDescriptor(MarketDataProvider provider, String baseAsset, String quoteAsset) {
        String normalizedBase = baseAsset.trim().toUpperCase(Locale.ROOT);
        String normalizedQuote = quoteAsset.trim().toUpperCase(Locale.ROOT);
        return new SeriesDescriptor(
            provider.definition().id(),
            "",
            provider.definition().id().toUpperCase(Locale.ROOT),
            "EXCHANGE",
            "CRYPTO_SPOT",
            "SPOT",
            normalizedBase + normalizedQuote,
            normalizedBase + "/" + normalizedQuote,
            normalizedBase,
            normalizedQuote,
            normalizedQuote,
            "",
            "UTC",
            "ALWAYS_ON",
            "{\"providerImport\":true,\"providerId\":\"" + provider.definition().id() + "\"}"
        );
    }

    private MarketDataCandleSegment buildSegment(MarketDataImportJob job,
                                                 BacktestDataset dataset,
                                                 MarketDataSeries series,
                                                 MarketDataProvider provider,
                                                 LocalDateTime coverageStart,
                                                 LocalDateTime coverageEnd,
                                                 int rowCount,
                                                 String checksumSha256,
                                                 String symbol) {
        MarketDataCandleSegment segment = new MarketDataCandleSegment();
        segment.setDataset(dataset);
        segment.setImportJob(job);
        segment.setSeries(series);
        segment.setTimeframe(job.getTimeframe());
        segment.setSourceType("PROVIDER_IMPORT");
        segment.setCoverageStart(coverageStart);
        segment.setCoverageEnd(coverageEnd);
        segment.setRowCount(rowCount);
        segment.setChecksumSha256(checksumSha256);
        segment.setSchemaVersion("ohlcv-v1");
        segment.setResolutionTier("EXACT_RAW");
        segment.setSourcePriority((short) 100);
        segment.setSegmentStatus("ACTIVE");
        segment.setStorageEncoding("ROW_STORE");
        segment.setArchived(Boolean.FALSE);
        segment.setProviderBatchReference(provider.definition().id() + "-job-" + job.getId());
        segment.setNotes("Persisted directly from provider import job " + job.getId() + ".");
        segment.setLineageJson(
            "{\"providerImport\":true,\"providerId\":\"" + provider.definition().id()
                + "\",\"jobId\":" + job.getId()
                + ",\"symbol\":\"" + symbol
                + "\",\"timeframe\":\"" + job.getTimeframe() + "\"}"
        );
        return segment;
    }

    private MarketDataCandle toMarketDataCandle(MarketDataSeries series,
                                                MarketDataCandleSegment segment,
                                                OHLCVData candle) {
        MarketDataCandle marketDataCandle = new MarketDataCandle();
        marketDataCandle.setId(new MarketDataCandleId(segment.getId(), segment.getTimeframe(), candle.getTimestamp()));
        marketDataCandle.setSeries(series);
        marketDataCandle.setSegment(segment);
        marketDataCandle.setOpenPrice(candle.getOpen());
        marketDataCandle.setHighPrice(candle.getHigh());
        marketDataCandle.setLowPrice(candle.getLow());
        marketDataCandle.setClosePrice(candle.getClose());
        marketDataCandle.setVolume(candle.getVolume());
        marketDataCandle.setTradeCount(0L);
        marketDataCandle.setVwap(candle.getClose());
        return marketDataCandle;
    }

    private boolean matches(MarketDataCandle existing, OHLCVData candle) {
        return existing.getOpenPrice().compareTo(candle.getOpen()) == 0
            && existing.getHighPrice().compareTo(candle.getHigh()) == 0
            && existing.getLowPrice().compareTo(candle.getLow()) == 0
            && existing.getClosePrice().compareTo(candle.getClose()) == 0
            && existing.getVolume().compareTo(candle.getVolume()) == 0;
    }

    private List<OHLCVData> canonicalizeSymbolCandles(MarketDataImportJob job,
                                                      String symbol,
                                                      List<OHLCVData> fetchedCandles) {
        Map<LocalDateTime, OHLCVData> canonicalCandles = new LinkedHashMap<>();
        for (OHLCVData candle : fetchedCandles) {
            OHLCVData existing = canonicalCandles.putIfAbsent(candle.getTimestamp(), candle);
            if (existing == null) {
                continue;
            }
            if (!matches(existing, candle)) {
                throw new IllegalStateException(
                    "Provider import job " + job.getId()
                        + " returned conflicting duplicate candles for symbol " + symbol
                        + ", timeframe " + job.getTimeframe()
                        + ", bucket " + candle.getTimestamp()
                );
            }
        }
        return new ArrayList<>(canonicalCandles.values());
    }

    private boolean matches(OHLCVData left, OHLCVData right) {
        return left.getOpen().compareTo(right.getOpen()) == 0
            && left.getHigh().compareTo(right.getHigh()) == 0
            && left.getLow().compareTo(right.getLow()) == 0
            && left.getClose().compareTo(right.getClose()) == 0
            && left.getVolume().compareTo(right.getVolume()) == 0;
    }

    private String buildOriginalFilename(MarketDataImportJob job, MarketDataProvider provider) {
        return provider.definition().id()
            + "-" + job.getAssetType().name().toLowerCase(Locale.ROOT)
            + "-" + job.getTimeframe()
            + "-" + job.getStartDate()
            + "-" + job.getEndDate()
            + ".csv";
    }

    private String checksumForCandles(List<OHLCVData> candles) {
        return checksumForStrings(candles.stream()
            .map(candle -> candle.getTimestamp() + "|" + candle.getSymbol() + "|" + candle.getOpen() + "|"
                + candle.getHigh() + "|" + candle.getLow() + "|" + candle.getClose() + "|" + candle.getVolume())
            .toList());
    }

    private String checksumForMarketDataCandles(List<MarketDataCandle> candles) {
        return checksumForStrings(candles.stream()
            .map(candle -> candle.getId().getBucketStart() + "|" + candle.getSeries().getSymbolDisplay() + "|"
                + candle.getOpenPrice() + "|" + candle.getHighPrice() + "|" + candle.getLowPrice() + "|"
                + candle.getClosePrice() + "|" + candle.getVolume())
            .toList());
    }

    private String checksumForStrings(List<String> lines) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            for (String line : lines.stream().filter(Objects::nonNull).sorted().toList()) {
                digest.update((line + "\n").getBytes());
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 not available", exception);
        }
    }

    private record SeriesDescriptor(String providerId,
                                    String brokerId,
                                    String exchangeId,
                                    String venueType,
                                    String assetClass,
                                    String instrumentType,
                                    String symbolNormalized,
                                    String symbolDisplay,
                                    String baseAsset,
                                    String quoteAsset,
                                    String currencyCode,
                                    String countryCode,
                                    String timezoneName,
                                    String sessionTemplate,
                                    String providerMetadataJson) {

        private MarketDataSeries toSeriesEntity() {
            MarketDataSeries series = new MarketDataSeries();
            series.setProviderId(providerId);
            series.setBrokerId(brokerId);
            series.setExchangeId(exchangeId);
            series.setVenueType(venueType);
            series.setAssetClass(assetClass);
            series.setInstrumentType(instrumentType);
            series.setSymbolNormalized(symbolNormalized);
            series.setSymbolDisplay(symbolDisplay);
            series.setBaseAsset(baseAsset);
            series.setQuoteAsset(quoteAsset);
            series.setCurrencyCode(currencyCode);
            series.setCountryCode(countryCode);
            series.setTimezoneName(timezoneName);
            series.setSessionTemplate(sessionTemplate);
            series.setProviderMetadataJson(providerMetadataJson);
            return series;
        }
    }
}
