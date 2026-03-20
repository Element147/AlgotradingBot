# Legacy And Unused Code Removal Plan

## Mission

Remove code, tests, and docs that are no longer needed after the active backend and frontend migrations, while preserving the current `test` and `paper` safety posture and without weakening risk, auth, audit, or operator controls.

## Planning Principles

- Delete only seams that are proven inactive in the current runtime path.
- Prefer full removal over permanent quarantine once an inactive seam has a verified replacement.
- Do not remove compatibility code that still protects persisted data or operator workflows.
- Keep controller, service, repository, and DTO boundaries clean while simplifying.
- Preserve the React/Vite SPA and the current feature-based frontend structure.
- Run the narrowest useful verification first, then broaden only when a removal crosses more boundaries.
- Update docs in the same change that removes a seam so the repo does not drift back into mixed narratives.

## Verified Starting Point

The current verified active backtest runtime is:

- `BacktestManagementController -> BacktestManagementService -> BacktestExecutionService -> BacktestSimulationEngine -> backtest.strategy.*`

The strongest removal candidates already proven by code search and current docs are:

1. `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestEngine.java`
   - It still compiles as a Spring component, but current controllers and services do not dispatch production backtests through it.
   - It imports only the legacy `com.algotrader.bot.strategy.*` seam.
2. `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/*`
   - `BollingerBandIndicator.java`
   - `BollingerBands.java`
   - `BollingerBandStrategy.java`
   - `SignalType.java`
   - `TradeSignal.java`
   - These files are currently coupled to `BacktestEngine`, not the active `backtest.strategy.*` runtime.
3. Legacy tests tied to the old seam
   - `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/BacktestEngineTest.java`
   - `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/BacktestIntegrationTest.java`
   - `AlgotradingBot/src/test/java/com/algotrader/bot/strategy/*`
4. Thin wrapper service to re-evaluate after the first removal wave
   - `AlgotradingBot/src/main/java/com/algotrader/bot/service/BacktestDatasetService.java`
   - It now fronts `BacktestDatasetStorageService` and `BacktestDatasetLifecycleService`; it may still be useful, but it should be reviewed as a likely cleanup candidate once the obvious dead seam is gone.

Known non-candidates for the first removal wave:

- `ExchangeCredentialCipher` legacy decryption support
- `MarketDataCredentialCipher` legacy decryption support
- `BacktestValidator`, `MonteCarloSimulator`, and related validation models
- Weak but still active catalog strategies such as `BOLLINGER_BANDS`

Those paths may be ugly or backward-looking, but they still serve either persisted-data compatibility or active runtime behavior.

## Scope

This cleanup plan covers:

- backend legacy runtime seams
- backend tests that only protect deleted seams
- thin service wrappers that may no longer add value
- frontend orphaned files left behind by route decomposition
- stale docs that still mention removed seams as if they were active

This cleanup plan does not include:

- removing active research strategies only because they are weak
- removing compatibility code needed to read already-persisted secrets or data
- changing safety defaults, auth posture, or paper-trading behavior
- broad architectural rewrites unrelated to verified dead code

## Removal Phases

### Phase 0. Freeze The Removal Inventory

- Re-run reference checks for `BacktestEngine`, `com.algotrader.bot.strategy`, and `BacktestDatasetService`.
- Confirm that no runtime controller, scheduler, or startup-recovery path still depends on the legacy engine seam.
- Confirm that active backtest coverage already exists through `BacktestSimulationEngine` and the registry-based strategy tests.
- Capture the explicit keep-list for compatibility code that must survive this cleanup pass.

Primary agents:

- `architect-reviewer`
- `reviewer`
- `java-architect`

Verification:

- targeted `git grep` and import-graph review
- targeted backend compile or test checks before deletion

Acceptance:

- every removal candidate has proof of inactivity
- every compatibility exception has a written reason

### Phase 1. Remove The Legacy Backtest Engine Seam

- Delete `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestEngine.java`.
- Remove or migrate any configuration or bean wiring that only exists for that engine.
- Delete tests that only validate `BacktestEngine` behavior.
- Keep or expand active-engine tests where a deleted legacy test was the last coverage for a still-important behavior.

Primary agents:

- `java-architect`
- `spring-boot-engineer`
- `reviewer`

Verification:

- targeted backend tests around `BacktestSimulationEngine`, strategy catalog integration, telemetry, and management controller flows
- `.\gradlew.bat test`

Acceptance:

- the repository no longer compiles or tests against `BacktestEngine`
- active-engine coverage still proves backtest execution behavior

### Phase 2. Remove The Legacy `strategy/*` Package

- Delete `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/*`.
- Delete `AlgotradingBot/src/test/java/com/algotrader/bot/strategy/*`.
- If any utility in that package still has value, migrate it into `backtest/strategy/*` first and then remove the original.
- Verify that no active package, docs, or tests still import `com.algotrader.bot.strategy.*`.

Primary agents:

- `architect-reviewer`
- `java-architect`
- `reviewer`

Verification:

- targeted backend tests for active strategy helpers and active Bollinger behavior
- `.\gradlew.bat test`
- `.\gradlew.bat build`

Acceptance:

- no source import remains for `com.algotrader.bot.strategy`
- only one backtest strategy seam remains in the codebase

### Phase 3. Collapse Thin Dataset Facades If They No Longer Add Value

- Review `BacktestDatasetService` method by method.
- Decide whether it should:
  - stay as an intentional command facade, or
  - split into explicit dataset command or query services, or
  - be removed in favor of direct use of `BacktestDatasetStorageService` and `BacktestDatasetLifecycleService`.
- Remove the wrapper only if the resulting controller and service dependencies stay simpler, not noisier.
- Keep operator-audit behavior explicit and preserved if upload or import flows move.

Primary agents:

- `spring-boot-engineer`
- `java-architect`
- `reviewer`

Verification:

- targeted dataset controller and backtest execution tests
- `.\gradlew.bat test`
- `.\gradlew.bat build`
- `.\run.ps1` backend smoke if the controller wiring changes

Acceptance:

- dataset ownership is simpler than before
- no behavior is hidden behind pass-through wrappers without a reason

### Phase 4. Sweep Frontend Orphans After Route Decomposition

- Audit `frontend/src/features/*`, `frontend/src/components/*`, and `frontend/src/services/*` for files left behind by the route refactors.
- Remove feature panels, helpers, or transport adapters that are no longer imported anywhere.
- Remove duplicated component shells if the shared workstation layout now fully owns that concern.
- Preserve the current feature-first organization and the generated-contract plus adapter boundary.

Primary agents:

- `react-specialist`
- `typescript-pro`
- `reviewer`

Verification:

- `npm run lint`
- `npm run test -- --watch=false`
- `npm run build`
- `npm run contract:check` if transport or contract helpers change

Acceptance:

- every remaining frontend file has an active owner and import path
- no dead page shells or duplicated adapters remain

### Phase 5. Retire Stale Docs And Finalize The Current-State Narrative

- Update `ARCHITECTURE.md`, `STRUCTURE.md`, `PROJECT_STATUS.md`, and any relevant guides to stop describing removed seams as quarantined once they are gone.
- Remove doc references that imply both legacy and active paths still matter when only the active path remains.
- Record any compatibility code intentionally retained and why it was not removed.
- Reset `PLAN.md` again after this cleanup wave finishes so the next plan starts from the new smaller system.

Primary agents:

- `docs-researcher`
- `architect-reviewer`
- `reviewer`

Verification:

- `.\gradlew.bat test`
- `npm run build`
- runtime smoke only if docs accompany runtime-facing cleanup

Acceptance:

- docs match the smaller codebase
- future sessions do not have to rediscover which seams are gone

## Execution Order

1. Prove the current removal inventory again with reference searches.
2. Delete `BacktestEngine` and its dedicated tests.
3. Delete `com.algotrader.bot.strategy.*` and its dedicated tests.
4. Re-run backend verification and fix any active-path coverage holes exposed by those deletions.
5. Review `BacktestDatasetService` and decide whether to keep, split, or remove it.
6. Sweep frontend orphan files created by the route and shell migrations.
7. Remove stale docs and rewrite the architecture narrative around the smaller active seam.
8. Run final regression gates relevant to the touched areas.

## Verification Gates

Backend-heavy removal:

- targeted backend tests first
- `.\gradlew.bat test`
- `.\gradlew.bat build`
- `.\gradlew.bat javaMigrationAudit --no-daemon` if runtime-sensitive Java changes spill beyond dead-code deletion

Frontend-heavy removal:

- `npm run lint`
- `npm run test -- --watch=false`
- `npm run build`
- `npm run contract:check` when transport helpers or generated-type boundaries change

Runtime smoke when wiring changes:

- `.\run.ps1`
- login plus one authenticated workflow
- `.\stop.ps1`

Security scan when request-boundary or script code changes:

- `.\security-scan.ps1 -FailOnFindings`

## Risks And Controls

- Risk: a supposedly dead seam still supports edge-case tests or startup recovery.
  - Control: require reference proof before deletion and keep active-engine integration coverage green.
- Risk: removing the dataset facade makes controller wiring noisier.
  - Control: treat facade removal as conditional, not mandatory.
- Risk: frontend orphan cleanup accidentally removes code only reachable through lazy routes.
  - Control: pair import-graph checks with `npm run build` and route-level test coverage.
- Risk: docs overstate what was removed and hide intentionally retained compatibility logic.
  - Control: keep a written non-candidate list and update it when decisions change.

## Definition Of Done

- `BacktestEngine` and the old `com.algotrader.bot.strategy.*` seam are gone if no hidden dependency survives review.
- Tests that existed only for deleted seams are gone or replaced by active-path coverage.
- Any retained wrapper or compatibility path has an explicit reason to remain.
- Frontend orphan files left by the migration are removed.
- Docs describe one active backtest architecture without legacy hedging where it no longer applies.
- Verification is green or any remaining blocker is documented plainly in `PROJECT_STATUS.md`.
