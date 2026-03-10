# PROJECT_STATUS.md

Audit date: March 10, 2026

## Summary

The repository already has a meaningful backend foundation and a partially implemented React/Vite frontend. The backend contains real domain code for auth, risk, backtesting, strategy logic, account/dashboard APIs, and local Docker orchestration. The frontend has working auth, environment state, layout, and dashboard modules, but most product pages after dashboard remain placeholders and the current test/lint/build story is not yet stable.

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

## In-Progress Or Partial Areas

- Frontend Phase 2 dashboard work is mostly implemented in code, but the Phase 2 verification task is still unchecked in `.kiro/specs/frontend-dashboard/phase-02-layout-dashboard.md`
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

- Documentation says Java 25 and Spring Boot 4, but the backend build uses Java 21 and Spring Boot 3.4.1
- Documentation says React Router 6 and MUI 5, but the frontend uses React Router 7 and MUI 7
- Multiple docs describe the frontend as newly created or fully verified, but only auth and dashboard slices are materially implemented
- `README.md` and `.kiro/steering/product.md` previously implied a path to profitability; that framing has been rewritten to research-focused language
- Frontend auth originally expected `token`, while backend auth returns `accessToken`; the frontend was updated in this audit to tolerate both payload shapes
- Frontend dashboard types for positions/trades do not yet fully match backend DTOs, especially around `strategyName`, `side`, and `positionSize` vs `quantity`

## Known Risks And Tech Debt

- Frontend lint currently fails with many issues, including ESLint project configuration not covering test files
- Frontend Vitest run currently has failing tests and several MSW/mock coverage gaps
- Frontend build could not be re-verified in the current sandbox because Vite hit a `spawn EPERM` during config loading
- Backend Gradle verification could not be re-run in the current sandbox because the wrapper tried to write under `C:\Users\CodexSandboxOffline\.gradle`
- Backend service methods still contain placeholders for live exchange access and simplified metrics such as Sharpe calculation
- Environment separation is more conceptual than enforced: `test` vs `live` is mostly a request-level distinction today

## Verification Snapshot From This Audit

- `frontend`: `npm run lint` failed
- `frontend`: `npx vitest run --watch=false --reporter=dot` failed
- `frontend`: `npm run build` failed in sandbox with a Vite `spawn EPERM`
- `AlgotradingBot`: `.\gradlew.bat test` and `.\gradlew.bat build -x test` could not run in sandbox due wrapper write restrictions

## Immediate Next Priorities

1. Stabilize frontend verification: fix ESLint project config, clear the current lint backlog, and make tests deterministic.
2. Align remaining frontend/backend API contracts, especially dashboard DTOs and role/token normalization.
3. Finish Phase 2 verification with a reproducible local runbook and evidence.
4. Implement backend and frontend strategy management beyond placeholders.
5. Add backtest execution APIs and a reproducible research data workflow.
6. Add risk configuration, circuit-breaker status, and operator controls as real endpoints.
7. Define and implement paper-trading mode as a first-class environment.
8. Add CI for backend tests, frontend tests, lint, and build checks.
9. Add structured audit logging for environment changes, strategy actions, and trade lifecycle events.
10. Harden local observability with consistent logs, health checks, and service-level troubleshooting docs.

## Assumptions Made During Setup

- Local laptop development remains the primary target environment.
- React/Vite stays the frontend baseline unless the user explicitly approves a migration.
- Live trading is out of scope by default; paper trading and research come first.
- Existing docs that overstate completion or profitability should be treated as stale unless verified in code.
