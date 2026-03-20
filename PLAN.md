# Current Plan

## Current Posture

The March 20, 2026 cleanup wave finished the legacy-code removal pass without weakening the `test`/`paper` safety posture.

- The retired `BacktestEngine` and `com.algotrader.bot.strategy.*` seam are gone.
- Dataset upload/import and controller-facing catalog behavior now flows through `BacktestDatasetCatalogService`, while runtime reads and validation use `BacktestDatasetStorageService` and `BacktestDatasetLifecycleService` directly.
- Frontend route-decomposition leftovers, dead barrels, unused helpers, template residue, and redundant `.gitkeep` files were removed.
- Canonical docs now describe the smaller active architecture instead of the deleted seams.

## Recently Completed

1. Removed the legacy backtest engine seam and its dedicated tests.
2. Removed the legacy `strategy/*` package and its dedicated tests.
3. Replaced the generic dataset wrapper with an explicit dataset catalog boundary and direct runtime ownership where appropriate.
4. Swept frontend orphans created by the route and shell migrations, including unused components, helpers, test utilities, and template leftovers.
5. Refreshed `ARCHITECTURE.md`, `STRUCTURE.md`, and `PROJECT_STATUS.md` to match verified reality.
6. Re-ran backend, frontend, security, and runtime verification in both supported local run modes.

## Active Priorities

1. Preserve the single active backtest execution seam and keep canonical docs aligned with it.
2. Carry the March 20 strategy audit and valid-holdout results into paper follow-up without overstating the single-dataset evidence.
3. Extend alerting and review workflows around paper-trading incidents and experiment governance.
4. Add market-data providers only when they close a concrete coverage gap not served by the current free-provider set.
5. Continue hardening runtime and verification flows without weakening safety defaults.

## Verification Baseline

- Backend: `.\gradlew.bat javaMigrationAudit --no-daemon`, `.\gradlew.bat test`, `.\gradlew.bat build`
- Frontend: `npm run contract:check`, `npm run lint`, `npm run test -- --watch=false`, `npm run build`
- Security: `.\security-scan.ps1 -FailOnFindings`
- Runtime smoke: `.\run.ps1` / `.\stop.ps1` and `.\run-all.ps1` / `.\stop-all.ps1`

## Known Non-Gating Warnings

- Frontend tests still emit repeated Node warnings about `--localstorage-file` lacking a valid path.
- Chart tests still emit container-size warnings under jsdom while passing.
- Runtime smoke still surfaces the known `X-Frame-Options` meta-tag warning in the browser.
