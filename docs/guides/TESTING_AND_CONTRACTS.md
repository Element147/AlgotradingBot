# Testing and Contract Guide

Read this guide when the task touches verification, generated contracts, CI-aligned checks, or backend/frontend boundary work.

## Verification Strategy

- Start with the narrowest useful check first.
- Expand to broader verification only after the targeted check passes or when the task clearly affects more of the stack.
- If existing unrelated failures exist, report them instead of hiding them.

## Frontend Verification

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

Use targeted Vitest commands first when possible, then fall back to the full suite.

## Backend Verification

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

- Runtime uses PostgreSQL.
- Tests and `build` use the H2 `test` profile unless a task explicitly needs runtime services.

## OpenAPI Contract Workflow

Current checked-in contract artifacts:

- `contracts/openapi.json`
- `frontend/src/generated/openapi.d.ts`

Typical commands:

```powershell
cd frontend
npm run contract:check
```

If the backend API changed and the generated contract is expected to move, regenerate the contract using the repo's current generation flow before running the check.

`contract:check` compares generated artifacts with the tracked versions, so it stays non-zero until those generated changes are updated in git.

## CI Alignment

GitHub Actions baseline:

- Backend: `test` + `build`
- Frontend: `contract:check` + `lint` + `test` + `build`

Local verification should mirror that ordering when the task crosses the frontend/backend contract boundary.

## Optional Security Scan

Use the local Semgrep wrapper when a task touches auth, secrets, request parsing, or dependency-facing security-sensitive code:

```powershell
.\security-scan.ps1
```

To make findings fail the command:

```powershell
.\security-scan.ps1 -FailOnFindings
```

Run Semgrep by default for:

- auth or session changes
- secret or credential handling
- process execution or script orchestration changes
- WebSocket or HTTP boundary parsing
- Docker or local automation changes

During a security cleanup, `-FailOnFindings` is the zero-findings gate.
