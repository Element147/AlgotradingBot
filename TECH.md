# TECH

## Stack

### Backend

- Java 21
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

## Core Commands

### Backend

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

Backend compilation now enables `-Xlint:deprecation`, so deprecated API usage is surfaced during normal verification instead of being hidden in compiler summaries.

### Frontend

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
npm run contract:check
```

### Local Runtime

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

Runtime discipline:

- Never start a frontend or backend dev server until existing instances are checked and stopped first.
- If you start a frontend or backend server for a task, stop it before ending the session.

### Backup Runbook

- `/api/system/backup` now creates a real database artifact.
- Test/build profile uses H2 `SCRIPT` exports.
- Runtime PostgreSQL uses `pg_dump`, with a Docker `exec` fallback aligned to `AlgotradingBot/compose.yaml`.

### CI

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Backend gate: Gradle `test` + `build`
- Frontend gate: `contract:check` + `lint` + `test` + `build`

## Security Runbook

Default local auth posture:

- `algotrading.security.relaxed-auth=false`
- normal local login uses seeded credentials unless replaced
- verification should be performed with strict auth enabled

Dev-only override:

```powershell
$env:ALGOTRADING_RELAXED_AUTH='true'
cd AlgotradingBot
.\gradlew.bat bootRun
Remove-Item Env:ALGOTRADING_RELAXED_AUTH
```

Use the override only for isolated local debugging. Never leave it enabled for baseline verification, CI, or shared demonstrations.

## Engineering Standards

1. Use `BigDecimal` for money/risk precision.
2. Keep DTO boundaries explicit between API and persistence.
3. Prefer immutable DTO records where safe.
4. Keep environment defaults conservative (`test`/`paper`).
