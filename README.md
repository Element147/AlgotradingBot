# AlgoTrading Bot

Local-first full-stack algorithmic trading research platform.

This project is designed for safe iteration on strategy research, backtesting, and paper-trading workflows. It does not assume or claim live profitability.

## Current Stack

- Backend: Java 21, Spring Boot 3.4.1, Gradle Kotlin DSL
- Frontend: React 19.2.0, TypeScript, Vite 8 beta, Redux Toolkit, React Router 7.13.1, MUI 7.3.9
- Infra: Docker Compose (`AlgotradingBot/compose.yaml`) with PostgreSQL 16 and Kafka 7.6.0

## Quick Start

```powershell
.\build-all.ps1
.\run-all.ps1
```

Open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/actuator/health
- Swagger UI: http://localhost:8080/swagger-ui.html

Stop:

```powershell
.\stop-all.ps1
```

## Local Dev Commands

Backend:

```powershell
cd AlgotradingBot
.\gradlew.bat check
.\gradlew.bat test
```

Frontend:

```powershell
cd frontend
npm run lint
npm run test
npm run build
```

## Safety Defaults

- Default environment behavior should be `test` or `paper`.
- Do not connect to real-money live trading by default.
- Do not present simulated/backtest results as guaranteed returns.
- Keep risk controls and environment separation intact.

## Repo Layout

```text
AlgotradingBot/   Spring Boot backend
frontend/         React + TypeScript frontend
.kiro/            product specs and steering docs
docs/             roadmap and acceptance criteria
```

## Key Docs

- `AGENTS.md`
- `PROJECT_STATUS.md`
- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `QUICK_START.md`
- `VERIFICATION.md`

## Verification Snapshot (March 10, 2026)

- Frontend lint passes
- Frontend tests pass (`389/389`)
- Frontend build passes
- Backend `.\gradlew.bat check` passes
- Root scripts `build-all`, `run-all`, `stop-all` pass
