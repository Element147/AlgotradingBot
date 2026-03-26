# Testing And Contract Guide

Use this guide when the task touches verification, CI parity, generated contracts, or backend/frontend boundaries.

## Verification Strategy

1. Start with the narrowest useful check.
2. Expand only as far as the change requires.
3. If unrelated failures already exist, report them instead of hiding them.

## Frontend Verification

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

Use targeted Vitest execution first when that is enough.

## Backend Verification

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

Add the Java audit when toolchain-sensitive code is touched:

```powershell
.\gradlew.bat javaMigrationAudit --no-daemon
```

Use these profiling runners when work targets known performance hotspots and you need a reproducible timing record:

```powershell
cd AlgotradingBot
.\gradlew.bat backendWorkflowProfile

cd ..\frontend
npm run profile:backtest
```

The generated reports land in `AlgotradingBot/build/reports/backend-workflow-profile/report.md` and `frontend/build/reports/backtest-page-profile/report.md`.

Notes:

- Runtime uses PostgreSQL.
- Tests and `build` use the H2 `test` profile unless runtime services are explicitly needed.
- Java audit reports are written under `AlgotradingBot/build/reports/java-migration/`.

## OpenAPI Contract Workflow

Tracked artifacts:

- `contracts/openapi.json`
- `frontend/src/generated/openapi.d.ts`

Generation script:

- `scripts/sync-openapi-contract.mjs`

Typical check:

```powershell
cd frontend
npm run contract:check
```

If the backend API changed intentionally:

```powershell
cd frontend
npm run contract:generate
```

`contract:check` stays non-zero until tracked artifacts match the generated output.

Contract ownership model:

- Treat generated OpenAPI artifacts as the transport source of truth.
- Normalize generated request and response shapes in one API-slice or transport-helper boundary before they reach page components.
- Keep component-facing models explicit and stable even when generated schemas contain optional transport fields.
- Encode selection-mode rules in DTOs and adapters instead of inventing placeholder values in the UI.

## CI Order

Current CI baseline:

- Backend: `javaMigrationAudit`, `test`, `build`
- Frontend: `contract:check`, `lint`, `test`, `build`

Mirror that ordering locally when a change crosses the contract boundary.

## Optional Security Scan

Use Semgrep for auth, secrets, request parsing, shell execution, WebSocket handling, or automation changes:

```powershell
.\security-scan.ps1
.\security-scan.ps1 -FailOnFindings
```

## Runtime Smoke Checks

When orchestration, Docker, or runtime config changes, mirror the runbooks:

```powershell
.\run.ps1
.\stop.ps1
.\run-all.ps1
.\stop-all.ps1
```

Runtime smoke guidance:

- Prefer `.\run.ps1` when you need to validate the current local backend source tree, because it runs the backend with local `bootRun`.
- Use `.\run-all.ps1` when you specifically need the Docker-backed full stack; rebuild the compose app image first if you expect backend code changes to be present there.
- For large active backtests, prefer history or progress polling while the run is in flight. The detail endpoint intentionally withholds heavy telemetry until completion, and completed detail payloads can be large.
