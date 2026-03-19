# Structure

## Monorepo Layout

```text
C:\Git\algotradingbot\
  .github\workflows\     CI pipelines
  AlgotradingBot\        backend application
  contracts\             tracked OpenAPI artifact
  docs\                  roadmap, guides, operator references, research appendices
  frontend\              React/Vite SPA
  scripts\               shared automation and contract tooling
  .pids\                 script-managed process ids
  .runtime\              untracked runtime state and logs
```

## Backend Layout

`AlgotradingBot/src/main/java/com/algotrader/bot/`

- `controller`: request and response contracts plus REST entrypoints
- `service`: application orchestration and domain services
- `service/marketdata`: provider, import, normalization, and scheduling logic
- `repository`: database access
- `entity`: runtime database models
- `backtest`: simulation engine, metrics, validation, and reproducibility model
- `backtest/strategy`: backtest strategy registry and implementations
- `risk`: risk and cost calculations
- `security`: auth and token handling
- `config`: application configuration and runtime infrastructure
- `repair`: local runtime validation and repair helpers
- `validation`: explicit validation suites and runtime checks
- `websocket`: event transport support
- `strategy`: shared or legacy signal helpers

## Frontend Layout

`frontend/src/`

- `features/*`: feature modules such as `auth`, `dashboard`, `strategies`, `backtest`, `marketData`, `risk`, `trades`, `settings`, and `websocket`
- `features/paperApi.ts`: shared paper-trading API slice
- `app`: Redux store and typed hooks
- `components`: shared UI primitives, route guards, and error handling
- `services`: API and WebSocket transport helpers
- `generated`: committed OpenAPI-derived TypeScript types

## Documentation Layout

- Root docs: current-state product, architecture, status, plan, tech, and guardrails
- `docs/guides/`: task-oriented implementation and runtime guides
- `docs/USER_WORKFLOW_GUIDE.md`: operator-facing usage guide
- `docs/ROADMAP.md` and `docs/ACCEPTANCE_CRITERIA.md`: planning and quality gates
- Strategy research appendices stay in `docs/` but are not part of the default implementation context

## Structural Rules

1. Keep strategy logic separate from orchestration.
2. Keep frontend contract adaptation in API or transport layers.
3. Avoid leaking persistence models through HTTP.
4. Prefer updating one canonical doc over adding another overlapping explainer.
