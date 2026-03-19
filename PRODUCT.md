# Product

## Mission

Build a local-first platform for safe strategy research, backtesting, market-data preparation, and paper-trading operations.

## Primary Operator Jobs

1. Configure and review strategies without leaving the safe `test` default.
2. Run reproducible backtests against uploaded or provider-imported datasets.
3. Compare experiments, inspect equity and trade series, and export evidence-backed reports.
4. Monitor paper-trading behavior, risk posture, and incident signals.
5. Manage exchange connection profiles, provider credentials, and system operations from one dashboard.

## Product Surfaces

- `Dashboard`: system health, environment posture, paper-trading state, and alerts
- `Strategies`: strategy status, configuration, presets, and version history
- `Backtest`: dataset management, run execution, progress, replay, compare, and export
- `Market Data`: provider selection, import job creation, progress tracking, and dataset ingestion
- `Trades`: trade history, trade details, and export-oriented review
- `Risk`: risk configuration, alerts, and circuit-breaker state
- `Settings`: exchange profiles, provider credentials, audit review, and system tools

## Product Principles

1. Safety first: default to `test` and paper-safe behavior.
2. Research honesty: results are hypotheses, not promises.
3. Operational clarity: environment, risk posture, and overrides must stay visible.
4. Reproducibility: datasets, parameters, experiments, and exports should be traceable.
5. Incremental delivery: prefer small, verified changes over broad rewrites.

## Environment Model

- `test`: local and research workflows
- `paper`: simulated execution behavior under operator controls
- `live`: explicit live-connected context for monitoring or future gated capabilities

Live connectivity does not imply live trading is enabled.

## Product Boundaries

- No default real-money execution path
- No profitability claims without reproducible evidence
- No bypassing of risk controls, kill switches, or audit trails
- No leverage, margin, or live direct shorting in the default product path
