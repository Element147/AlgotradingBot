package com.algotrader.bot.marketdata.application.test;

import com.algotrader.bot.backtest.domain.model.OHLCVData;
import com.algotrader.bot.backtest.infrastructure.persistence.repository.BacktestDatasetRepository;
import com.algotrader.bot.marketdata.api.request.MarketDataImportJobRequest;
import com.algotrader.bot.marketdata.api.response.MarketDataImportJobResponse;
import com.algotrader.bot.marketdata.api.response.MarketDataProviderResponse;
import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataImportJob;
import com.algotrader.bot.marketdata.infrastructure.persistence.repository.MarketDataImportJobRepository;
import com.algotrader.bot.system.application.recovery.MarketDataImportStartupRecoveryParticipant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;
import com.algotrader.bot.marketdata.application.service.MarketDataAssetType;
import com.algotrader.bot.marketdata.application.service.MarketDataImportJobStatus;
import com.algotrader.bot.marketdata.application.service.MarketDataImportService;
import com.algotrader.bot.marketdata.application.service.MarketDataProvider;
import com.algotrader.bot.marketdata.application.service.MarketDataProviderDefinition;
import com.algotrader.bot.marketdata.application.service.MarketDataProviderFetchRequest;
import com.algotrader.bot.marketdata.application.service.MarketDataRetryableException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(MarketDataImportServiceIntegrationTest.TestConfig.class)
class MarketDataImportServiceIntegrationTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        StubMarketDataProvider stubMarketDataProvider() {
            return new StubMarketDataProvider();
        }

        @Bean
        KeyRequiredStubMarketDataProvider keyRequiredStubMarketDataProvider() {
            return new KeyRequiredStubMarketDataProvider();
        }
    }

    @org.springframework.beans.factory.annotation.Autowired
    private MarketDataImportService marketDataImportService;

    @org.springframework.beans.factory.annotation.Autowired
    private StubMarketDataProvider stubMarketDataProvider;

    @org.springframework.beans.factory.annotation.Autowired
    private MarketDataImportJobRepository marketDataImportJobRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private BacktestDatasetRepository backtestDatasetRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private MarketDataImportStartupRecoveryParticipant marketDataImportStartupRecoveryParticipant;

    @BeforeEach
    void setUp() {
        stubMarketDataProvider.mode = StubMode.SUCCESS;
    }

    @Test
    void createJob_andProcessJob_importsDatasetIntoBacktestCatalog() {
        MarketDataImportJobResponse created = marketDataImportService.createJob(new MarketDataImportJobRequest(
            "stub",
            MarketDataAssetType.CRYPTO,
            List.of("BTC/USDT"),
            "1h",
            LocalDate.parse("2025-01-01"),
            LocalDate.parse("2025-01-02"),
            "Stub BTC 1h",
            false,
            false
        ));

        marketDataImportService.processJob(created.id());

        MarketDataImportJobResponse completed = findJob(created.id());
        assertThat(completed.status()).isEqualTo("COMPLETED");
        assertThat(completed.datasetReady()).isTrue();
        assertThat(completed.datasetId()).isNotNull();
        assertThat(completed.importedRowCount()).isEqualTo(2);
    }

    @Test
    void processJob_marksWaitingRetryWhenProviderRequestsPause() {
        stubMarketDataProvider.mode = StubMode.RETRYABLE;

        MarketDataImportJobResponse created = marketDataImportService.createJob(new MarketDataImportJobRequest(
            "stub",
            MarketDataAssetType.CRYPTO,
            List.of("BTC/USDT"),
            "1h",
            LocalDate.parse("2025-01-01"),
            LocalDate.parse("2025-01-02"),
            "Retry BTC 1h",
            false,
            false
        ));

        marketDataImportService.processJob(created.id());

        MarketDataImportJobResponse waiting = findJob(created.id());
        assertThat(waiting.status()).isEqualTo("WAITING_RETRY");
        assertThat(waiting.nextRetryAt()).isNotNull();
        assertThat(waiting.statusMessage()).contains("wait");
    }

    @Test
    void createJob_rejectsProviderWithoutConfiguredApiKey() {
        IllegalArgumentException error = assertThrows(
            IllegalArgumentException.class,
            () -> marketDataImportService.createJob(new MarketDataImportJobRequest(
                "stub-keyed",
                MarketDataAssetType.STOCK,
                List.of("AAPL"),
                "1d",
                LocalDate.parse("2025-01-01"),
                LocalDate.parse("2025-01-02"),
                "Alpha AAPL 1d",
                false,
                false
            ))
        );

        assertThat(error.getMessage()).contains("ALGOTRADING_MARKET_DATA_TEST_KEY");
    }

    @Test
    void createJob_rejectsKrakenImportOutsideRollingWindow() {
        LocalDate startDate = LocalDate.now(ZoneOffset.UTC).minusDays(30);

        IllegalArgumentException error = assertThrows(
            IllegalArgumentException.class,
            () -> marketDataImportService.createJob(new MarketDataImportJobRequest(
                "kraken",
                MarketDataAssetType.CRYPTO,
                List.of("BTC/USDT"),
                "1m",
                startDate,
                startDate.plusDays(1),
                "Kraken too old",
                false,
                false
            ))
        );

        assertThat(error.getMessage()).contains("Kraken only exposes the most recent 720 candles");
    }

    @Test
    void listProviders_includesStubProviderMetadata() {
        List<MarketDataProviderResponse> providers = marketDataImportService.listProviders();

        assertThat(providers).anySatisfy(provider -> {
            assertThat(provider.id()).isEqualTo("stub");
            assertThat(provider.supportedAssetTypes()).contains("CRYPTO");
        });
    }

    @Test
    void startupRecovery_requeuesInterruptedImportAndCompletesIt() throws Exception {
        MarketDataImportJobResponse created = marketDataImportService.createJob(new MarketDataImportJobRequest(
            "stub",
            MarketDataAssetType.CRYPTO,
            List.of("BTC/USDT"),
            "1h",
            LocalDate.parse("2025-01-01"),
            LocalDate.parse("2025-01-02"),
            "Interrupted import recovery",
            false,
            false
        ));

        MarketDataImportJob interrupted = marketDataImportJobRepository.findById(created.id()).orElseThrow();
        interrupted.setStatus(MarketDataImportJobStatus.RUNNING);
        interrupted.setStatusMessage("Server stopped mid-import.");
        interrupted.setStartedAt(LocalDateTime.now().minusMinutes(2));
        interrupted.setCurrentChunkStart(LocalDateTime.parse("2025-01-01T00:00:00"));
        marketDataImportJobRepository.save(interrupted);

        TestTransaction.flagForCommit();
        TestTransaction.end();

        assertThat(marketDataImportStartupRecoveryParticipant.recoverPendingWork()).isEqualTo(1);

        MarketDataImportJobResponse completed = waitForJob(created.id());
        assertThat(completed.status()).isEqualTo("COMPLETED");
        assertThat(completed.datasetReady()).isTrue();
        assertThat(completed.datasetId()).isNotNull();
    }

    @Test
    void listJobs_reportsDatasetNotReadyWhenLinkedDatasetWasArchivedDuringCutover() {
        MarketDataImportJobResponse created = marketDataImportService.createJob(new MarketDataImportJobRequest(
            "stub",
            MarketDataAssetType.CRYPTO,
            List.of("BTC/USDT"),
            "1h",
            LocalDate.parse("2025-01-01"),
            LocalDate.parse("2025-01-02"),
            "Archived dataset handoff",
            false,
            false
        ));

        marketDataImportService.processJob(created.id());

        MarketDataImportJobResponse completed = findJob(created.id());
        var dataset = backtestDatasetRepository.findById(completed.datasetId()).orElseThrow();
        dataset.setReady(Boolean.FALSE);
        dataset.setArchived(Boolean.TRUE);
        dataset.setArchiveReason("Archived during provider-only cutover.");
        backtestDatasetRepository.save(dataset);

        MarketDataImportJobResponse refreshed = findJob(created.id());
        assertThat(refreshed.status()).isEqualTo("COMPLETED");
        assertThat(refreshed.datasetReady()).isFalse();
        assertThat(refreshed.datasetId()).isEqualTo(completed.datasetId());
    }

    private MarketDataImportJobResponse findJob(Long id) {
        return marketDataImportService.listJobs().stream()
            .filter(job -> job.id().equals(id))
            .findFirst()
            .orElseThrow();
    }

    private MarketDataImportJobResponse waitForJob(Long id) throws InterruptedException {
        for (int attempt = 0; attempt < 100; attempt++) {
            MarketDataImportJobResponse job = findJob(id);
            if ("COMPLETED".equals(job.status()) || "FAILED".equals(job.status())) {
                return job;
            }
            Thread.sleep(100);
        }
        return findJob(id);
    }

    enum StubMode {
        SUCCESS,
        RETRYABLE
    }

    static class StubMarketDataProvider implements MarketDataProvider {

        private StubMode mode = StubMode.SUCCESS;

        @Override
        public MarketDataProviderDefinition definition() {
            return new MarketDataProviderDefinition(
                "stub",
                "Stub Provider",
                "Test-only provider.",
                Set.of(MarketDataAssetType.CRYPTO),
                List.of("1h"),
                false,
                null,
                false,
                false,
                List.of("BTC/USDT"),
                "https://example.com/docs",
                "https://example.com/signup",
                "No setup required in tests."
            );
        }

        @Override
        public boolean isConfigured() {
            return true;
        }

        @Override
        public List<OHLCVData> fetch(MarketDataProviderFetchRequest request) {
            if (mode == StubMode.RETRYABLE) {
                throw new MarketDataRetryableException(
                    "Provider asked the downloader to wait.",
                    LocalDateTime.now().plusMinutes(5)
                );
            }

            return List.of(
                new OHLCVData(
                    request.start(),
                    "BTC/USDT",
                    new BigDecimal("100"),
                    new BigDecimal("105"),
                    new BigDecimal("99"),
                    new BigDecimal("104"),
                    new BigDecimal("1000")
                ),
                new OHLCVData(
                    request.start().plusHours(1),
                    "BTC/USDT",
                    new BigDecimal("104"),
                    new BigDecimal("106"),
                    new BigDecimal("103"),
                    new BigDecimal("105"),
                    new BigDecimal("1100")
                )
            );
        }
    }

    static class KeyRequiredStubMarketDataProvider implements MarketDataProvider {

        @Override
        public MarketDataProviderDefinition definition() {
            return new MarketDataProviderDefinition(
                "stub-keyed",
                "Stub Keyed Provider",
                "Test-only provider that simulates a missing API key.",
                Set.of(MarketDataAssetType.STOCK),
                List.of("1d"),
                true,
                "ALGOTRADING_MARKET_DATA_TEST_KEY",
                false,
                false,
                List.of("AAPL"),
                "https://example.com/docs",
                "https://example.com/signup",
                "Set an API key before use."
            );
        }

        @Override
        public boolean isConfigured() {
            return false;
        }

        @Override
        public List<OHLCVData> fetch(MarketDataProviderFetchRequest request) {
            return List.of();
        }
    }
}
