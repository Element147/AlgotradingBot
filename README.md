# AlgoTrading Bot

Local-first full-stack algorithmic trading research platform for strategy management, backtesting, risk controls, and paper trading.

This project is research-first and safety-first:
- default behavior is `test`/`paper`
- no live-money trading by default
- no profitability claims without reproducible evidence

## Stack

- Backend: Java 21, Spring Boot 4.0.3, Gradle Kotlin DSL (wrapper 9.4.0)
- Frontend: React 19, TypeScript, Vite, Redux Toolkit, RTK Query, React Router 7, MUI 7
- Local infra: Docker Compose for PostgreSQL (`AlgotradingBot/compose.yaml`)

## Database Mode Policy

- Runtime backend (`bootRun` / app start) uses PostgreSQL (`jdbc:postgresql://localhost:5432/algotrading`) and expects Docker DB to be running.
- Backend tests (`.\gradlew.bat test`, `.\gradlew.bat build`) run with Spring `test` profile on H2 in-memory database.
- Build/test flow must not require Docker PostgreSQL.
- Liquibase runs on runtime PostgreSQL startup and seeds default admin credentials (`admin` / `dogbert`) on first migration run.

## Direct CMD Commands

Use these directly from Windows `cmd`:

```cmd
cd /d C:\Git\algotradingbot\AlgotradingBot && docker compose -f compose.yaml up -d postgres
cd /d C:\Git\algotradingbot\AlgotradingBot && gradlew.bat clean build
cd /d C:\Git\algotradingbot\AlgotradingBot && gradlew.bat bootRun
cd /d C:\Git\algotradingbot\frontend && npm run build
cd /d C:\Git\algotradingbot\frontend && npm run dev
```

## MVP Status (March 10, 2026)

Implemented and wired end-to-end:
- Strategy Management MVP (backend endpoints + frontend working page)
- Backtest MVP (run + history/details with fees/slippage metadata)
- Risk Controls MVP (config + circuit breaker status/override safeguards)
- Paper Trading MVP (minimal order lifecycle + dashboard paper state)

No placeholder pages remain for:
- Strategies (`/strategies`)
- Backtest (`/backtest`)
- Risk (`/risk`)

## Local Start (Exact Commands)

From repo root (`C:\Git\algotradingbot`):

```powershell
.\build.ps1
.\run.ps1
```

These root wrappers orchestrate local development:
- `.\build.ps1` -> full-stack build
- `.\run.ps1` -> start PostgreSQL (Docker), backend (local), frontend (local)
- `.\stop.ps1` -> stop backend + frontend local processes and PostgreSQL container

Stop all services:

```powershell
.\stop.ps1
```

## Local URLs

- Frontend: http://localhost:5173
- Backend Health: http://localhost:8080/actuator/health
- Swagger UI: http://localhost:8080/swagger-ui.html

## Local Backtest Workflow

1. Open `http://localhost:5173/backtest`.
2. In `Dataset Upload`, select your local CSV and upload it.
3. In `Run Backtest`, choose:
   - `Algorithm` from the full research catalog exposed by the backend
   - uploaded `Dataset`
   - market/date range/assumptions (fees + slippage)
4. Strategy behavior depends on execution mode:
   - `SINGLE_SYMBOL` strategies use one symbol from the dataset
   - `DATASET_UNIVERSE` strategies automatically use all dataset symbols
5. Click `Run Backtest` and monitor status/results in history/details.

CSV format expected:

```text
timestamp,symbol,open,high,low,close,volume
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

Backend verification commands above do not require PostgreSQL Docker container.

Cross-stack orchestration:

```powershell
cd C:\Git\algotradingbot
.\stop.ps1
.\build.ps1
.\run.ps1
```

## Key Docs

- `AGENTS.md`
- `PROJECT_STATUS.md`
- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`
- `docs/BACKTEST_STRATEGY_REFACTOR.md`
- `docs/GREENFIELD_STRATEGY_IMPLEMENTATION.md`
- `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`
- `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md`
- `docs/USER_WORKFLOW_GUIDE.md`
- `VERIFICATION.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
