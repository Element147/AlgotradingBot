# AlgoTrading Bot

Local-first research platform for strategy design, backtesting, market-data imports, paper trading, and operator controls.

## Safety Model

- Default mode is `test`.
- Paper workflows stay simulated.
- Live trading is not enabled by default.
- Backtests and paper results are research artifacts, not proof of profitability.

## What The System Does Now

- Authenticated Spring Boot backend with JWT, Liquibase-managed PostgreSQL runtime, WebSocket events, and audited system operations
- React/Vite workstation for login, dashboard, forward testing, paper trading, live monitoring, strategies, backtests, market-data imports, trades, risk controls, and settings
- Backtest engine with modular strategy registry, experiment grouping, replay and compare flows, persisted equity and trade series, and provenance-aware exports
- Market-data import pipeline with provider-specific download adapters, retry-aware persistent jobs, encrypted provider credentials, and direct dataset ingestion into the backtest catalog
- New uploads and completed provider imports now hydrate the normalized market-data store at ingestion time; legacy CSV bytes remain only as a temporary compatibility copy for explicit download and fallback paths
- Legacy catalog datasets without normalized segments are now backfilled on startup before operators use them, so backtest execution and telemetry stay on the relational market-data store even after runtime cutover
- Route-owned execution contexts now replace the old global execution switch: research routes stay pinned to `research`, Forward Testing stays `forward-test`, Paper stays `paper`, and Live stays capability-gated `live`
- Paper-trading, live monitoring, and operator oversight flows with circuit-breaker controls, audit history, incident alerts, exchange connection profiles, and environment-aware shell state
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
- `ICHIMOKU_TREND`

Operator-managed strategy configurations now normalize to these same canonical IDs and seed missing paper-safe templates from the catalog. New/default strategy configs remain long-only unless short exposure is explicitly enabled.
The catalog remains research-only. On the March 20, 2026 crypto rerun against dataset `#12`, only `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT` passed the current full-sample validator, holdout results stayed mixed, and no strategy is being treated as production-ready or live-ready.

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
.\run.ps1 -BackendMaxHeapMb 3072
.\run.ps1 -BackendInitialHeapMb 1024 -BackendMaxHeapMb 4096
.\run-all.ps1
.\run-all.ps1 -DebugBackend
.\security-scan.ps1
```

Runtime script behavior:

- `.\run.ps1` and `.\run-all.ps1` now wait for both backend and frontend readiness before declaring success.
- Both startup scripts roll back partial startup if a later stage fails, so PostgreSQL, Docker services, or detached dev servers are not left running silently.
- `.\run-all.ps1` also checks for a leftover local backend from fast mode before Docker startup.
- `.\run.ps1` auto-sizes the local backend JVM heap from host RAM and accepts `-BackendInitialHeapMb`, `-BackendMaxHeapMb`, and `-BackendMaxMetaspaceMb` overrides when you want a roomier local backend.

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
- `docs/LEGACY_DATASET_RETIREMENT_PLAN.md`
- `docs/STRATEGY_AUDIT_DATASET_PACK.md`
- `docs/STRATEGY_AUDIT_PROTOCOL.md`
- `docs/STRATEGY_CATALOG_AUDIT_REPORT.md`
- `.codex/agents/README.md`
- `docs/adr/`: architecture decision records for durable backend and platform choices
- `docs/USER_WORKFLOW_GUIDE.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/SEMGREP_TRIAGE.md`
- `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`
- `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md`

Research appendices stay separate from the canonical docs so day-to-day context stays focused on how the product works now.
