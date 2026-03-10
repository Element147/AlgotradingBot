# VERIFICATION

Verification date: March 10, 2026
Workspace: `C:\Git\algotradingbot`

## Commands Run And Results

### Frontend (`frontend/`)

- `npm run lint` -> PASS
- `npm run test -- --watch=false` -> PASS (`37/37` files, `396/396` tests)
- `npm run build` -> PASS

### Backend (`AlgotradingBot/`)

- `.\gradlew.bat test` -> PASS
- `.\gradlew.bat build` -> PASS

### Root orchestration (`C:\Git\algotradingbot`)

- `.\stop-all.ps1` -> PASS
- `.\build-all.ps1` -> PASS
- `.\run-all.ps1` -> PASS

## Runtime URL Checks

After `run-all.ps1` startup completion:

- `http://localhost:5173` -> `200`
- `http://localhost:8080/actuator/health` -> `200`
- `http://localhost:8080/swagger-ui.html` -> `200`

Note: immediately after service boot there can be a short warm-up window before backend HTTP checks succeed; recheck after startup completes.

## Observed Non-Blocking Test Noise

- Vitest output includes expected warning noise (for example `--localstorage-file` warnings and intentional error-path logging in some tests).
- These did not cause test failures in the verified run.

## Minimum Verification Standard For Future Changes

```powershell
cd C:\Git\algotradingbot\frontend
npm run lint
npm run test -- --watch=false
npm run build

cd C:\Git\algotradingbot\AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build

cd C:\Git\algotradingbot
.\stop-all.ps1
.\build-all.ps1
.\run-all.ps1
```
