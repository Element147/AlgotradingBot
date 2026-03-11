# Quick Start

## Prerequisites

- Docker Desktop running
- Java 21
- Node.js 18+

## Fast Local Run (Recommended)

From repo root:

```powershell
.\build.ps1
.\run.ps1
```

Stop services:

```powershell
.\stop.ps1
```

## URLs

- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/actuator/health
- Swagger UI: http://localhost:8080/swagger-ui.html

## Verification

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build

cd ..\AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

## Notes

- Runtime backend uses PostgreSQL (`AlgotradingBot/compose.yaml`).
- Backend tests/build use H2 in-memory (`test` profile).
- Default safety posture is `test`/`paper`; no live trading by default.
