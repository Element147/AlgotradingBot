# PRODUCT

## Mission

Build a local-first algorithmic trading research platform for safe strategy experimentation, backtesting, and paper trading.

## Product Principles

1. Safety first: default to `test`/`paper` behavior.
2. Research honesty: strategy outcomes are hypotheses, not guarantees.
3. Operational clarity: environment mode, risk status, and overrides must be visible.
4. Incremental delivery: prefer small, verified changes over broad rewrites.

## Trading Philosophy

1. Capital protection before return optimization.
2. Trend-first strategy evaluation with explicit regime handling.
3. Realistic assumptions (fees, slippage, constraints) in all claims.
4. Paper validation before any live-readiness discussion.

## Risk Baseline

- Max risk per trade: `2%`
- Max drawdown stop target: `25%`
- Cash buffer target: `20-30%`
- No leverage by default

## Product Boundaries

- No default real-money live trading.
- No marketing language implying guaranteed profits.
- No bypassing of risk controls or kill-switch paths.
