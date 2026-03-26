package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.MarketDataCandle;
import com.algotrader.bot.entity.MarketDataCandleId;
import com.algotrader.bot.entity.MarketDataCandleSegment;
import com.algotrader.bot.entity.MarketDataSeries;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import com.algotrader.bot.repository.MarketDataCandleRepository;
import com.algotrader.bot.repository.MarketDataCandleSegmentRepository;
import com.algotrader.bot.repository.MarketDataSeriesRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MarketDataQueryServiceIntegrationTest {

    @Autowired
    private MarketDataQueryService marketDataQueryService;

    @Autowired
    private BacktestDatasetRepository backtestDatasetRepository;

    @Autowired
    private MarketDataSeriesRepository marketDataSeriesRepository;

    @Autowired
    private MarketDataCandleSegmentRepository marketDataCandleSegmentRepository;

    @Autowired
    private MarketDataCandleRepository marketDataCandleRepository;

    @Test
    void loadCandlesForDataset_prefersRelationalStoreAndKeepsProvenanceVisible() {
        BacktestDataset dataset = backtestDatasetRepository.saveAndFlush(dataset(
            "Relational dataset",
            "not-a-legacy-csv".getBytes()
        ));
        MarketDataSeries series = marketDataSeriesRepository.saveAndFlush(series("BTCUSDT", "BTC/USDT", "BTC", "USDT"));
        MarketDataCandleSegment segment = marketDataCandleSegmentRepository.saveAndFlush(segment(
            dataset,
            series,
            "1h",
            LocalDateTime.parse("2025-01-01T00:00:00"),
            LocalDateTime.parse("2025-01-01T02:00:00"),
            3,
            "a"
        ));

        marketDataCandleRepository.saveAndFlush(candle(series, segment, LocalDateTime.parse("2025-01-01T00:00:00"), "100"));
        marketDataCandleRepository.saveAndFlush(candle(series, segment, LocalDateTime.parse("2025-01-01T01:00:00"), "101"));
        marketDataCandleRepository.saveAndFlush(candle(series, segment, LocalDateTime.parse("2025-01-01T02:00:00"), "102"));

        List<MarketDataQueriedCandle> candles = marketDataQueryService.loadCandlesForDataset(
            dataset.getId(),
            "1h",
            LocalDateTime.parse("2025-01-01T00:00:00"),
            LocalDateTime.parse("2025-01-01T02:00:00"),
            Set.of("btcusdt")
        );

        assertThat(candles).hasSize(3);
        assertThat(candles).extracting(MarketDataQueriedCandle::symbol).containsOnly("BTC/USDT");
        assertThat(candles).extracting(candle -> candle.provenance().datasetId()).containsOnly(dataset.getId());
        assertThat(candles).extracting(candle -> candle.provenance().segmentId()).containsOnly(segment.getId());
        assertThat(candles).extracting(candle -> candle.provenance().seriesId()).containsOnly(series.getId());
        assertThat(candles).extracting(candle -> candle.provenance().sourceType()).containsOnly("UPLOAD");
        assertThat(candles).extracting(candle -> candle.provenance().resolutionTier()).containsOnly("EXACT_RAW");
    }

    @Test
    void loadCandlesForDataset_fallsBackToLegacyCsvForUnmigratedDataset() {
        byte[] csvData = """
            timestamp,symbol,open,high,low,close,volume
            2025-01-01T00:00:00,BTC/USDT,100,101,99,100,10
            2025-01-01T01:00:00,BTC/USDT,100,102,99,101,11
            2025-01-01T02:00:00,BTC/USDT,101,103,100,102,12
            """.getBytes();
        BacktestDataset dataset = backtestDatasetRepository.saveAndFlush(dataset("Legacy dataset", csvData));

        List<MarketDataQueriedCandle> candles = marketDataQueryService.loadCandlesForDataset(
            dataset.getId(),
            "1h",
            LocalDateTime.parse("2025-01-01T00:00:00"),
            LocalDateTime.parse("2025-01-01T02:00:00"),
            Set.of("BTC/USDT")
        );

        assertThat(candles).hasSize(3);
        assertThat(candles).extracting(candle -> candle.provenance().sourceType()).containsOnly("LEGACY_CSV");
        assertThat(candles).extracting(candle -> candle.provenance().resolutionTier()).containsOnly("LEGACY_FALLBACK");
    }

    private BacktestDataset dataset(String name, byte[] csvData) {
        BacktestDataset dataset = new BacktestDataset();
        dataset.setName(name);
        dataset.setOriginalFilename(name.replace(' ', '-').toLowerCase() + ".csv");
        dataset.setCsvData(csvData);
        dataset.setRowCount(3);
        dataset.setSymbolsCsv("BTC/USDT");
        dataset.setDataStart(LocalDateTime.parse("2025-01-01T00:00:00"));
        dataset.setDataEnd(LocalDateTime.parse("2025-01-01T02:00:00"));
        dataset.setChecksumSha256("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
        dataset.setSchemaVersion("ohlcv-v1");
        dataset.setArchived(Boolean.FALSE);
        return dataset;
    }

    private MarketDataSeries series(String symbolNormalized, String symbolDisplay, String baseAsset, String quoteAsset) {
        MarketDataSeries series = new MarketDataSeries();
        series.setProviderId("stub");
        series.setBrokerId("");
        series.setExchangeId("BINANCE");
        series.setVenueType("EXCHANGE");
        series.setAssetClass("CRYPTO_SPOT");
        series.setInstrumentType("SPOT");
        series.setSymbolNormalized(symbolNormalized);
        series.setSymbolDisplay(symbolDisplay);
        series.setBaseAsset(baseAsset);
        series.setQuoteAsset(quoteAsset);
        series.setCurrencyCode(quoteAsset);
        series.setCountryCode("");
        series.setTimezoneName("UTC");
        series.setSessionTemplate("ALWAYS_ON");
        series.setProviderMetadataJson("{\"source\":\"test\"}");
        return series;
    }

    private MarketDataCandleSegment segment(BacktestDataset dataset,
                                            MarketDataSeries series,
                                            String timeframe,
                                            LocalDateTime coverageStart,
                                            LocalDateTime coverageEnd,
                                            int rowCount,
                                            String checksumSeed) {
        MarketDataCandleSegment segment = new MarketDataCandleSegment();
        segment.setDataset(dataset);
        segment.setSeries(series);
        segment.setTimeframe(timeframe);
        segment.setSourceType("UPLOAD");
        segment.setCoverageStart(coverageStart);
        segment.setCoverageEnd(coverageEnd);
        segment.setRowCount(rowCount);
        segment.setChecksumSha256(checksumSeed.repeat(64));
        segment.setSchemaVersion("ohlcv-v1");
        segment.setResolutionTier("EXACT_RAW");
        segment.setSourcePriority((short) 100);
        segment.setSegmentStatus("ACTIVE");
        segment.setStorageEncoding("ROW_STORE");
        segment.setArchived(Boolean.FALSE);
        segment.setLineageJson("{\"kind\":\"seed\"}");
        return segment;
    }

    private MarketDataCandle candle(MarketDataSeries series,
                                    MarketDataCandleSegment segment,
                                    LocalDateTime bucketStart,
                                    String closePrice) {
        MarketDataCandle candle = new MarketDataCandle();
        candle.setId(new MarketDataCandleId(series.getId(), segment.getTimeframe(), bucketStart));
        candle.setSeries(series);
        candle.setSegment(segment);
        candle.setOpenPrice(new BigDecimal(closePrice));
        candle.setHighPrice(new BigDecimal(closePrice).add(BigDecimal.ONE));
        candle.setLowPrice(new BigDecimal(closePrice).subtract(BigDecimal.ONE));
        candle.setClosePrice(new BigDecimal(closePrice));
        candle.setVolume(new BigDecimal("1000"));
        candle.setTradeCount(42L);
        candle.setVwap(new BigDecimal(closePrice));
        return candle;
    }
}
