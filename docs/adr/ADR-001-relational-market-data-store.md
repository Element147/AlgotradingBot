# ADR-001: Relational Market-Data Store

- Date: 2026-03-26
- Status: Accepted for implementation
- Deciders: architecture, backend, and data-model owners for Phase 1
- Related: `FEATURE_DEVELOPMENT_PLAN.md` task `1A.2`, `docs/PHASE_1_LEGACY_DATA_FLOW_AUDIT.md`, `ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/ACCEPTANCE_CRITERIA.md`

## Context

The current system persists historical candles as whole CSV blobs in `backtest_datasets.csv_data` and stages provider-import progress as whole CSV blobs in `market_data_import_jobs.staged_csv_data`. The audit completed in `docs/PHASE_1_LEGACY_DATA_FLOW_AUDIT.md` showed that this model becomes expensive as datasets grow:

- uploads and import completion both reparse the full CSV synchronously
- import staging repeatedly rewrites the growing staged CSV payload
- execution warm-up hydrates a full dataset before filtering by date or symbol
- completed telemetry rebuilds from raw dataset bytes and scales with raw dataset size

The next backend phase needs a relational candle store that preserves the existing dataset catalog as provenance metadata while moving execution and telemetry reads onto queryable tables.

This decision must stay aligned with:

- local-first delivery and small, reversible increments in `docs/ROADMAP.md`
- conservative safety and reproducibility rules in `TRADING_GUARDRAILS.md`
- existing backend ownership boundaries in `ARCHITECTURE.md`
- verification and documentation expectations in `docs/ACCEPTANCE_CRITERIA.md`

## Decision

Adopt a normalized relational market-data model with three core tables:

1. `market_data_series`
2. `market_data_candle_segments`
3. `market_data_candles`

`backtest_datasets` remains the catalog and provenance entrypoint used by uploads, imports, replay, retention reporting, and operator-facing dataset inventory. Candle execution reads move to `market_data_candles`, and provenance for those reads flows through `market_data_candle_segments`.

`market_data_aggregates` or database materialized views are explicitly deferred until benchmarking proves that the primary execution query shapes need them.

## Table Responsibilities

### `market_data_series`

One logical instrument stream per provider or broker or exchange or symbol or asset class identity.

Required columns:

- `id` bigint primary key
- `provider_id` varchar(40) not null
- `broker_id` varchar(60) null
- `exchange_id` varchar(60) null
- `venue_type` varchar(30) not null
- `asset_class` varchar(30) not null
- `instrument_type` varchar(30) not null
- `symbol_normalized` varchar(80) not null
- `symbol_display` varchar(80) not null
- `base_asset` varchar(30) null
- `quote_asset` varchar(30) null
- `currency_code` varchar(12) null
- `country_code` varchar(8) null
- `timezone_name` varchar(64) not null
- `session_template` varchar(40) null
- `provider_metadata_json` text null
- `created_at` timestamp not null
- `updated_at` timestamp not null

Design intent:

- `symbol_normalized` is the query key used by runtime services.
- `symbol_display` preserves the provider-facing representation shown to operators.
- `asset_class` covers at least `STOCK`, `ETF`, `CRYPTO_SPOT`, and later futures-safe values without schema rewrites.
- `instrument_type`, `base_asset`, `quote_asset`, `currency_code`, and `provider_metadata_json` give room for broker-specific detail without another table explosion.

### `market_data_candle_segments`

Immutable provenance and coverage metadata for one imported or uploaded candle batch for one series and one timeframe.

Required columns:

- `id` bigint primary key
- `dataset_id` bigint not null references `backtest_datasets(id)`
- `import_job_id` bigint null references `market_data_import_jobs(id)`
- `series_id` bigint not null references `market_data_series(id)`
- `timeframe` varchar(10) not null
- `source_type` varchar(30) not null
- `coverage_start` timestamp not null
- `coverage_end` timestamp not null
- `row_count` integer not null
- `checksum_sha256` char(64) not null
- `schema_version` varchar(32) not null
- `segment_status` varchar(20) not null
- `storage_encoding` varchar(20) not null
- `archived` boolean not null
- `archived_at` timestamp null
- `archive_reason` varchar(255) null
- `provider_batch_reference` varchar(120) null
- `notes` varchar(500) null
- `created_at` timestamp not null

Design intent:

- Segment rows are immutable evidence for replay and reconciliation.
- `dataset_id` keeps the existing dataset catalog authoritative for provenance.
- Later overlap or dedup policy can mark segments `ACTIVE`, `SUPERSEDED`, `DUPLICATE`, or `ARCHIVED` without rewriting dataset history.
- `storage_encoding` supports future cold-storage compression decisions without changing the logical model.

### `market_data_candles`

Authoritative OHLCV rows keyed by `series_id`, `timeframe`, and `bucket_start`, with every active row pointing back to the segment that supplied it.

Required columns:

- `series_id` bigint not null references `market_data_series(id)`
- `timeframe` varchar(10) not null
- `bucket_start` timestamp not null
- `segment_id` bigint not null references `market_data_candle_segments(id)`
- `open_price` numeric(20, 8) not null
- `high_price` numeric(20, 8) not null
- `low_price` numeric(20, 8) not null
- `close_price` numeric(20, 8) not null
- `volume` numeric(28, 8) not null
- `trade_count` bigint null
- `vwap` numeric(20, 8) null
- `created_at` timestamp not null

Primary key and uniqueness:

- Primary key: `(series_id, timeframe, bucket_start)`
- One authoritative row exists per series or timeframe or bucket.
- Provenance is carried by `segment_id`.

Design intent:

- Runtime reads use this table directly.
- Exact timeframe queries remain first-class because `timeframe` is part of the key, not an inferred attribute.
- Segment linkage means later overlap resolution can replace the authoritative row while keeping the winning source visible.

## Supported Query Dimensions

The design must support indexed lookup by:

- broker
- exchange
- provider
- asset class
- symbol
- base asset
- quote asset
- timeframe
- date range

The first-class columns that satisfy those filters live in `market_data_series`, with `timeframe` and `bucket_start` on `market_data_candles`.

## Identity Rules

The logical identity for a series is:

`provider_id + broker_id + exchange_id + asset_class + instrument_type + symbol_normalized + base_asset + quote_asset + currency_code`

Implementation rule:

- normalize missing optional dimensions to a stable empty value in the unique constraint or generated identity key
- preserve the operator-facing symbol in `symbol_display`
- do not collapse two providers into one series unless the upstream normalization policy explicitly says they are interchangeable

This keeps crypto spot pairs, stock tickers, ETFs, and future broker-specific instruments queryable without schema rewrites.

## Index And Partition Strategy

### `market_data_series`

Required indexes:

- unique identity index on the normalized series identity
- lookup index on `(provider_id, exchange_id, symbol_normalized)`
- lookup index on `(asset_class, base_asset, quote_asset)`

### `market_data_candle_segments`

Required indexes:

- `(series_id, timeframe, coverage_start, coverage_end)`
- `(dataset_id)`
- `(import_job_id)`
- `(segment_status, archived)`

Purpose:

- fast coverage checks
- provenance tracing from dataset to segments
- overlap and reconciliation scans

### `market_data_candles`

Required indexes:

- primary key `(series_id, timeframe, bucket_start)`
- supporting scan index `(timeframe, bucket_start)`
- optional covering index for venue-heavy multi-series reads if benchmarks justify it later

Partitioning strategy:

- logical partition boundary is monthly by `bucket_start`
- PostgreSQL production runtime should use monthly range partitions on `bucket_start`
- H2 test profile can remain unpartitioned behind the same logical schema, because partitioning is an operational optimization, not a correctness rule

Rationale:

- the dominant hot path is a time-range scan by one series and one timeframe
- monthly partitions give bounded pruneable reads without making small local installs operationally heavy
- timeframe stays in the primary key so exact queries stay deterministic even when the same series has multiple granularities

## Expected Query Shapes

### Execution hot path

Used by backtests and later execution workspaces:

```sql
select bucket_start, open_price, high_price, low_price, close_price, volume, segment_id
from market_data_candles
where series_id = :seriesId
  and timeframe = :timeframe
  and bucket_start between :start and :end
order by bucket_start asc;
```

### Coverage and overlap inspection

Used by import reconciliation and best-available routing:

```sql
select id, dataset_id, timeframe, coverage_start, coverage_end, row_count, segment_status
from market_data_candle_segments
where series_id = :seriesId
  and timeframe = :timeframe
  and coverage_start <= :requestedEnd
  and coverage_end >= :requestedStart
order by coverage_start asc;
```

### Operator or catalog lookup

Used by search and future import workflows:

```sql
select id, provider_id, exchange_id, asset_class, symbol_normalized, base_asset, quote_asset
from market_data_series
where provider_id = :providerId
  and asset_class = :assetClass
  and symbol_normalized = :symbol;
```

## Archival Strategy

The archival boundary is segment-first, not dataset-first:

- `backtest_datasets` stays as immutable provenance catalog metadata
- `market_data_candle_segments` carries archival state for each imported or uploaded batch
- `market_data_candles` holds the active authoritative rows needed for hot execution reads

Future archival sequence:

1. mark old or duplicate segments as archived or superseded
2. detach or export old candle partitions for cold storage only after replay and reconciliation guarantees are preserved
3. keep enough active partitions online for the documented research horizon

This allows storage reduction without losing the dataset-level audit trail.

## Consequences

Positive:

- execution and telemetry can move from whole-blob parsing to range queries
- provenance remains visible because every active candle row points back to a segment, and every segment points back to a dataset
- stocks, ETFs, crypto spot pairs, and future broker-specific metadata fit without schema rewrites
- the later overlap or dedup policy can operate on segment metadata instead of opaque CSV files

Tradeoffs:

- import and migration logic becomes more complex because series resolution and segment creation are explicit
- range partitioning adds operational work in PostgreSQL even though correctness still works without it in H2
- exact replay and download compatibility need a later cutover plan so legacy CSV behaviors remain honest during migration

## Explicit Non-Decisions

This ADR does not finalize:

- the overlap precedence policy between exact raw rows, finer rollups, and coarser fallbacks
- whether materialized aggregate tables are needed
- the exact migration cutover sequence for legacy blob removal

Those decisions belong to:

- `1A.3 Define overlap merge, deduplication, and compression policy`
- `1B.* Data migration plan`

## Follow-On Implementation Rules

When this ADR is implemented:

- `BacktestDatasetStorageService` should keep dataset-catalog metadata ownership, but candle persistence must route to relational tables
- `BacktestExecutionService` and `BacktestTelemetryService` must read candles through a query service, not `HistoricalDataCsvParser`
- DTO boundaries stay unchanged at the controller layer
- `BigDecimal` remains mandatory for all price and volume values
- PostgreSQL runtime remains Liquibase-first and H2 test behavior must stay compatible
