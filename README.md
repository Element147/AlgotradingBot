# AlgoTrading Bot

Local-first full-stack algorithmic trading research platform for strategy management, backtesting, risk controls, and paper trading.

This project is research-first and safety-first:
- default behavior is `test`/`paper`
- no live-money trading by default
- no profitability claims without reproducible evidence

## Stack

- Backend: Java 21, Spring Boot 3.4.1, Gradle Kotlin DSL
- Frontend: React 19, TypeScript, Vite, Redux Toolkit, RTK Query, React Router 7, MUI 7
- Local infra: Docker Compose with PostgreSQL and Kafka (`AlgotradingBot/compose.yaml`)

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

These root wrappers orchestrate both backend and frontend:
- `build.ps1` -> full-stack build
- `run.ps1` -> start backend + frontend
- `stop.ps1` -> stop backend + frontend

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
   - `Algorithm` (`BOLLINGER_BANDS`, `SMA_CROSSOVER`, or `BUY_AND_HOLD`)
   - uploaded `Dataset`
   - market/date range/assumptions (fees + slippage)
4. Click `Run Backtest` and monitor status/results in history/details.

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
- `VERIFICATION.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
