# ADR-002: Market-Data Overlap, Deduplication, And Retention Policy

- Date: 2026-03-26
- Status: Accepted for implementation
- Deciders: architecture and data-model owners for Phase 1
- Related: `FEATURE_DEVELOPMENT_PLAN.md` task `1A.3`, `docs/adr/ADR-001-relational-market-data-store.md`, `docs/PHASE_1_LEGACY_DATA_FLOW_AUDIT.md`

## Context

The relational model in `ADR-001` defines where candles, segments, and series live, but it does not by itself answer the most important merge question: what should happen when overlapping imports arrive at different timeframes or when two segments claim the same candle bucket.

The plan requires all of the following:

- exact timeframe queries must remain possible
- execution must have a deterministic best-available path
- duplicates and overlaps must be deduplicated or superseded without silent data loss
- cold-storage reduction must not break replay reproducibility

## Decision

Adopt an explicit segment-resolution policy with three resolution tiers:

1. `EXACT_RAW`
2. `DERIVED_ROLLUP`
3. `COARSER_FALLBACK`

And adopt this precedence ladder for query resolution:

`EXACT_RAW > DERIVED_ROLLUP > COARSER_FALLBACK`

Within the same resolution tier, the winning segment is selected by:

1. `segment_status = ACTIVE`
2. higher `source_priority`
3. newer segment creation timestamp
4. higher segment id as the final deterministic tie-breaker

This policy is deterministic, queryable, and auditable.

## Query Modes

### `EXACT_ONLY`

Used when the caller requires the requested timeframe exactly.

Behavior:

- return only `EXACT_RAW` rows at the requested timeframe
- if coverage is incomplete, surface an explicit gap rather than silently rolling up or falling back

### `BEST_AVAILABLE`

Used when the caller wants the highest-quality answer without requesting a specific derivation path.

Behavior:

- prefer `EXACT_RAW` at the requested timeframe
- if exact rows are unavailable for some or all requested buckets, use `DERIVED_ROLLUP` from a finer authoritative timeframe
- use `COARSER_FALLBACK` only when explicitly enabled for the caller and only with a visible provenance flag

### `EXACT_THEN_ROLLUP`

Used when the caller allows finer-to-coarser derivation but not coarser fallback.

Behavior:

- prefer `EXACT_RAW`
- fill only uncovered buckets from `DERIVED_ROLLUP`
- leave remaining gaps explicit

## Overlap Rules

### Same timeframe, same bucket, identical OHLCV values

Treat the new segment as a duplicate.

Implementation rule:

- keep the existing authoritative candle row unchanged
- mark the new segment `DUPLICATE`
- set `duplicate_of_segment_id` to the winning segment

### Same timeframe, same bucket, different OHLCV values

Treat the situation as a supersession event within the same series identity.

Implementation rule:

- choose the winner using the precedence ladder plus the tie-break rules above
- keep the losing segment as immutable evidence with `segment_status = SUPERSEDED`
- set `supersedes_segment_id` on the winner or the appropriate reverse reference during write processing
- emit a reconciliation or anomaly record so operators can see that a conflict occurred

Because provider identity is part of `market_data_series`, two providers do not silently overwrite each other inside one series. Conflicts are only auto-resolved inside the same logical provider or broker or exchange series identity.

### Overlapping exact `1h` and finer `15m` imports

Rule:

- exact `1h` queries remain exact and return active `EXACT_RAW` `1h` rows when they exist
- exact `15m` queries remain exact and return active `EXACT_RAW` `15m` rows when they exist
- `DERIVED_ROLLUP` `1h` rows from `15m` may exist for best-available queries, but they never replace an active exact `1h` import

This preserves exact-timeframe queryability while still giving the engine a deterministic route when only finer candles exist.

## Rollup Policy

### Allowed direction

- finer to coarser only
- never coarser to finer

### Canonical rollup inputs

- only authoritative active rows may feed a derived rollup
- a rollup segment must record its lineage in `lineage_json`, including source timeframe, source segment ids, source coverage window, and rollup timestamp

### Rollup precedence

- a `DERIVED_ROLLUP` segment is always lower precedence than an active exact raw segment of the same timeframe
- a `DERIVED_ROLLUP` segment is always higher precedence than `COARSER_FALLBACK`

## Gap Handling

Gaps are explicit state, not silent empty sets.

Rules:

- if the chosen mode cannot satisfy a requested bucket, the query service reports the gap
- backtests may fail closed when required coverage is missing for the requested run window
- telemetry reconstruction may trim to the covered window, but only with explicit metadata about the missing interval

## Provenance Requirements

Every returned candle must be explainable back to the producing batch.

Required provenance path:

`market_data_candles.segment_id -> market_data_candle_segments.dataset_id -> backtest_datasets.id`

Required visible metadata on the winning segment:

- dataset id
- import job id when applicable
- resolution tier
- source priority
- coverage window
- checksum
- lineage manifest for rollups
- duplicate or supersession relationship when applicable

This is the mechanism that satisfies the plan requirement that segment metadata can explain which import batch produced every candle returned to the simulator.

## Compression And Retention Policy

### Hot data

- all active winning segments remain online and uncompressed in the primary candle tables
- exact raw segments feeding current research windows stay online

### Warm duplicate or superseded data

- duplicate or superseded segments may be compressed after reconciliation passes
- compression uses a deterministic artifact format such as gzip-compressed CSV or parquet plus a checksum manifest
- `compressed_artifact_uri`, `checksum_sha256`, `row_count`, and `lineage_json` remain in the segment row

### Cold archival

- archived segments may be detached from hot candle partitions only after their winning replacements are fully online
- replay remains reproducible because the dataset catalog row, segment manifest, checksums, and lineage remain durable even if the raw duplicate rows move to cold storage
- no active winning segment may be retired from hot storage unless a later migration explicitly proves a reversible replacement

## Compression Safety Rules

- compression never changes the winning authoritative candle row
- compression never removes dataset or segment metadata
- compressed artifacts must carry the original checksum or a checksum manifest that can be recomputed during reconciliation
- removal of duplicate hot rows is allowed only after the duplicate relationship is persisted durably

## Consequences

Positive:

- exact timeframe reads remain deterministic
- best-available routing becomes explicit instead of ad hoc
- duplicates and corrections can be retained as evidence without bloating hot execution tables forever
- later migration and reconciliation tools have a concrete policy to implement

Tradeoffs:

- import processing must classify rows and segments during write time
- rollup lineage storage adds metadata complexity
- query services must expose gap and provenance information instead of pretending incomplete data is complete

## Implementation Notes

This ADR requires the later schema and service work to include:

- segment fields for `resolution_tier`, `source_priority`, duplicate or supersession linkage, and lineage metadata
- query-service support for `EXACT_ONLY`, `BEST_AVAILABLE`, and `EXACT_THEN_ROLLUP`
- reconciliation reporting when conflicting exact rows disagree

It intentionally does not require a separate duplicate-row table unless implementation proves that segment-level metadata is insufficient.
