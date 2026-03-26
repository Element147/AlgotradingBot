# TRADING_GUARDRAILS.md

## Purpose

Repository-level safety rules for research, backtesting, paper trading, and any future live-readiness work.

These rules take precedence over convenience.

## Non-Negotiables

- No real-money trading by default.
- No profitability claims without reproducible evidence.
- No direct promotion of backtest/paper results as live outcomes.
- No weakening of environment separation, risk controls, or operator override safety.

## Environment Policy

Treat these as distinct modes:

- `test`: local development, synthetic/research workflows
- `paper`: simulated execution with no live order placement
- `live`: real credentials/connectivity context (must be explicit)

Required controls:

- Separate config and credentials by mode
- Clear UI/API mode visibility
- Safe default to `test`
- New/default strategy configs must start long/cash; short exposure is opt-in and must stay visible in configuration history
- Explicit confirmation before any `live` action
- Unsupported `live` reads or writes must fail explicitly with capability messaging instead of silently falling back to paper data
- Dev-only auth override (`ALGOTRADING_RELAXED_AUTH=true`) is local debugging only and must be removed before standard verification

## Risk Baseline Defaults

- Max risk per trade: `2%` of equity
- Max aggregate open risk: `6%`
- Max drawdown stop: `25%`
- Cash buffer target: `20-30%`
- No leverage by default

If any control is not fully automated yet, it remains a mandatory manual operating rule.

## Small-Account Action Policy

Conservative interpretation for small-account operation:

- Default bearish action: `SELL_TO_CASH` / flat exposure
- Paper/backtest direct short exposure: optional only when explicitly enabled and audited in strategy configuration
- Live direct short/margin/futures: not default behavior and still disabled in this repository

## Circuit Breaker and Kill-Switch Expectations

System should support:

- Strategy-level stop
- Account-level stop
- Environment-level kill switch
- Manual override with durable audit trail
- Clear UI state of triggered guardrails

## Validation Requirements Before Any Live Consideration

All should be reproducible:

- Versioned strategy parameters
- Versioned/identifiable datasets (checksum and schema metadata)
- Frozen audit methodology from `docs/STRATEGY_AUDIT_PROTOCOL.md`
- Fees and slippage included in analysis
- Requested timeframe honored through explicit aggregation or resampling; never label a run as `4h` or `1d` if it executed on finer raw candles
- Signal timing assumptions made explicit; if fills are not next-bar-open or another clearly documented model, the report must say so
- Out-of-sample or walk-forward validation
- Sufficient trade count for interpretation
- Paper-trading soak period with stable behavior
- Failure-mode testing (disconnects/restarts/stale data)
- Verified rollback path
- Replay path for prior backtest configuration and dataset

## Honest Reporting Standard

Every strategy report should state:

- data period and instruments
- dataset ID or name plus checksum or schema identity and requested timeframe
- fees/slippage assumptions
- in-sample vs out-of-sample split
- trade count, drawdown, Sharpe, profit factor, win rate
- known failure regimes and limitations

Never state or imply guaranteed returns.
