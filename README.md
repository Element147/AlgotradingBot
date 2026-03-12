# AlgoTrading Bot

Local-first full-stack algorithmic trading research platform for strategy research, backtesting, risk controls, and paper-trading workflows.

## Safety First

- Default behavior is `test`/`paper`.
- Live-money trading is never enabled by default.
- Backtests and paper results are research artifacts, not proof of future profitability.

## Current Capability Snapshot (March 12, 2026)

Implemented and usable end-to-end:

- Strategy management APIs and UI workflows
- Backtest execution, experiment summaries, history, and details
- Backtest replay and side-by-side comparison APIs
- Dataset lifecycle inventory (`checksumSha256`, schema version, retention, archive/restore) plus dataset download endpoint
- Persisted backtest equity/trade series with chart/export support in the UI
- Strategy configuration version history plus typed preset guidance in API and UI
- Risk configuration and circuit-breaker controls
- Paper-trading lifecycle, recovery-aware dashboard state, and in-app incident alerts
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
- Repeatable experiment labels now group related runs into multi-run summaries while keeping per-run provenance intact.
- Action model is currently conservative (`long/rotate/sell-to-cash/hold`).
- True shorting, margin, and leverage are not default behavior.

## Stack

- Backend: Java 21, Spring Boot 4.0.3, Gradle Kotlin DSL
- Frontend: React 19, TypeScript, Vite, Redux Toolkit, RTK Query, React Router 7, MUI 7
- Runtime DB: PostgreSQL via Docker Compose (`AlgotradingBot/compose.yaml`)
- Backend tests/build: H2 in-memory (`test` profile)

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

## Verification Commands

Frontend:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
npm run contract:check
```

Backend:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

## Auth Runbook

Normal local login:

1. Start the stack with `.\build.ps1` and `.\run.ps1`.
2. Open the frontend and sign in with the seeded local account `admin` / `dogbert`, unless you created another user.
3. Leave strict auth enabled for normal verification and day-to-day development.

Dev-only auth override:

1. Use `ALGOTRADING_RELAXED_AUTH=true` only for isolated local debugging when you explicitly need unauthenticated `/api/**` access.
2. In PowerShell, set the override before startup: `$env:ALGOTRADING_RELAXED_AUTH='true'`.
3. Start the backend or full stack, reproduce the issue quickly, then remove the override with `Remove-Item Env:ALGOTRADING_RELAXED_AUTH`.
4. Re-run normal verification with strict auth restored before considering the task complete.

## Canonical Documentation

- `AGENTS.md`
- `PLAN.md`
- `PRODUCT.md`
- `TECH.md`
- `STRUCTURE.md`
- `GRADLE_AUTOMATION.md`
- `PROJECT_STATUS.md`
- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`
- `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md`
- `docs/USER_WORKFLOW_GUIDE.md`

Repository policy: completed one-off implementation logs are removed after their key decisions are merged into the canonical docs above.
