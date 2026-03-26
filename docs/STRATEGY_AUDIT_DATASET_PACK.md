# Strategy Audit Dataset Pack

Research appendix for the frozen dataset bundle used by strategy-audit task `3A`. This document defines the representative dataset pack that later catalog reruns must use unless the methodology itself changes.

Use this together with `docs/STRATEGY_AUDIT_PROTOCOL.md`. The protocol defines how strategies are judged. This document defines which market samples are allowed in the current audit round.

## Purpose

Freeze one reproducible audit pack that covers both:

- liquid crypto-major research
- small-account-friendly equity or ETF research

This avoids cherry-picking one market family and keeps later strategy claims anchored to the same windows, costs, and holdout boundaries.

## Current Pack Summary

### Dataset A: Crypto Majors 15m Audit Anchor

- dataset ID: `#12`
- dataset name: `Binance BTC/USDT +2 15m 2024-03-12 to 2026-03-12`
- checksum: `b93c95da97c05f4edf4d706b80d33fcfab752f4f4d6f11f003fa3aca2fe2d326`
- schema identity: `ohlcv-v1`
- provider: `Binance`
- market: `Binance spot`
- timeframe coverage: `15m`
- symbols: `BTC/USDT`, `ETH/USDT`, `SOL/USDT`
- timezone posture: `UTC`
- date window: `2024-03-12` to `2026-03-12`
- frozen holdout split:
  - in-sample: `2024-03-12` to `2025-07-01`
  - out-of-sample: `2025-07-01` to `2026-03-13`

This is the verified catalog dataset already referenced from `PROJECT_STATUS.md`. It remains the crypto-major anchor for the current audit round.

### Dataset B: US ETF Daily Small-Account Audit Pack

- dataset name: `US ETF Daily Small-Account Audit Pack`
- dataset file: `docs/audit-datasets/us-etf-daily-small-account-pack-2024-03-12-to-2026-03-12.csv`
- manifest file: `docs/audit-datasets/us-etf-daily-small-account-pack-2024-03-12-to-2026-03-12.manifest.json`
- checksum: `edbceabab40fecde762158a542dc70678e8c315942e5e572f128e8d2c023fedc`
- schema identity: `ohlcv-v1`
- provider provenance: `Stooq daily history CSV`
- market: `US listed ETFs`
- session template: `US_EQUITIES`
- timezone posture: `America/New_York`
- timeframe coverage: `1d`
- symbols: `SPY`, `QQQ`, `VTI`, `VT`
- per-symbol venue metadata:
  - `SPY`: `NYSE Arca`
  - `QQQ`: `NASDAQ`
  - `VTI`: `NYSE Arca`
  - `VT`: `NYSE Arca`
- date window: `2024-03-12` to `2026-03-12`
- row count: `2008`
- frozen holdout split:
  - in-sample: `2024-03-12` to `2025-07-01`
  - out-of-sample: `2025-07-01` to `2026-03-12`

This file is a checked-in, parser-compatible `ohlcv-v1` CSV assembled from the repo-owned script `scripts/build-strategy-audit-equity-dataset.ps1`.

## Rebuild Procedure

The ETF pack can be rebuilt from source with:

```powershell
.\scripts\build-strategy-audit-equity-dataset.ps1 -Force
```

The script:

- downloads daily history for `SPY`, `QQQ`, `VTI`, and `VT`
- filters exactly `2024-03-12` through `2026-03-12`
- normalizes the rows to the repo `ohlcv-v1` CSV shape
- emits a manifest with checksum, venue notes, symbol list, row counts, and holdout windows

## Why This Equity Or ETF Pack Was Chosen

This repo's small-account research posture is conservative. The first equity-side audit pack therefore prefers broad, liquid ETFs over single-name small caps or margin-dependent short books.

The current symbols were selected because they are:

- liquid enough for realistic small-account research
- simple to explain as long or cash baselines
- broad-market oriented rather than thesis-specific single-name bets
- compatible with fractionality-aware brokerage research

## Audit Notes And Known Limits

These limits must be recorded in later audit writeups instead of ignored:

- U.S. equities do not trade `24/7`, so strategy logic must respect the `US_EQUITIES` session posture rather than crypto-style always-on assumptions.
- Frequent same-day stock trading is not the target here. Small-account workflows should remember the U.S. pattern-day-trader restriction around margin accounts.
- Bearish equity research defaults to `sell to cash`. If an audit later uses inverse ETFs such as `SH` or `PSQ`, it must say so explicitly and treat them as short proxies rather than as direct shorts.
- Broad ETFs reduce single-name event risk, but this pack is price-only `ohlcv-v1` data. Dividend-aware total-return analysis is still a separate concern.
- Crypto and ETF calendars differ. Cross-asset comparisons should focus on robustness and not pretend the venues have identical trading sessions.
- This pack is representative, not exhaustive. It is the minimum approved pack for current audit work, not the final long-term research universe.

## Relationship To The Current Provider Stack

The repo's authenticated import pipeline already supports stock and ETF ingestion through `Twelve Data`, `Finnhub`, and `Alpha Vantage`, while crypto imports use providers such as `Binance` and `Kraken`.

The current audit pack intentionally mixes:

- one verified catalog dataset already present in runtime state for crypto
- one checked-in, reproducible ETF CSV pack for small-account equity research

This lets the strategy audit move forward now without pretending that a keyed provider import already exists in every local environment.

## Change Control

Later tasks may add more datasets, but they should not silently replace these anchors.

If the audit pack changes, update:

- this document
- `docs/STRATEGY_AUDIT_PROTOCOL.md` if the methodology changes
- `PROJECT_STATUS.md` if the current strategy-audit posture changes
- `FEATURE_DEVELOPMENT_PLAN.md` if the plan record needs a new implementation note
