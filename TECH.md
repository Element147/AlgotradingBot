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

### Frontend

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

### Local Runtime

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

## Engineering Standards

1. Use `BigDecimal` for money/risk precision.
2. Keep DTO boundaries explicit between API and persistence.
3. Prefer immutable DTO records where safe.
4. Keep environment defaults conservative (`test`/`paper`).
