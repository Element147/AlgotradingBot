# Greenfield Strategy Implementation

Updated: March 11, 2026

## Purpose

This document describes what was actually implemented from `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`.

The blueprint remains the research and design reference.
This file is the runtime implementation reference for the current backend and frontend.

## Implemented Strategy Catalog

The backtest UI and backend now expose these strategies:

1. `BUY_AND_HOLD`
2. `DUAL_MOMENTUM_ROTATION`
3. `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`
4. `TREND_PULLBACK_CONTINUATION`
5. `REGIME_FILTERED_MEAN_REVERSION`
6. `TREND_FIRST_ADAPTIVE_ENSEMBLE`
7. `SMA_CROSSOVER`
8. `BOLLINGER_BANDS`

The last two remain available as legacy/simple baselines alongside the greenfield set.

## Execution Modes

Each strategy now declares a selection mode through backend metadata:

- `SINGLE_SYMBOL`
- `DATASET_UNIVERSE`

### Single-symbol strategies

- `BUY_AND_HOLD`
- `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`
- `TREND_PULLBACK_CONTINUATION`
- `REGIME_FILTERED_MEAN_REVERSION`
- `SMA_CROSSOVER`
- `BOLLINGER_BANDS`

These run on one symbol selected from the uploaded dataset.

### Dataset-universe strategies

- `DUAL_MOMENTUM_ROTATION`
- `TREND_FIRST_ADAPTIVE_ENSEMBLE`

These run across all symbols in the uploaded dataset.
The frontend now detects this and uses the dataset universe automatically instead of asking the user to pick one symbol.

## Current Action Model

The current implementation is conservative and research-safe:

- `LONG`
- `SELL_TO_CASH`
- `ROTATE_TO_ANOTHER_LONG`
- `HOLD`

Not implemented yet:

- true short selling
- margin-based shorting
- inverse ETF `SHORT_PROXY` routing
- leverage

That means the new strategies are implemented as `long/flat` or `long/rotate/cash` research strategies.

## Strategy Notes

### `DUAL_MOMENTUM_ROTATION`

Implementation choices:

- ranks symbols using weighted `63` and `126` bar returns
- applies an absolute momentum filter using `SMA(200)` or positive long return
- volatility-manages allocation
- rotates only when leadership changes

### `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`

Implementation choices:

- `EMA(200)` trend filter
- `55` bar breakout entry
- `20` bar breakdown exit
- `ATR(20)` stop influence
- volatility-managed allocation

### `TREND_PULLBACK_CONTINUATION`

Implementation choices:

- bullish regime requires `close > EMA(200)` and `EMA(50) > EMA(200)`
- pullback detection uses `RSI(5)` or `EMA(20)` touch
- continuation confirmation requires reclaim of `EMA(5)`
- exit uses trend failure and `ATR`-based protection

### `REGIME_FILTERED_MEAN_REVERSION`

Implementation choices:

- range filter uses low `ADX`
- oversold setup uses lower Bollinger band plus short RSI
- entry requires a snapback bar
- exit uses middle-band reversion, stop logic, or time stop

### `TREND_FIRST_ADAPTIVE_ENSEMBLE`

Implementation choices:

- chooses the strongest symbol from the dataset universe
- prefers trend logic when the regime is strong
- only uses the mean-reversion layer in range-like conditions
- can rotate between symbols, exit to cash, or hold

## Backtest Engine Changes That Support These Strategies

The greenfield strategy set required more than adding enum values.

The backend now supports:

- strategy metadata with execution mode
- per-strategy decision objects instead of simple global buy/sell switches
- position context in strategy evaluation
- dataset-universe timeline alignment
- one active position that can rotate between symbols

This is what allows `DUAL_MOMENTUM_ROTATION` and the ensemble to run honestly rather than pretending they are single-symbol systems.

## Frontend Behavior

The `/backtest` page now behaves differently depending on the selected strategy:

- for `SINGLE_SYMBOL` strategies:
  - symbol choices come from the selected dataset
- for `DATASET_UNIVERSE` strategies:
  - the symbol field is replaced by an informational message
  - the run automatically uses every symbol listed in the dataset metadata

This keeps the UI aligned with the actual algorithm behavior.

## Important Constraints

These constraints are intentional and should not be hidden:

- Dataset-universe strategies assume aligned timestamps across symbols.
- The current backtest engine supports one active position at a time.
- Per-strategy parameter editing is not yet exposed in the UI.
- Charts in the frontend still derive from summary result data rather than persisted raw equity/trade series.
- Backtest results remain research artifacts, not proof of profitability.

## Next Recommended Improvements

1. Persist raw trade logs and equity curves per backtest run.
2. Add typed per-strategy parameter sets and versioned defaults.
3. Add benchmark comparison and strategy-to-strategy comparison UI.
4. Add instrument metadata and order-constraint modeling before any short-proxy or stock-specific inverse ETF research.
