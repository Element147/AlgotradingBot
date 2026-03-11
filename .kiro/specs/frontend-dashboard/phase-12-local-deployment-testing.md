# Phase 12: Local Deployment and Testing (Week 12)

[Previous: Phase 11 - Accessibility Compliance](./phase-11-accessibility-compliance.md) | [Next: Phase 13 - Testing and Documentation](./phase-13-testing-documentation.md)

## Goal

Make the platform easy to run and validate on a single developer machine, with strict separation:

- runtime app -> PostgreSQL in Docker
- backend tests/build -> H2 in-memory (no Docker dependency)
- frontend development -> Vite local dev server

This phase is local-first by design and is mandatory before any production planning.

## Why this matters for trading research

- You can iterate quickly on strategy ideas without infrastructure overhead.
- You can backtest on 2-3 years of historical data reproducibly.
- You avoid accidental coupling between CI/build workflows and local Docker state.

## Scope

- Local command workflow documented and verified in CMD/PowerShell.
- New-user friendly setup and troubleshooting notes.
- Data workflow for importing historical candles and running backtests.
- Safety defaults checked (`test`/`paper` behavior).

## Tasks

- [x] 12.1 Verify local runtime stack commands
  - Start PostgreSQL in Docker
  - Build and run backend
  - Build and run frontend

- [x] 12.2 Verify backend test/build isolation
  - `gradlew.bat test` uses Spring `test` profile and H2 in-memory
  - `gradlew.bat build` does not require Docker PostgreSQL

- [x] 12.3 Validate runtime database behavior
  - `bootRun` connects to PostgreSQL (`jdbc:postgresql://localhost:5432/algotrading`)
  - Liquibase migrations apply on startup
  - Seed admin account exists (`admin` / `dogbert`)

- [x] 12.4 Validate backtest research workflow
  - Upload/import historical dataset
  - Run backtest with realistic fees/slippage assumptions
  - Confirm results persist in PostgreSQL runtime database

- [x] 12.5 Beginner UX pass for local research
  - Field-level helper text and guidance added in auth/strategy/backtest/risk/settings/trades pages
  - Strategy explanations added so algorithm purpose/risk is understandable before selection

- [x] 12.6 Local verification checklist
  - Frontend lint/test/build
  - Backend test/build
  - Runtime smoke checks (`/actuator/health`, frontend route loading)

## CMD command set

```cmd
cd /d C:\Git\algotradingbot\AlgotradingBot && docker compose -f compose.yaml up -d postgres
cd /d C:\Git\algotradingbot\AlgotradingBot && gradlew.bat clean build
cd /d C:\Git\algotradingbot\AlgotradingBot && gradlew.bat bootRun
cd /d C:\Git\algotradingbot\frontend && npm run build
cd /d C:\Git\algotradingbot\frontend && npm run dev
```

## Notes for 2-3 year backtests

- Keep symbol/timeframe consistent between dataset and backtest form.
- Include transaction costs on every run.
- Evaluate multiple windows to reduce overfitting risk.
- Treat outputs as research evidence, not guaranteed future returns.

## Exit criteria

- Local runtime works end-to-end with PostgreSQL Docker.
- Build/test is Docker-independent via H2.
- New user can run the app from docs without hidden setup steps.
- Research/backtest workflow is understandable in UI without prior domain knowledge.

---

[Previous: Phase 11 - Accessibility Compliance](./phase-11-accessibility-compliance.md) | [Next: Phase 13 - Testing and Documentation](./phase-13-testing-documentation.md) | [Back to Overview](./00-overview.md)
