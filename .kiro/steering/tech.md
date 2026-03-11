---
inclusion: always
---

# Technology Stack and Standards

## Repository Shape

```text
repository-root/
  AlgotradingBot/      Spring Boot backend
  frontend/            React TypeScript frontend
  .kiro/               steering and spec context
  docs/                canonical roadmap/acceptance docs
```

## Backend Stack (Source: `AlgotradingBot/build.gradle.kts`)

- Java 21
- Spring Boot 4.0.3
- Gradle Kotlin DSL
- Liquibase
- PostgreSQL runtime
- H2 for tests (`test` profile)
- Kafka integration
- Micrometer Prometheus
- JUnit 5 + Mockito

Typical backend commands:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

## Frontend Stack (Source: `frontend/package.json`)

- React 19
- TypeScript strict mode
- Vite 8 beta
- Redux Toolkit + RTK Query
- React Router 7
- MUI 7
- Vitest + React Testing Library
- ESLint + Prettier

Typical frontend commands:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

## Local Orchestration

Preferred scripts from repo root:

- `build.ps1`
- `run.ps1`
- `stop.ps1`

Compatibility wrappers still exist:

- `build-all.ps1`
- `run-all.ps1`
- `stop-all.ps1`

## Engineering Rules

- Preserve Spring Boot + React/Vite architecture unless explicitly approved.
- Keep financial precision on `BigDecimal` in backend money/risk paths.
- Prefer immutable DTOs as records where safe.
- Keep environment defaults conservative (`test`/`paper`).
- Never claim profitability without reproducible evidence.
