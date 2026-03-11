# Product Overview

Local-first algorithmic trading research platform for stock and crypto strategy experimentation.

## Product Intent

- Build reliable strategy research, backtesting, risk-control, and paper-trading workflows.
- Keep default operating mode conservative (`test`/`paper`).
- Treat every strategy as a hypothesis to validate, not a guaranteed edge.

## Current Strategy Posture

The backtest catalog is trend-first with benchmark and regime-diversification coverage:

- Benchmark/baseline: `BUY_AND_HOLD`
- Trend/rotation family: dual momentum, Donchian breakout, pullback continuation
- Regime-aware layer: mean reversion and adaptive ensemble
- Simple references: SMA crossover, Bollinger bands

## Risk Philosophy

- Max risk per trade: `2%`
- Max drawdown stop target: `25%`
- Cash buffer: `20-30%`
- No leverage by default
- Operator kill-switch and override controls must remain available

## Delivery Focus

1. Keep current MVP stable and verifiable.
2. Improve reproducible research and analytics depth.
3. Harden paper-trading and operator auditability.
4. Evaluate any future live-readiness only after strict validation gates.

## Critical Constraints

- No profitability claims without reproducible evidence.
- No default live-money trading behavior.
- No weakening of environment separation or risk guardrails.
