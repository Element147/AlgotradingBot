# STRUCTURE

## Monorepo Layout

```text
C:\Git\algotradingbot/
  .github/workflows/  CI verification gates
  AlgotradingBot/   backend
  frontend/         frontend
  docs/             roadmap/acceptance and strategy research docs
```

## Backend Boundaries

`AlgotradingBot/src/main/java/com/algotrader/bot/`

- `controller`: API contracts and request handling
- `service`: business orchestration
- `repository`: data access
- `entity`: persistence models
- `backtest` + `backtest/strategy`: simulation and strategy modules
- `risk`: risk and execution-cost logic
- `security`, `config`, `websocket`, `validation`: platform support

## Frontend Boundaries

`frontend/src/`

- `features/*`: feature-first modules (`auth`, `strategies`, `backtest`, `risk`, `trades`, etc.)
- `features/settings`: local UI preferences plus database-backed exchange connection management
- `app`: store and app-level wiring
- `components`: shared UI/layout primitives
- `services`: API and transport helpers

## Structural Rules

1. Keep strategy logic separate from orchestration.
2. Avoid leaking JPA entities through HTTP responses.
3. Keep frontend contract adaptation centralized in API/service layers.
4. Keep docs synchronized with actual structure after each significant change.
