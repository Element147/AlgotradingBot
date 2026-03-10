---
inclusion: always
---

# Technology Stack and Standards

## Repository Shape

```text
repository-root/
  AlgotradingBot/      Spring Boot backend
  frontend/            React TypeScript frontend
  .kiro/               specs and steering
  docs/                roadmap and acceptance criteria
```

## Backend Stack (Source of Truth: `AlgotradingBot/build.gradle.kts`)

- Java 21 toolchain
- Spring Boot 3.4.1
- Gradle Kotlin DSL
- PostgreSQL runtime driver
- Apache Kafka integration
- Resilience4j
- Micrometer Prometheus registry
- JUnit 5 and Mockito

Use from `AlgotradingBot`:

```powershell
.\gradlew.bat check
.\gradlew.bat test
.\gradlew.bat build
```

## Frontend Stack (Source of Truth: `frontend/package.json`)

- React 19.2.0
- TypeScript strict mode
- Vite 8 beta
- Redux Toolkit and RTK Query
- React Router 7.13.1
- Material UI 7.3.9
- Vitest and React Testing Library
- ESLint and Prettier

Use from `frontend`:

```powershell
npm run lint
npm run test
npm run build
```

## Local Orchestration

- Compose file: `AlgotradingBot/compose.yaml`
- Root helper scripts:
  - `build-all.ps1`
  - `run-all.ps1`
  - `stop-all.ps1`

## Rules for Autonomous Work

- Preserve Spring Boot + React/Vite architecture.
- Keep financial precision with `BigDecimal` on backend money/risk paths.
- Keep environment behavior conservative (`test`/`paper` first).
- Never claim profitability without reproducible evidence.
- Do not enable real-money live trading by default.
