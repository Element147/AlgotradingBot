# TECH

## Purpose

Slim technical index for stack, standard commands, and deeper runbooks.

## Stack

### Backend

- Java 25
- Spring Boot 4.0.3
- Gradle Kotlin DSL
- PostgreSQL (runtime)
- H2 in-memory (tests)
- Kafka, WebSocket, JWT auth

### Frontend

- React 19 + TypeScript
- Vite
- Redux Toolkit + RTK Query
- React Router 7
- MUI 7
- Vitest + ESLint + Prettier

## Standard Commands

Fast local runtime:

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

Backend verification:

```powershell
cd AlgotradingBot
.\gradlew.bat javaMigrationAudit --no-daemon
.\gradlew.bat test
.\gradlew.bat build
```

Backend debug:

```powershell
.\run.ps1 -DebugBackend
.\run-all.ps1 -DebugBackend
```

Frontend verification:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
npm run contract:check
```

Optional security scan:

```powershell
.\security-scan.ps1
```

## Deeper Guides

- `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
- `docs/guides/BACKEND_IMPLEMENTATION.md`
- `docs/guides/FRONTEND_IMPLEMENTATION.md`
- `docs/guides/MARKET_DATA_RESEARCH.md`

## Engineering Standards

1. Use `BigDecimal` for money/risk precision.
2. Keep DTO boundaries explicit between API and persistence.
3. Prefer immutable DTO records where safe.
4. Keep environment defaults conservative (`test`/`paper`).
5. Prefer reclaim-friendly runtime defaults over long-lived idle memory holds.
