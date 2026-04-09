# Verification Matrix

Use the narrowest meaningful checks first.

- Frontend-only UI or state work:
  `cd frontend`, then `npm run lint`, targeted `npm run test -- --watch=false`, and `npm run build` if the route or shared shell changed.
- Backend-only service, controller, or repository work:
  `cd AlgotradingBot`, then `.\gradlew.bat test` and `.\gradlew.bat build` sequentially.
- Toolchain-sensitive backend work:
  add `.\gradlew.bat javaMigrationAudit --no-daemon`.
- Contract boundary changes:
  `cd frontend`, then `npm run contract:check`; if the backend API intentionally changed, run `npm run contract:generate`.
- Runtime or orchestration changes:
  use `.\run.ps1` or `.\run-all.ps1`, then stop with the matching stop script before finishing.
- PowerShell, Docker, auth, WebSocket, or secrets changes:
  run `.\security-scan.ps1` and prefer `-FailOnFindings` when the change is substantial.

Keep the repo default verification order:

1. narrow local tests
2. contract checks when the transport surface moves
3. runtime DB inspection only when persistence affects the bug
4. Playwright/browser automation after the page exposes stable labels or selectors
