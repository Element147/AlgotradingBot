# User Workflow Guide

## Purpose

This guide describes how to use the product as it works now. It focuses on current operator workflows, not on how the software was built.

## Read This First

- `test` is the default mode.
- Paper workflows are simulated.
- Live-connected context is explicit and should be treated as monitoring-first unless a separately verified live capability exists.
- Backtest and paper outcomes are research evidence, not guaranteed performance.

## Main Pages

- `Dashboard`: overall system health, environment posture, paper-trading state, and alerts
- `Strategies`: configure, start, stop, and review strategy behavior
- `Backtest`: manage datasets and run historical experiments
- `Market Data`: import datasets from supported providers and monitor job progress
- `Trades`: inspect recent activity and review trade details
- `Risk`: review limits, alerts, and circuit-breaker state
- `Settings`: manage exchange profiles, provider credentials, audit review, and system utilities

## Core Workflows

### Backtest Research

1. Open `Backtest`.
2. Upload a dataset or use one imported through `Market Data`.
3. Configure strategy, symbol or dataset mode, date range, fees, and slippage.
4. Run the backtest and monitor progress.
5. Review metrics, equity curve, trade series, provenance, and comparison or replay options.

Use this workflow for hypothesis testing, not for live claims.

### Market Data Import

1. Open `Settings` if you need to save provider credentials.
2. Open `Market Data`.
3. Create an import job for the provider, symbols, and timeframe you need.
4. Monitor the job until it completes or retries.
5. Use the resulting dataset from the backtest catalog.

### Strategy And Paper Workflow

1. Stay in the safe environment posture.
2. Open `Strategies` to review configuration and version history.
3. Start or stop strategies intentionally.
4. Monitor `Dashboard`, `Trades`, and `Risk` for paper-trading behavior and alerts.
5. Export or review trade history when you need evidence for follow-up analysis.

### Exchange And System Checks

1. Open `Settings`.
2. Use exchange profile management for connection setup and active profile selection.
3. Review audit history for critical operator actions.
4. Use system utilities such as backup only when needed and with clear operator intent.

## Safe Operating Habits

- Confirm the environment before taking action.
- Keep strategies stopped when doing data-only exchange checks.
- Include realistic fees and slippage in backtests.
- Treat circuit-breaker overrides as audited exceptions, not normal workflow.
- Use paper trading before any discussion of live-readiness.

## Common Mistakes

- Mixing data-only checks with strategy execution
- Treating backtest or paper performance as guaranteed live behavior
- Ignoring provenance, fees, or slippage when comparing runs
- Switching to `live` without a clear monitoring or verification reason
