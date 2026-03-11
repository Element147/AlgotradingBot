# AlgoTrading Bot

Local-first full-stack algorithmic trading research platform for strategy research, backtesting, risk controls, and paper-trading workflows.

## Safety First

- Default behavior is `test`/`paper`.
- Live-money trading is never enabled by default.
- Backtests and paper results are research artifacts, not proof of future profitability.

## Current Capability Snapshot (March 11, 2026)

Implemented and usable end-to-end:

- Strategy management APIs and UI workflows
- Backtest execution, history, and details
- Risk configuration and circuit-breaker controls
- Paper-trading lifecycle and dashboard state
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

## Verification Commands

Frontend:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

Backend:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

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
