# Phase 1 Legacy Data Flow Audit

This document completes `FEATURE_DEVELOPMENT_PLAN.md` task `1A.1 Audit the current data flow and bottlenecks`.

It documents the current source of truth for historical candles, every relevant read or write path around the legacy CSV-backed store, and a reproducible performance baseline for the current implementation before the relational candle-store work begins.

Reproduce the benchmark:

```powershell
cd AlgotradingBot
.\gradlew.bat legacyMarketDataFlowAudit --no-daemon
```

The Gradle task writes a local markdown report to `AlgotradingBot/build/reports/legacy-market-data-flow-audit/report.md`.

## Current Source Of Truth

The backend currently treats whole CSV blobs as the authoritative candle payload:

- `backtest_datasets.csv_data` stores the full uploaded or imported candle payload for every persisted dataset.
- `market_data_import_jobs.staged_csv_data` stores the in-progress CSV accumulation while a provider import job is running.
- `HistoricalDataCsvParser` is the canonical parser used to convert those bytes into `OHLCVData` objects.
- `BacktestDatasetCandleCache` is a JVM-local checksum-keyed cache that avoids repeated reparsing only after the first full parse has already happened in that process.

There is no normalized candle table yet. The same bytes are reparsed in multiple backend flows, and the cache is whole-dataset only rather than range-aware or timeframe-aware.

## End-To-End Path Inventory

### Write Paths

| Flow | Entry point | Current ownership | Storage behavior | Immediate bottleneck |
| --- | --- | --- | --- | --- |
| Manual dataset upload | `POST /api/backtests/datasets/upload` -> `BacktestManagementController.uploadDataset` | `BacktestDatasetCatalogService.uploadDataset` -> `BacktestDatasetStorageService.storeUploadedDataset` | Reads all multipart bytes into memory, reparses the full CSV to derive row count, symbols, start/end, checksum, then persists the same full byte array into `backtest_datasets.csv_data` | Whole-file read and whole-file parse happen before the dataset is even saved |
| Provider import staging | `POST /api/market-data/jobs` queues work, then `MarketDataImportExecutionService.runWorkSlice` processes it async | `MarketDataCsvSupport.appendRows` plus `MarketDataImportExecutionService` | Every fetched chunk is appended by rebuilding the entire CSV string and rewriting `market_data_import_jobs.staged_csv_data` | Repeated byte copying grows with every chunk and becomes expensive before the final dataset is even published |
| Provider import completion | `MarketDataImportExecutionService.completeJob` | `BacktestDatasetCatalogService.importDataset` -> `BacktestDatasetStorageService.storeImportedDataset` | The final staged CSV bytes are reparsed again for dataset metadata, then persisted as another full blob in `backtest_datasets.csv_data` | The pipeline pays for chunk accumulation and then pays again for a full parse on completion |

### Read Paths

| Flow | Entry point | Current ownership | Data access pattern | User-facing impact |
| --- | --- | --- | --- | --- |
| Dataset catalog list | `GET /api/backtests/datasets` | `BacktestDatasetLifecycleService.listDatasets` | Reads dataset metadata only, no CSV hydration | Usually fast; not dataset-size sensitive beyond table growth |
| Dataset download | `GET /api/backtests/datasets/{id}/download` | `BacktestDatasetStorageService.downloadDataset` | Reads and returns the full `csv_data` blob unchanged | Service time is small, but payload size scales directly with dataset size and can stall the UI on large downloads |
| Backtest execution warm-up | `BacktestManagementService` -> `BacktestExecutionService.executeAsync` | `BacktestDatasetStorageService.getDataset` -> `BacktestDatasetCandleCache.getOrParse` -> `HistoricalDataCsvParser.parse` -> in-memory date filter -> symbol scope -> `MarketDataResampler.resample` | Loads the full dataset entity, parses the full CSV on cache miss, then filters in memory and resamples after full hydration | Startup time and heap cost scale with the whole dataset, not with the requested date window or symbol window |
| Completed backtest detail | `GET /api/backtests/{id}` -> `BacktestResultQueryService.getDetails` | `BacktestTelemetryService.buildTelemetry` | Loads the dataset again, parses the full CSV on cache miss, filters by date in memory, sorts it, then builds telemetry, indicators, and action markers in memory | This is the dominant slow API path for completed runs and directly affects chart-first review responsiveness |
| Operational metrics | `OperationalWorkloadMetricsBinder` | Reads cache entry count and in-flight counters only | No blob access | Cheap, but only exposes cache size rather than parse or scan cost |

## Flow Notes And Code-Level Findings

1. `BacktestDatasetStorageService` parses the full CSV on every upload and import completion purely to derive metadata such as row count, symbols, and data range. The same bytes are then stored again as `csv_data`.
2. `MarketDataCsvSupport.appendRows` appends by reconstructing the entire CSV string for every chunk. This makes import staging progressively slower as `staged_csv_data` grows.
3. `BacktestDatasetCandleCache` is all-or-nothing. It caches a parsed dataset only after one complete parse, keeps the whole candle list in memory, and does not support partial-window or symbol-scoped reuse.
4. `BacktestExecutionService` still starts from the fully parsed dataset even if a backtest only needs one symbol and a smaller date window.
5. `BacktestTelemetryService` rebuilds telemetry from the raw dataset bytes instead of a range query. It filters by time after hydration and then builds indicators and markers in memory. This is the clearest current backend source of slow completed-run page loads.
6. `BacktestTelemetryService` does not resample raw candles to the run timeframe before reconstruction. Even when the simulator executed on a coarser timeframe, completed detail telemetry still pays the underlying raw-dataset scan cost.

## Baseline Metrics

The benchmark used the existing `sample-btc-eth-data.csv` resource as the base dataset and generated larger synthetic datasets by repeating the same candle structure across non-overlapping time windows. Results are machine-specific, but they are directionally useful because they exercise the real parser, cache, upload/import service, telemetry service, and CSV append helper.

| Scale | Payload | Rows | Parse ms | Parse heap MB | Upload/import ms | Download ms | Cache miss ms | Cache hit ms | Warm-up cold ms | Warm-up warm ms | Warm-up rows | Telemetry cold ms | Telemetry warm ms | Telemetry points | Markers | Indicator points | Staged append ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| small | 94.0 KB | 1,488 | 6.75 | 2.93 | 10.30 | 0.62 | 29.64 | 0.00 | 17.57 | 1.83 | 744 | 133.95 | 84.10 | 744 | 46 | 5,208 | 6.90 |
| medium | 2.29 MB | 37,200 | 76.27 | 33.30 | 81.19 | 0.15 | 55.03 | 0.00 | 111.35 | 28.04 | 18,600 | 1,127.31 | 900.43 | 18,600 | 46 | 130,200 | 80.05 |
| large | 18.36 MB | 297,600 | 430.12 | 187.97 | 502.93 | 0.08 | 435.84 | 0.01 | 592.63 | 117.14 | 148,800 | 7,134.32 | 6,598.81 | 148,800 | 46 | 1,041,600 | 3,992.76 |

Interpretation:

- Parse cost rises roughly with payload size and quickly becomes a visible warm-up penalty on large datasets.
- Upload/import is already paying half a second of synchronous parse time at the large edge before persistence.
- Cache hits are excellent, but only inside the same JVM and only after a full parse and full-memory retention have already happened.
- Warm completed-detail telemetry is still expensive because indicator and telemetry construction remain whole-window in-memory work even after the parse is cached.
- Import staging becomes especially costly because the accumulated CSV is rewritten repeatedly; the large synthetic case spent about four seconds just rebuilding staged bytes.

## Slow Endpoint And Workflow Classification

### Storage

- Whole CSV blobs are authoritative in both `backtest_datasets` and `market_data_import_jobs`.
- The same logical candle set exists as bytes, as parsed `OHLCVData` objects, and often again as filtered or resampled lists.
- Large payloads create avoidable PostgreSQL row bloat and application heap pressure before any query optimization can help.

### Query

- Execution and telemetry are not query-driven; they hydrate full blobs and filter in memory.
- The system cannot ask for a specific symbol, timeframe, or date range from storage.
- There is no durable provenance path from a returned candle back to a specific import segment or overlap policy, because storage is one opaque CSV blob per dataset.

### Serialization

- Upload, import completion, and download all move full CSV byte arrays around as a unit.
- Import staging pays repeated serialization cost as `staged_csv_data` grows.
- Completed detail responses include heavy telemetry arrays that are expensive to reconstruct before they are serialized to JSON.

### Caching

- `BacktestDatasetCandleCache` prevents repeated reparses only in the current JVM and only after the first full parse.
- The cache has no partial invalidation, no range addressing, no cross-process reuse, and no explicit capacity or eviction policy.
- Cache behavior hides some repeated parse cost in warm local sessions but does not solve the underlying storage model.

### UI Impact

- The route most affected today is completed Backtest detail, because `BacktestResultQueryService.getDetails` always rebuilds telemetry through `BacktestTelemetryService`.
- Dataset downloads are network-heavy even when the service method is fast.
- Upload/import completion delays are operator-visible because the write path does synchronous parsing before the new dataset appears as ready.

## Why This Blocks The Next Phase

The current model is workable for small datasets, but it creates compounding penalties as soon as dataset size grows:

- storage cost grows because candle bytes are duplicated across staging, persisted datasets, and heap-resident parsed lists
- query cost grows because the backend cannot ask storage for only the slice it needs
- UI latency grows because completed detail reconstruction scales with raw dataset size instead of requested review scope
- reproducibility is weaker than it needs to be because provenance is attached to the blob, not to individual series segments or returned candles

This is the technical baseline that Phase `1A.2` needs to replace with a normalized candle store while preserving dataset provenance and replay safety.
