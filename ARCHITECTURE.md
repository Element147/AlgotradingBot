# ARCHITECTURE.md

## Overview

This repository is a monorepo with a Spring Boot backend in `AlgotradingBot/` and a React/Vite frontend in `frontend/`. The current architecture is suitable for a local laptop workflow, but several boundaries that matter for a serious algo-trading system are only partially implemented today.

## Backend

### Current modules

- `config/`: Spring security, OpenAPI, WebSocket, startup data initialization
- `controller/`: auth, dashboard/account, and strategy-related REST endpoints plus DTOs
- `service/`: auth, account/dashboard, and strategy lifecycle service logic
- `repository/`: Spring Data JPA repositories
- `entity/`: `Account`, `Trade`, `Portfolio`, `BacktestResult`, `User`
- `risk/`: position sizing, slippage, transaction costs, risk checks
- `strategy/`: Bollinger Band indicator, strategy, trade signal model
- `backtest/`: backtest engine, metrics, validator, Monte Carlo, walk-forward result types
- `websocket/`: handler and event publisher
- `validation/` and `repair/`: local readiness validation and automated repair helpers

### Current responsibilities

- Controllers expose HTTP endpoints and map to DTOs.
- Services hold business logic, but strategy execution is still relatively thin and partly placeholder-based.
- Entities and repositories provide persistence.
- Risk and backtest packages contain meaningful research logic and financial calculations.

## Frontend

### Current modules

- `src/app/`: store setup and shared hooks
- `src/features/auth/`: login flow, auth slice, auth API
- `src/features/environment/`: test/live mode state and switch UI
- `src/features/account/`: dashboard account queries
- `src/features/dashboard/`: layout consumer page, cards, system health, positions, recent trades
- `src/features/websocket/`: connection state, middleware, hook
- `src/features/settings/`: theme/settings slice plus placeholder page
- `src/components/`: protected route, error handling, theme toggle, layout shell
- `src/services/`: RTK Query base client, Axios client, WebSocket manager

### Current responsibilities

- RTK Query handles API calls and caching.
- Redux slices hold auth, environment, theme, and websocket state.
- Dashboard components render the implemented Phase 2 surface.
- Most pages after dashboard are still placeholders and should be treated as not yet product-complete.

## Data Flow

### REST flow

1. User interacts with a frontend component.
2. The component calls an RTK Query endpoint.
3. `baseQueryWithEnvironment` injects auth and environment headers.
4. Spring controllers receive the request and delegate to services.
5. Services read from repositories and domain modules, then return DTOs.
6. The frontend renders RTK Query data.

### WebSocket flow

1. Frontend `WebSocketManager` connects with token and environment query params.
2. Backend WebSocket handler accepts the connection and subscriptions.
3. Backend event publisher sends environment-scoped events.
4. Frontend middleware invalidates affected RTK Query caches and updates websocket state.

### Trading and research flow

1. Strategy logic generates `TradeSignal` instances from market data.
2. Risk modules calculate position size, fees, slippage, and guardrails.
3. Backtest engine simulates execution and produces metrics.
4. Validation modules evaluate results against quality gates.
5. Today, the research/backtest stack is stronger than the live execution stack.

## Architectural Strengths

- Clear monorepo split with local-first scripts
- Reasonable backend package separation
- Real financial calculation code uses `BigDecimal`
- Backtesting, metrics, and validation modules already exist
- Frontend uses typed state management and RTK Query
- Safety-minded default environment behavior exists in the frontend

## Architectural Weaknesses

- Environment separation is not yet deeply enforced in persistence, execution, and operator workflows
- Backend strategy lifecycle APIs are not yet backed by a robust execution engine
- Frontend/backend API contracts are not centrally defined and have already drifted
- Several frontend routes are present only as placeholders
- CI and automated cross-stack verification are missing
- Live exchange integration is still placeholder logic
- Audit logging and operator safety controls are not yet complete enough for live-trading consideration

## Recommended Near-Term Improvements

1. Introduce explicit contract adapters or shared schemas for backend/frontend DTOs.
2. Finish Phase 2 verification and resolve current lint/test failures before expanding feature surface.
3. Add a first-class paper-trading service layer distinct from backtest and future live execution.
4. Add risk config, circuit-breaker status, and environment control endpoints before implementing more operator UI.
5. Add CI for backend tests, frontend tests, lint, and build checks.
6. Add a documented market-data ingestion and fixture strategy for reproducible research.
7. Standardize event payloads and DTO names across REST and WebSocket paths.

## What Should Not Be Changed Casually

- Do not replace React/Vite with Next.js without explicit approval and a written migration case.
- Do not collapse backend risk, strategy, backtest, and controller concerns into one service layer.
- Do not switch away from `BigDecimal` or loosen financial precision rules.
- Do not add live-money defaults or blur `test`, `paper`, and `live` responsibilities.
- Do not remove the local laptop workflow in favor of infrastructure-heavy orchestration unless there is a clear need.
