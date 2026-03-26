# Legacy Dataset Retirement Plan

This document defines the non-destructive sequence for retiring `backtest_datasets.csv_data` and `market_data_import_jobs.staged_csv_data` once the normalized market-data store is the authoritative runtime source.

## Current Posture

- `market_data_series`, `market_data_candle_segments`, and `market_data_candles` are the authoritative runtime source for backtest execution and telemetry.
- New uploads and completed provider imports hydrate the normalized store during ingestion.
- Startup recovery now backfills catalog datasets that still lack normalized segments before operators use them.
- `backtest_datasets.csv_data` is now a compatibility-only blob used only when normalized export is unavailable.
- `market_data_import_jobs.staged_csv_data` is a transient staging field and is cleared when an import finishes successfully.

## Removal Sequence

1. Keep startup backfill and reconciliation active until every catalog dataset has normalized segments and no runtime query relies on `LEGACY_CSV_COMPATIBILITY`.
2. Keep dataset download on `NORMALIZED_EXPORT` by default and watch for any remaining `X-Dataset-Download-Source: LEGACY_CSV_COMPATIBILITY` cases that still need operator review.
3. Run `.\gradlew.bat reconcileLegacyDatasets` against the full catalog and resolve every failed dataset before changing schema ownership.
4. Add an explicit operator report or migration check that proves `backtest_datasets.csv_data` is no longer needed for replay, download, or audit in the local catalog.
5. Only then mark `csv_data` and any remaining `staged_csv_data` paths as deprecated in Liquibase and service code.
6. In a later destructive change, drop the compatibility columns only after the repo has one more clean full verification pass plus updated docs confirming the new rollback boundary.

## Rollback Plan

- If reconciliation fails for any dataset, keep `csv_data` intact and keep that dataset on the compatibility path while the discrepancy is fixed.
- If normalized export cannot represent a dataset safely, keep download on `LEGACY_CSV_COMPATIBILITY` for that dataset instead of inventing a lossy export.
- If startup backfill or cutover logic regresses runtime behavior, revert to the previous application build while preserving the normalized tables and the legacy blobs, then rerun reconciliation before retrying cutover.
- Do not execute destructive Liquibase cleanup until the above rollback options are no longer required.
