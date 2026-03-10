# PROJECT_STATUS.md

Status updated: March 10, 2026

## Summary

The local MVP is now functional end-to-end for core research operations with the existing stack:
- Spring Boot backend in `AlgotradingBot/`
- React + TypeScript + Vite frontend in `frontend/`
- local PostgreSQL/Kafka via Docker Compose

The following MVP slices are implemented and wired through UI to backend APIs:
1. Strategy Management
2. Backtest Execution + History
3. Risk Controls + Circuit Breaker Override Safeguards
4. Paper Trading minimal lifecycle + dashboard state

The system remains paper/test-first by default, and no live-money behavior is enabled by default.

## Completed In This Update

### 1) Strategy Management MVP

Backend:
- Added strategy config entity/repository/service/controller flow with DTO boundaries and validation.
- Added endpoints to list/start/stop/update strategy config.

Frontend:
- Replaced strategies placeholder with a working page connected to backend APIs.
- Added strategy page tests.

### 2) Backtest MVP

Backend:
- Added async backtest management flow (run, status/history, details).
- Extended backtest result model to include execution status, timeframe, fees/slippage, and error state.

Frontend:
- Replaced backtest placeholder with run form + history/details UI.
- Displays fees/slippage assumptions in metadata.
- Added backtest page tests.

### 3) Risk Controls MVP

Backend:
- Added risk config, risk status, circuit-breaker override, and risk-alert endpoints.
- Added safeguards: no live override behavior and explicit confirmation token for override action.

Frontend:
- Replaced risk placeholder with working status/config/override/alerts page.
- Added risk page tests.

### 4) Paper Trading MVP

Backend:
- Added minimal paper order lifecycle (`NEW` -> `FILLED`/`CANCELLED`) and paper account/position updates.
- Added paper state endpoint for dashboard summary.

Frontend:
- Added dashboard paper-trading state card.
- Added tests for paper dashboard card and dashboard integration.

## Current Verification Snapshot (March 10, 2026)

Frontend:
- `npm run lint` -> PASS
- `npm run test -- --watch=false` -> PASS (`396/396`)
- `npm run build` -> PASS

Backend:
- `.\gradlew.bat test` -> PASS
- `.\gradlew.bat build` -> PASS

Root scripts:
- `.\stop-all.ps1` -> PASS
- `.\build-all.ps1` -> PASS
- `.\run-all.ps1` -> PASS

Runtime checks:
- `http://localhost:5173` -> `200`
- `http://localhost:8080/actuator/health` -> `200`
- `http://localhost:8080/swagger-ui.html` -> `200`

## What Remains (Post-MVP)

- CI pipeline (`.github/workflows`) for reproducible automated checks.
- Shared API contract generation (OpenAPI-driven frontend types).
- Stronger audit trails for operator actions and environment/risk overrides.
- Market-data ingestion/replay workflow for reproducible research datasets.
- Progressive hardening of environment separation and operator controls for any future live connectivity.

## Risks / Notes

- Test output still contains non-blocking warning/debug noise in several suites; results are passing but logs are noisy.
- Current paper trading is intentionally minimal and designed for local verification, not full exchange-grade execution simulation.
- Backtest outputs are research artifacts and not evidence of future profitability.
