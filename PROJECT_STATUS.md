# PROJECT_STATUS.md

Audit updated: March 10, 2026

## Summary

The repository has a meaningful backend foundation and a partially implemented React/Vite frontend. The backend contains real domain code for auth, risk, backtesting, strategy logic, account/dashboard APIs, and local Docker orchestration. The frontend has working auth, environment state, layout, and dashboard modules, but most product pages after dashboard remain placeholders and the overall verification baseline is still only partially stabilized.

This setup pass materially improved the frontend and backend verification foundation:
- frontend lint/build/tests are fully passing (`lint`, `build`, and `389/389` tests)
- backend Gradle verification is fully passing (`.\gradlew.bat check`)
- root local verification scripts now run successfully end-to-end (`stop-all`, `build-all`, `run-all`)
- dashboard account DTO normalization remains implemented in `accountApi` (supports backend payload differences such as `positionSize` vs `quantity` and missing `strategyName`/`side` fields)

## Completed Areas

- Monorepo split into `AlgotradingBot/` backend and `frontend/` SPA
- Local-first scripts for build/run/stop from the repo root
- Backend auth with JWT, refresh flow, and Spring Security
- Backend account/dashboard endpoints:
  - `/api/account/balance`
  - `/api/account/performance`
  - `/api/positions/open`
  - `/api/trades/recent`
- Backend strategy, risk, slippage, position sizing, backtest metrics, Monte Carlo, and validation modules
- Backend WebSocket configuration and handler classes
- Backend Docker Compose for app, PostgreSQL, and Kafka
- Frontend auth flow, protected routes, Redux store, RTK Query base client, environment slice, theme slice, dashboard layout, balance/performance cards, and WebSocket client/middleware
- Frontend setup pass completed in this audit:
  - auth payload normalization for backend/frontend token shape differences
  - dedicated `frontend/tsconfig.eslint.json` for type-aware linting of tests
  - repaired dashboard/account test mocks and MSW account handlers
  - normalized position/trade API transforms in `accountApi`

## In-Progress Or Partial Areas

- Frontend Phase 2 dashboard work is complete including task `2.16` verification
- Frontend strategies, trades, backtest, risk, and settings routes exist, but the pages are placeholders
- Backend strategy lifecycle endpoints exist, but they currently manage account records and simple status changes rather than a full execution engine
- Live environment routing exists as an API parameter/header concept, but live exchange integration still falls back to test data
- Validation and repair tooling exists for local production-readiness checks, but it is separate from CI and not yet a substitute for a stable automated pipeline

## Missing Foundations

- No verified paper-trading workflow end to end
- No real exchange integration with safe read-only and paper/live separation
- No backend endpoints yet for risk config, exchange config, backtest execution, or paper-trading operations
- No shared API contract generation between backend and frontend
- No CI workflow in `.github/`
- No reproducible market-data ingestion pipeline documented for research/backtesting
- No clear audit trail for order lifecycle, operator actions, and environment switches
- No completed observability stack beyond actuator/logging primitives

## Contradictions And Inconsistencies

- Core docs now align with verified stack versions (Java 21, Spring Boot 3.4.1, React Router 7, MUI 7).
- Some historical spec/design files still describe future-state scope that exceeds current implementation and should be treated as planning artifacts.
- Several phase docs still include branch/commit workflow guidance that assumes direct pushes to `main`; team workflow should prefer feature branches.
- `README.md` and `.kiro/steering/product.md` were corrected to research-focused, evidence-based wording.
- Frontend auth originally expected `token`, while backend auth returns `accessToken`; the frontend now tolerates both payload shapes
- Backend open positions/trades payloads do not always include frontend-facing fields (`strategyName`, `strategyId`, `side`, `quantity`); frontend now normalizes these fields safely in API transforms

## Known Risks And Tech Debt

- Backend service methods still contain placeholders for live exchange access and simplified metrics such as Sharpe calculation
- Environment separation is more conceptual than enforced: `test` vs `live` is mostly a request-level distinction today
- Several frontend tests intentionally emit debug/error logs during assertions; functional but noisy

## Verification Snapshot From This Audit

- `frontend`: `npm run lint` passes
- `frontend`: `npm run test` passes (`389/389`)
- `frontend`: `npm run build` passes
- `AlgotradingBot`: `.\gradlew.bat check` passes
- root scripts: `.\stop-all.ps1`, `.\build-all.ps1`, and `.\run-all.ps1` all pass

## Immediate Next Priorities

1. Implement backend and frontend strategy management beyond placeholders.
2. Add backtest execution APIs and a reproducible research data workflow.
3. Add risk configuration, circuit-breaker status, and operator controls as real endpoints.
4. Define and implement paper-trading mode as a first-class environment.
5. Add CI for backend tests, frontend tests, lint, and build checks.
6. Add structured audit logging for environment changes, strategy actions, and trade lifecycle events.
7. Add shared API contract generation (OpenAPI-driven types) between backend and frontend.
8. Implement a reproducible market-data ingestion workflow for research/backtesting.
9. Add paper-trading operational controls (manual pause/resume/kill switch) in UI and API.
10. Harden local observability with consistent logs, health checks, and service-level troubleshooting docs.

## Assumptions Made During Setup

- Local laptop development remains the primary target environment.
- React/Vite stays the frontend baseline unless the user explicitly approves a migration.
- Live trading is out of scope by default; paper trading and research come first.
- Existing docs that overstate completion or profitability should be treated as stale unless verified in code.

