package com.algotrader.bot.controller;

import com.algotrader.bot.entity.BacktestDataset;
import com.algotrader.bot.entity.BacktestEquityPoint;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.entity.BacktestTradeSeriesItem;
import com.algotrader.bot.repository.BacktestDatasetRepository;
import com.algotrader.bot.repository.BacktestResultRepository;
import com.algotrader.bot.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BacktestManagementControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BacktestResultRepository backtestResultRepository;

    @Autowired
    private BacktestDatasetRepository backtestDatasetRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private String authToken;
    private Long backtestId;
    private Long comparisonBacktestId;
    private Long datasetId;

    @BeforeEach
    void setUp() {
        authToken = jwtTokenProvider.generateToken("testuser", "ROLE_USER");
        backtestResultRepository.deleteAll();
        backtestDatasetRepository.deleteAll();

        BacktestDataset dataset = new BacktestDataset();
        dataset.setName("sample-btc");
        dataset.setOriginalFilename("sample-btc.csv");
        dataset.setCsvData((
            "timestamp,symbol,open,high,low,close,volume\n" +
            "2025-01-01T00:00:00,BTC/USDT,100,101,99,100,1\n" +
            "2025-01-01T01:00:00,BTC/USDT,100,102,99,101,1\n" +
            "2025-01-01T02:00:00,BTC/USDT,101,103,100,102,1\n" +
            "2025-01-01T03:00:00,BTC/USDT,102,104,101,103,1\n" +
            "2025-01-01T04:00:00,BTC/USDT,103,105,102,104,1\n" +
            "2025-01-01T05:00:00,BTC/USDT,104,106,103,105,1\n" +
            "2025-01-01T06:00:00,BTC/USDT,105,107,104,106,1\n" +
            "2025-01-01T07:00:00,BTC/USDT,106,108,105,107,1\n" +
            "2025-01-01T08:00:00,BTC/USDT,107,109,106,108,1\n" +
            "2025-01-01T09:00:00,BTC/USDT,108,110,107,109,1\n" +
            "2025-01-01T10:00:00,BTC/USDT,109,111,108,110,1\n" +
            "2025-01-01T11:00:00,BTC/USDT,110,112,109,111,1\n" +
            "2025-01-01T12:00:00,BTC/USDT,111,113,110,112,1\n" +
            "2025-01-01T13:00:00,BTC/USDT,112,114,111,113,1\n" +
            "2025-01-01T14:00:00,BTC/USDT,113,115,112,114,1\n" +
            "2025-01-01T15:00:00,BTC/USDT,114,116,113,115,1\n" +
            "2025-01-01T16:00:00,BTC/USDT,115,117,114,116,1\n" +
            "2025-01-01T17:00:00,BTC/USDT,116,118,115,117,1\n" +
            "2025-01-01T18:00:00,BTC/USDT,117,119,116,118,1\n" +
            "2025-01-01T19:00:00,BTC/USDT,118,120,117,119,1\n" +
            "2025-01-01T20:00:00,BTC/USDT,119,121,118,120,1\n" +
            "2025-01-01T21:00:00,BTC/USDT,120,122,119,121,1\n" +
            "2025-01-01T22:00:00,BTC/USDT,121,123,120,122,1\n" +
            "2025-01-01T23:00:00,BTC/USDT,122,124,121,123,1\n"
        ).getBytes());
        dataset.setRowCount(24);
        dataset.setSymbolsCsv("BTC/USDT");
        dataset.setDataStart(LocalDateTime.parse("2025-01-01T00:00:00"));
        dataset.setDataEnd(LocalDateTime.parse("2025-01-01T23:00:00"));
        dataset.setChecksumSha256("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        dataset.setSchemaVersion("ohlcv-v1");
        datasetId = backtestDatasetRepository.save(dataset).getId();

        BacktestResult result = new BacktestResult(
            "BOLLINGER_BANDS",
            "BTC/USDT",
            LocalDateTime.now().minusDays(30),
            LocalDateTime.now().minusDays(1),
            new BigDecimal("1000"),
            new BigDecimal("1100"),
            new BigDecimal("1.2"),
            new BigDecimal("1.6"),
            new BigDecimal("52.0"),
            new BigDecimal("18.0"),
            60,
            BacktestResult.ValidationStatus.PASSED
        );
        result.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);
        result.setTimeframe("1h");
        result.setDatasetId(datasetId);
        result.setDatasetName("sample-btc");
        BacktestEquityPoint equityPoint = new BacktestEquityPoint();
        equityPoint.setPointTimestamp(LocalDateTime.now().minusDays(2));
        equityPoint.setEquity(new BigDecimal("1000"));
        equityPoint.setDrawdownPct(BigDecimal.ZERO);
        result.addEquityPoint(equityPoint);
        BacktestTradeSeriesItem tradeSeriesItem = new BacktestTradeSeriesItem();
        tradeSeriesItem.setSymbol("BTC/USDT");
        tradeSeriesItem.setEntryTime(LocalDateTime.now().minusDays(3));
        tradeSeriesItem.setExitTime(LocalDateTime.now().minusDays(2));
        tradeSeriesItem.setEntryPrice(new BigDecimal("100"));
        tradeSeriesItem.setExitPrice(new BigDecimal("110"));
        tradeSeriesItem.setQuantity(new BigDecimal("5"));
        tradeSeriesItem.setEntryValue(new BigDecimal("500"));
        tradeSeriesItem.setExitValue(new BigDecimal("550"));
        tradeSeriesItem.setReturnPct(new BigDecimal("10.0000"));
        result.addTradeSeriesItem(tradeSeriesItem);
        backtestId = backtestResultRepository.save(result).getId();

        BacktestResult comparison = new BacktestResult(
            "SMA_CROSSOVER",
            "BTC/USDT",
            LocalDateTime.now().minusDays(30),
            LocalDateTime.now().minusDays(1),
            new BigDecimal("1000"),
            new BigDecimal("950"),
            new BigDecimal("0.7"),
            new BigDecimal("1.2"),
            new BigDecimal("45.0"),
            new BigDecimal("22.0"),
            48,
            BacktestResult.ValidationStatus.FAILED
        );
        comparison.setExecutionStatus(BacktestResult.ExecutionStatus.COMPLETED);
        comparison.setTimeframe("1h");
        comparison.setDatasetId(datasetId);
        comparison.setDatasetName("sample-btc");
        comparisonBacktestId = backtestResultRepository.save(comparison).getId();
    }

    @Test
    void history_returnsItems() throws Exception {
        mockMvc.perform(get("/api/backtests")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
            .andExpect(jsonPath("$[0].id").exists())
            .andExpect(jsonPath("$[0].datasetName").value("sample-btc"))
            .andExpect(jsonPath("$[0].feesBps").value(10))
            .andExpect(jsonPath("$[0].slippageBps").value(3));
    }

    @Test
    void details_returnsSingleBacktest() throws Exception {
        mockMvc.perform(get("/api/backtests/{backtestId}", backtestId)
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(backtestId))
            .andExpect(jsonPath("$.strategyId").value("BOLLINGER_BANDS"))
            .andExpect(jsonPath("$.datasetName").value("sample-btc"))
            .andExpect(jsonPath("$.datasetChecksumSha256").value("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"))
            .andExpect(jsonPath("$.datasetSchemaVersion").value("ohlcv-v1"))
            .andExpect(jsonPath("$.datasetArchived").value(false))
            .andExpect(jsonPath("$.equityCurve[0].equity").value(1000))
            .andExpect(jsonPath("$.tradeSeries[0].returnPct").value(10.0000));
    }

    @Test
    void runBacktest_createsPendingRecord() throws Exception {
        RunBacktestRequest request = new RunBacktestRequest(
            "SMA_CROSSOVER",
            datasetId,
            "BTC/USDT",
            "1h",
            java.time.LocalDate.parse("2025-01-01"),
            java.time.LocalDate.parse("2025-01-02"),
            new BigDecimal("2000"),
            10,
            3
        );

        mockMvc.perform(post("/api/backtests/run")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void runBacktest_rejectsInvalidDateRange() throws Exception {
        RunBacktestRequest request = new RunBacktestRequest(
            "BOLLINGER_BANDS",
            datasetId,
            "BTC/USDT",
            "1h",
            java.time.LocalDate.parse("2025-01-02"),
            java.time.LocalDate.parse("2025-01-01"),
            new BigDecimal("2000"),
            10,
            3
        );

        mockMvc.perform(post("/api/backtests/run")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnprocessableContent());
    }

    @Test
    void listAlgorithms_andDatasets() throws Exception {
        mockMvc.perform(get("/api/backtests/algorithms")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("BUY_AND_HOLD"))
            .andExpect(jsonPath("$[1].id").value("DUAL_MOMENTUM_ROTATION"))
            .andExpect(jsonPath("$[1].selectionMode").value("DATASET_UNIVERSE"));

        mockMvc.perform(get("/api/backtests/datasets")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("sample-btc"))
            .andExpect(jsonPath("$[0].checksumSha256").isString())
            .andExpect(jsonPath("$[0].schemaVersion").value("ohlcv-v1"))
            .andExpect(jsonPath("$[0].archived").value(false))
            .andExpect(jsonPath("$[0].usageCount").value(greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$[0].retentionStatus").value("ACTIVE"));

        mockMvc.perform(get("/api/backtests/datasets/retention-report")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalDatasets").value(1))
            .andExpect(jsonPath("$.activeDatasets").value(1))
            .andExpect(jsonPath("$.referencedDatasetCount").value(1));
    }

    @Test
    void replayBacktest_createsPendingRecord() throws Exception {
        mockMvc.perform(post("/api/backtests/{backtestId}/replay", backtestId)
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void compareBacktests_returnsComparisonItems() throws Exception {
        mockMvc.perform(get("/api/backtests/compare")
                .param("ids", String.valueOf(backtestId))
                .param("ids", String.valueOf(comparisonBacktestId))
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.baselineBacktestId").value(backtestId))
            .andExpect(jsonPath("$.items", hasSize(2)))
            .andExpect(jsonPath("$.items[0].id").value(backtestId))
            .andExpect(jsonPath("$.items[1].id").value(comparisonBacktestId))
            .andExpect(jsonPath("$.items[0].datasetChecksumSha256").value("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"))
            .andExpect(jsonPath("$.items[0].datasetSchemaVersion").value("ohlcv-v1"))
            .andExpect(jsonPath("$.items[1].totalReturnDeltaPercent").exists());
    }

    @Test
    void downloadDataset_returnsCsvWithMetadataHeaders() throws Exception {
        mockMvc.perform(get("/api/backtests/datasets/{datasetId}/download", datasetId)
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(header().exists("X-Dataset-Checksum-Sha256"))
            .andExpect(header().string("X-Dataset-Schema-Version", "ohlcv-v1"))
            .andExpect(content().string(containsString("timestamp,symbol,open,high,low,close,volume")));
    }

    @Test
    void archiveAndRestoreDataset_updatesLifecycleMetadata() throws Exception {
        mockMvc.perform(post("/api/backtests/datasets/{datasetId}/archive", datasetId)
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Superseded by cleaned upload\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.archived").value(true))
            .andExpect(jsonPath("$.archiveReason").value("Superseded by cleaned upload"))
            .andExpect(jsonPath("$.archivedAt", notNullValue()))
            .andExpect(jsonPath("$.retentionStatus").value("ARCHIVED"));

        mockMvc.perform(post("/api/backtests/datasets/{datasetId}/restore", datasetId)
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.archived").value(false))
            .andExpect(jsonPath("$.archiveReason").isEmpty())
            .andExpect(jsonPath("$.retentionStatus").value("ACTIVE"));
    }

    @Test
    void runBacktest_rejectsArchivedDataset() throws Exception {
        BacktestDataset dataset = backtestDatasetRepository.findById(datasetId).orElseThrow();
        dataset.setArchived(Boolean.TRUE);
        dataset.setArchivedAt(LocalDateTime.now());
        dataset.setArchiveReason("Retired from active catalog");
        backtestDatasetRepository.save(dataset);

        RunBacktestRequest request = new RunBacktestRequest(
            "SMA_CROSSOVER",
            datasetId,
            "BTC/USDT",
            "1h",
            java.time.LocalDate.parse("2025-01-01"),
            java.time.LocalDate.parse("2025-01-02"),
            new BigDecimal("2000"),
            10,
            3
        );

        mockMvc.perform(post("/api/backtests/run")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnprocessableContent())
            .andExpect(jsonPath("$.message").value(containsString("Archived datasets cannot be used for new backtests")));
    }
}
