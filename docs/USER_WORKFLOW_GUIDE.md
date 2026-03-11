# User Workflow Guide

Last updated: March 11, 2026

## 1. Purpose

This guide explains how to use the dashboard safely for:

1. local backtests
2. data-only broker ingest checks
3. forward testing
4. paper trading
5. live mode monitoring

The platform is research-first and safety-first. Default behavior is `test`/`paper`.

## 2. Safety Model (Read First)

- `test`: local and simulated research workflows
- `paper`: simulated order lifecycle, no real money
- `live`: real exchange connectivity context; use carefully

Important:

- Do not assume live mode means live order execution is enabled.
- Keep strategies stopped when doing data-only validation.
- Use paper workflows before any live consideration.

## 3. Main Pages and What They Are For

- `Dashboard`: quick health/status overview
- `Strategies`: start/stop/configure strategy behavior
- `Backtest`: upload dataset and run historical simulation
- `Trades`: inspect and export execution history
- `Risk`: configure limits and circuit-breaker override (paper/test safeguards)
- `Settings`: environment preferences, exchange connection checks, and system utilities

## 4. Workflow Matrix (Use This to Avoid Mix-Ups)

| Workflow | Environment | Main Page | What It Does | What It Must Not Do |
|---|---|---|---|---|
| Local Backtest Trigger | `test` | `Backtest` | Runs historical simulation from uploaded CSV dataset | Does not place live orders |
| Pure Data Ingest (Broker) | `live` (read/check only) | `Settings` -> `Exchange` | Validates connection, balance sync, open orders readout | Do not start strategies |
| Forward Test | `test` | `Strategies` + `Trades` + `Risk` | Runs strategy logic forward under safe constraints | Do not switch to live for experimentation |
| Paper Trading | `test`/paper path | `Dashboard` + paper state + `Strategies` | Simulated order lifecycle and paper account effects | Not real PnL |
| Live Trading Mode | `live` | `Dashboard`/`Settings` | Live context monitoring and exchange-facing visibility | Never assume profitability or safety without verification gates |

## 5. Step-by-Step Workflows

### A) Local Backtest Trigger

1. Open `Backtest`.
2. In `Dataset Upload`, choose a CSV and upload it.
3. Click `Run New Backtest`.
4. Set algorithm, dataset, date range, fees, and slippage.
5. Run and review:
   - validation status
   - Sharpe/profit factor/drawdown
   - assumptions used

Example:

- Algorithm: `BOLLINGER_BANDS`
- Symbol: `BTC/USDT`
- Timeframe: `1h`
- Initial balance: `1000`
- Fees: `10 bps`
- Slippage: `3 bps`

### B) Pure Data Ingest From Broker (No Trading)

1. Open `Settings` -> `Exchange`.
2. Run `Test Connection`.
3. Use `Refresh` to confirm current balances and open orders visibility.
4. Keep all strategies stopped in `Strategies`.

Example outcome:

- Connected = `Yes`
- Balance sync timestamp updates
- Open orders list loads
- No strategy is running

### C) Forward Test (Safe Strategy Behavior Check)

1. Stay in `test` mode.
2. Open `Strategies` and configure one strategy.
3. Start it and monitor:
   - `Trades` for behavior
   - `Risk` for drawdown/loss/correlation limits
4. Stop when test objective is reached.

Example objective:

- Run one strategy for 24h equivalent forward window
- Verify no circuit breaker events
- Confirm trade count and execution quality are expected

### D) Paper Trading

1. Keep environment conservative (`test`/paper workflow).
2. Use strategy controls and watch paper state metrics on dashboard.
3. Verify order lifecycle behavior (new/filled/cancelled trends).
4. Export trade history for review.

### E) Live Mode Monitoring

1. Switch to `live` only when intentionally checking live-connected context.
2. Re-check risk posture before any high-impact action.
3. Use live mode for monitoring unless you have explicit, verified live execution controls.

## 6. Practical Examples

### Example 1: Backtest Before Forward Test

1. Backtest strategy variant with realistic fees/slippage.
2. If drawdown and profit-factor are acceptable, run forward test in `test`.
3. Compare behavior drift between backtest and forward period.

### Example 2: Data-Only Broker Validation Day

1. Do not start any strategies.
2. Validate exchange connection + refresh balance/open orders every hour.
3. Record connection stability and sync latency.

### Example 3: Paper Soak Test

1. Run selected strategy in paper mode for multiple sessions.
2. Track circuit-breaker events and risk-limit near misses.
3. Use trade export to produce a review report.

## 7. Common Mistakes to Avoid

- Running strategy while intending data-only ingest checks.
- Treating paper/backtest performance as guaranteed live performance.
- Skipping fees/slippage assumptions in backtests.
- Switching to live mode without clear intent and checklist.
- Overriding circuit breaker without a documented reason.

## 8. Daily Operator Checklist

1. Confirm active mode (`test` or `live`) before actions.
2. Confirm whether today is `backtest`, `data-only`, `forward`, or `paper` session.
3. Verify risk limits and circuit-breaker status.
4. Perform only actions matching the selected workflow.
5. Export/log results and observations.
