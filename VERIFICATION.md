# Verification

Audit date: March 10, 2026

## Current Results

- Frontend `npm run lint`: PASS
- Frontend `npm run test`: PASS (`389/389`)
- Frontend `npm run build`: PASS
- Backend `.\gradlew.bat check`: PASS
- Root scripts:
  - `.\stop-all.ps1`: PASS
  - `.\build-all.ps1`: PASS
  - `.\run-all.ps1`: PASS

## Runtime Smoke Checks

- `http://localhost:8080/actuator/health`: PASS (`200`)
- `http://localhost:8080/swagger-ui.html`: PASS (`200`)
- `http://localhost:5173`: PASS (`200`)
- `http://localhost:5173/login`: PASS (`200`)

## Verification Standard

For any feature change, run:

```powershell
cd frontend
npm run lint
npm run test
npm run build
cd ..
cd AlgotradingBot
.\gradlew.bat check
cd ..
```

If the change is cross-stack or orchestration-related, also run:

```powershell
.\stop-all.ps1
.\build-all.ps1
.\run-all.ps1
```
