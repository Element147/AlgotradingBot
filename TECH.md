# Tech

## Stack

### Backend

- Java 25
- Spring Boot `4.0.3`
- Gradle Kotlin DSL
- PostgreSQL runtime
- H2 `test` profile for backend tests and builds
- Liquibase
- Kafka
- Spring WebSocket
- JWT auth
- Micrometer and Prometheus registry

### Frontend

- React `19.2`
- TypeScript `5.9`
- Vite `8.0.0-beta.13`
- Redux Toolkit and RTK Query
- React Router `7.13`
- MUI `7.3`
- Vitest
- ESLint and Prettier

### Shared Tooling

- OpenAPI contract generation via `scripts/sync-openapi-contract.mjs`
- PowerShell orchestration scripts in the repo root
- Docker Compose in `AlgotradingBot/compose.yaml`
- Optional Semgrep and Hoverfly workflows for security-sensitive or mock-provider work

## Standard Commands

Local build and run:

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

Full-stack Docker mode:

```powershell
.\build-all.ps1
.\run-all.ps1
.\stop-all.ps1
```

Backend verification:

```powershell
cd AlgotradingBot
.\gradlew.bat javaMigrationAudit --no-daemon
.\gradlew.bat test
.\gradlew.bat build
```

Frontend verification:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
npm run contract:check
```

Debug and security helpers:

```powershell
.\run.ps1 -DebugBackend
.\run-all.ps1 -DebugBackend
.\security-scan.ps1
```

## Generated Artifacts

- OpenAPI spec: `contracts/openapi.json`
- Generated frontend types: `frontend/src/generated/openapi.d.ts`
- Java migration audit reports: `AlgotradingBot/build/reports/java-migration/`
- Local runtime logs: `.runtime/logs/`

## Technical Standards

1. Use `BigDecimal` for money, pricing, fees, PnL, and risk calculations.
2. Keep DTO boundaries explicit between API and persistence.
3. Prefer immutable DTO records where safe.
4. Keep environment defaults conservative.
5. Keep runtime and test data paths separate.
6. Prefer one current-state technical source per topic instead of duplicating the same rules in multiple docs.
