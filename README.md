# AlgoTrading Bot

Local-first full-stack algorithmic trading research platform for strategy research, backtesting, risk controls, and paper-trading workflows.

## Safety First

- Default behavior is `test`/`paper`.
- Live-money trading is never enabled by default.
- Backtests and paper results are research artifacts, not proof of future profitability.

## Current Capability Snapshot (March 14, 2026)

Implemented and usable end to end:

- Strategy management APIs and UI workflows
- Backtest execution, experiment summaries, history, and details
- Live backtest progress telemetry with persisted stage/progress/current-candle visibility plus operator result deletion controls
- Virtual-thread-backed async execution for long-running backtests and market-data import workers, plus parsed-candle reuse for repeated dataset-backed backtests
- Startup recovery for unfinished long-running work: queued or interrupted backtests are automatically restarted, and market-data imports continue from their saved cursor after the next server start
- Backtest replay and side-by-side comparison APIs
- Dataset lifecycle inventory (`checksumSha256`, schema version, retention, archive/restore) plus dataset download endpoint
- Provider-backed historical market data downloader with automated retry/wait handling and direct dataset imports into the backtest catalog
- Persisted backtest equity/trade series with chart/export support in the UI
- Strategy configuration version history plus typed preset guidance in API and UI
- Paper/backtest short-selling enablement with saved strategy-level toggles and explicit `LONG`/`SHORT` state in dashboard and trade views
- Risk configuration and circuit-breaker controls
- Paper-trading lifecycle, recovery-aware dashboard state, and in-app incident alerts
- Database-persisted exchange connection profiles with per-user active selection in the settings UI
- Operator audit-event trail for critical actions (`/api/system/audit-events`)
- System backup endpoint with real database dump artifacts
- CI verification gates for backend and frontend (`.github/workflows/ci.yml`)
- Generated OpenAPI contract export and frontend contract drift check
- Provenance-guarded backtest PDF/CSV exports
- Small-account strategy catalog in backend backtest engine

Backtest strategy catalog:

- `BUY_AND_HOLD`
- `DUAL_MOMENTUM_ROTATION`
- `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`
- `TREND_PULLBACK_CONTINUATION`
- `REGIME_FILTERED_MEAN_REVERSION`
- `TREND_FIRST_ADAPTIVE_ENSEMBLE`
- `SMA_CROSSOVER`
- `BOLLINGER_BANDS`

## Backtest Execution Model

- Strategies are isolated classes behind `BacktestStrategy` and discovered via `BacktestStrategyRegistry`.
- Execution modes:
  - `SINGLE_SYMBOL`
  - `DATASET_UNIVERSE`
- Repeatable experiment labels group related runs into multi-run summaries while keeping per-run provenance intact.
- Action model records explicit `BUY` / `SELL` / `SHORT` / `COVER` actions plus `LONG` / `SHORT` exposure state.
- Direct short exposure is available only in `test`/`paper` research flows when enabled per strategy; live shorting, margin, and leverage remain disabled.

## Stack

- Backend: Java 21, Spring Boot 4.0.3, Gradle Kotlin DSL
- Frontend: React 19, TypeScript, Vite, Redux Toolkit, RTK Query, React Router 7, MUI 7
- Runtime DB: PostgreSQL via Docker Compose (`AlgotradingBot/compose.yaml`)
- Backend tests/build: H2 in-memory (`test` profile)
- UI display/notification preferences remain browser-local; saved exchange API connections are persisted in PostgreSQL

## Local Commands

Fast local developer flow (recommended):

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

Legacy full-stack wrappers are still available:

```powershell
.\build-all.ps1
.\run-all.ps1
.\stop-all.ps1
```

Server hygiene:

- Never start a frontend or backend dev server until existing instances are checked and stopped first.
- If you start a frontend or backend server while working, stop it before you finish the session.

Runtime logs:

- Local script-driven backend logs go to `.runtime/logs/` and stay untracked.

Optional security scan:

```powershell
.\security-scan.ps1
```

## Optional Task Guides

Open only the guides that match the task:

- `docs/guides/README.md`
- `docs/guides/FRONTEND_IMPLEMENTATION.md`
- `docs/guides/BACKEND_IMPLEMENTATION.md`
- `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
- `docs/guides/MARKET_DATA_RESEARCH.md`

## Canonical Documentation

Slim core docs:

- `AGENTS.md`
- `README.md`
- `PLAN.md`
- `PRODUCT.md`
- `PROJECT_STATUS.md`
- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`

Optional task-specific docs:

- `TECH.md`
- `STRUCTURE.md`
- `GRADLE_AUTOMATION.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/guides/README.md`
- `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`
- `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md`
- `docs/USER_WORKFLOW_GUIDE.md`

Repository policy: completed one-off implementation logs are removed after their key decisions are merged into the canonical docs above.
