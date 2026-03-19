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
