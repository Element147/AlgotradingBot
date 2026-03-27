# Product

## Mission

Build a local-first platform for safe strategy research, backtesting, market-data preparation, and paper-trading operations.

## Primary Operator Jobs

1. Configure and review catalog-backed strategy templates without leaving the safe `test` default.
2. Run reproducible backtests against uploaded or provider-imported datasets.
3. Compare experiments, inspect equity and trade series, and export evidence-backed reports.
4. Monitor paper-trading behavior, risk posture, and incident signals.
5. Manage exchange connection profiles, provider credentials, and system operations from one dashboard.

## Product Surfaces

- `Dashboard`: system health, environment posture, paper-trading state, alerts, and workstation-level research context
- `Forward Testing`: paper-safe strategy observation, signal charts, audit-backed investigation history, and local operator notes
- `Paper`: exchange-scoped strategy assignment, active paper-algorithm review, simulated order entry, fill/cancel controls, and order history
- `Live`: capability-gated live monitoring, exchange-health review, active-strategy evidence, and fail-closed messaging when live reads or execution are not approved
- `Strategies`: canonical catalog-backed paper templates, configuration, presets, and version history
- `Backtest`: dataset management, run execution, progress, telemetry-rich details, replay, compare, and export
- `Market Data`: provider selection, import job creation, progress tracking, and dataset ingestion
- `Trades`: trade history, trade details, and export-oriented review
- `Risk`: risk configuration, alerts, circuit-breaker inventory, and override context
- `Settings`: exchange profiles, provider credentials, audit review, and system tools

## Product Principles

1. Safety first: default to `test` and paper-safe behavior.
2. Research honesty: results are hypotheses, not promises.
3. Operational clarity: environment, risk posture, and overrides must stay visible.
4. Reproducibility: datasets, parameters, experiments, and exports should be traceable.
5. Incremental delivery: prefer small, verified changes over broad rewrites.
6. Operator trust: the shell should make safety-critical state readable at a glance on both desktop and mobile.
7. Explainability by default: moving from an active algorithm list into detail should show trade-trigger evidence, risk, exposure, and incident context in one or two clicks.

## Strategy Catalog Posture

- The built-in backtest catalog currently includes `BUY_AND_HOLD`, `DUAL_MOMENTUM_ROTATION`, `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`, `TREND_PULLBACK_CONTINUATION`, `REGIME_FILTERED_MEAN_REVERSION`, `TREND_FIRST_ADAPTIVE_ENSEMBLE`, `SMA_CROSSOVER`, `BOLLINGER_BANDS`, and `ICHIMOKU_TREND`.
- `ICHIMOKU_TREND` is implemented as a conservative long/cash strategy with look-ahead-safe cloud handling and chart overlays, but it is still a research surface rather than a promoted operating strategy.
- The March 27, 2026 frozen audit keeps the overall posture conservative: `BUY_AND_HOLD` is `baseline only`, `SMA_CROSSOVER` is the sole `paper-monitor candidate`, four catalog paths stay `research only`, and three weak paths are now explicit `archive candidate` strategies.
- The next small-account strategy phase is constrained by `docs/SMALL_ACCOUNT_EXECUTION_CONSTRAINTS.md`, which freezes the default `long/cash`, low-turnover, no-leverage posture before new strategy specs or implementations start.

## Environment Model

- `test`: local and research workflows
- `paper`: simulated execution behavior under operator controls
- `live`: explicit live-connected context for monitoring or future gated capabilities

Live connectivity does not imply live trading is enabled.
Live connectivity also does not imply live account reads are fully wired; unsupported live reads must fail explicitly with capability messaging.
Route-owned execution contexts come first: Backtest and Market Data stay in `research`, Paper stays in `paper`, and operational live-readiness controls are surfaced separately instead of acting like a global switch that rewires every route.

## Product Boundaries

- No default real-money execution path
- No profitability claims without reproducible evidence
- No bypassing of risk controls, kill switches, or audit trails
- No leverage, margin, or live direct shorting in the default product path
