# AlgoTrading Bot

Local-first research platform for strategy design, backtesting, market-data imports, paper trading, and operator controls.

## Safety Model

- Default mode is `test`.
- Paper workflows stay simulated.
- Live trading is not enabled by default.
- Backtests and paper results are research artifacts, not proof of profitability.

## What The System Does Now

- Authenticated Spring Boot backend with JWT, Liquibase-managed PostgreSQL runtime, Kafka, WebSocket events, and audited system operations
- React/Vite dashboard for login, dashboard, strategies, backtests, market-data imports, trades, risk controls, and settings
- Backtest engine with modular strategy registry, experiment grouping, replay and compare flows, persisted equity and trade series, and provenance-aware exports
- Market-data import pipeline with provider-specific download adapters, retry-aware persistent jobs, encrypted provider credentials, and direct dataset ingestion into the backtest catalog
- Paper-trading and operator oversight flows with circuit-breaker controls, audit history, incident alerts, exchange connection profiles, and environment-aware UI state
- Local scripts for fast development mode and Docker-backed full-stack mode, plus CI-aligned contract and verification workflows

Current backtest strategy catalog:

- `BUY_AND_HOLD`
- `DUAL_MOMENTUM_ROTATION`
- `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`
- `TREND_PULLBACK_CONTINUATION`
- `REGIME_FILTERED_MEAN_REVERSION`
- `TREND_FIRST_ADAPTIVE_ENSEMBLE`
- `SMA_CROSSOVER`
- `BOLLINGER_BANDS`

## Quick Start

Recommended local flow:

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

Useful variants:

```powershell
.\run.ps1 -DebugBackend
.\run.ps1 -DebugBackend -SuspendBackend
.\run-all.ps1
.\run-all.ps1 -DebugBackend
.\security-scan.ps1
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## Documentation Map

Canonical current-state docs:

- `README.md`: entry point and documentation map
- `PRODUCT.md`: product purpose, operator surfaces, and scope boundaries
- `PROJECT_STATUS.md`: current capabilities, verified baseline, active gaps
- `ARCHITECTURE.md`: how backend, frontend, and runtime fit together
- `TRADING_GUARDRAILS.md`: safety and reporting rules
- `PLAN.md`: current priorities and sequencing
- `TECH.md`: stack, commands, and verification matrix
- `STRUCTURE.md`: repo and module boundaries

Implementation guides:

- `docs/guides/README.md`
- `docs/guides/BACKEND_IMPLEMENTATION.md`
- `docs/guides/FRONTEND_IMPLEMENTATION.md`
- `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
- `docs/guides/MARKET_DATA_RESEARCH.md`

Supporting references:

- `QUICK_START.md`
- `GRADLE_AUTOMATION.md`
- `.codex/agents/README.md`
- `docs/USER_WORKFLOW_GUIDE.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/SEMGREP_TRIAGE.md`
- `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`
- `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md`

Research appendices stay separate from the canonical docs so day-to-day context stays focused on how the product works now.
