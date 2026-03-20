# Current Plan

## Current Posture

The March 20, 2026 cleanup wave finished the legacy-code removal pass without weakening the `test`/`paper` safety posture.
The next delivery focus is a full frontend polish pass that makes the workstation easier for beginners to understand, removes layout overlap risk, and keeps every existing workflow available.

- The retired `BacktestEngine` and `com.algotrader.bot.strategy.*` seam are gone.
- Dataset upload/import and controller-facing catalog behavior now flows through `BacktestDatasetCatalogService`, while runtime reads and validation use `BacktestDatasetStorageService` and `BacktestDatasetLifecycleService` directly.
- Frontend route-decomposition leftovers, dead barrels, unused helpers, template residue, and redundant `.gitkeep` files were removed.
- Canonical docs now describe the smaller active architecture instead of the deleted seams.
- The current shell and several route surfaces are visually denser than they need to be, and some pages still stack too many decorative or structural layers for a beginner-first workflow.

## Recently Completed

1. Removed the legacy backtest engine seam and its dedicated tests.
2. Removed the legacy `strategy/*` package and its dedicated tests.
3. Replaced the generic dataset wrapper with an explicit dataset catalog boundary and direct runtime ownership where appropriate.
4. Swept frontend orphans created by the route and shell migrations, including unused components, helpers, test utilities, and template leftovers.
5. Refreshed `ARCHITECTURE.md`, `STRUCTURE.md`, and `PROJECT_STATUS.md` to match verified reality.
6. Re-ran backend, frontend, security, and runtime verification in both supported local run modes.

## Active Priorities

1. Simplify and polish the full SPA so every core route is easier for beginners to navigate without removing functionality or weakening safety cues.
2. Preserve the single active backtest execution seam and keep canonical docs aligned with it.
3. Carry the March 20 strategy audit and valid-holdout results into paper follow-up without overstating the single-dataset evidence.
4. Extend alerting and review workflows around paper-trading incidents and experiment governance.
5. Add market-data providers only when they close a concrete coverage gap not served by the current free-provider set.
6. Continue hardening runtime and verification flows without weakening safety defaults.

## UI Simplification And Polish Plan

This work follows the existing roadmap principles in `docs/ROADMAP.md`: local-first delivery, safety-first defaults, small reversible increments, and verified behavior before claims.

### Goals

1. Remove overlapping, crowded, or visually competing UI elements across the app shell and feature pages.
2. Make the application understandable for first-time operators without hiding advanced controls.
3. Keep environment mode, risk posture, and paper-vs-live safety cues visible at all times.
4. Replace decorative complexity with a cleaner, more consistent layout system.
5. Preserve all current workflows, contracts, and route coverage while improving clarity.

### Non-Negotiables

- Do not remove or weaken `test` and `paper` safety messaging.
- Do not hide environment mode, connection state, or role context behind ambiguous UI.
- Do not redesign routes in ways that change backend contracts or operational semantics unless separately planned and verified.
- Do not trade usability for novelty; beginner comprehension is the primary quality bar.
- Do not introduce route-specific one-off styling when the same fix belongs in the shared shell or theme.

### Scope

- Shared shell: `AppLayout`, `Header`, `Sidebar`, loading and error fallbacks, and theme-level spacing or surface rules.
- All primary operator routes: `Dashboard`, `Paper`, `Strategies`, `Trades`, `Backtest`, `Market Data`, `Risk`, and `Settings`.
- Shared UI primitives whose current styling contributes to crowding, overlap, or inconsistent hierarchy.

### Delivery Phases

1. Shell cleanup and layout foundations.
   Reduce layered glass effects, gradients, and competing containers in the shared shell. Standardize page width, spacing, header behavior, and responsive structure so route content starts from a calm, stable layout.

2. Navigation and orientation improvements.
   Simplify the sidebar and top bar so users can immediately understand where they are, what mode they are in, and what the next safe action is. Keep only the highest-value status chips visible by default.

3. Beginner-first route simplification.
   Rework each route so the first screen explains the task clearly, places the primary action first, and moves secondary or destructive actions lower in the hierarchy. Remove duplicated hero sections when the shared header already provides route context.

4. Settings-first polish pass.
   Use `Settings` as the reference surface for the new direction: cleaner section switching, clearer form grouping, better mobile stacking, and a stronger distinction between primary forms, summaries, and advanced actions.

5. Cross-route consistency pass.
   Apply the same spacing, typography, card density, empty states, button treatment, and information hierarchy to every major route so the app feels cohesive instead of page-by-page improvised.

6. Final responsive and accessibility sweep.
   Verify desktop, tablet, and mobile behavior; confirm no overlapping elements remain; improve focus visibility, text scaling behavior, and scanability for new users.

### Route-Level Focus Areas

- `Dashboard`: reduce hero density, make the top-level operator summary easier to scan, and surface the most important system signals first.
- `Paper`: keep order entry prominent, simplify state review panels, and reduce visual competition between controls and telemetry.
- `Strategies`: make profile selection, readiness, and configuration flow clearer for first-time users.
- `Trades`: simplify table and filter presentation so review tasks feel lighter and more directed.
- `Backtest`: keep run-launching and results review powerful, but reduce visual overload in the default state.
- `Market Data`: clarify the import workflow and make job state easier to understand at a glance.
- `Risk`: prioritize breaker posture, limits, and operator override context in a clearer hierarchy.
- `Settings`: simplify tab structure, form grouping, saved-connection management, and supporting summaries.

### Design Rules For The UI Pass

- One clear primary action per section.
- Clear heading hierarchy with less duplicated route chrome.
- Fewer nested cards and fewer competing highlighted surfaces.
- Consistent spacing and alignment before adding decorative treatment.
- Concise supporting copy aimed at operators who are new to the workstation.
- Strong empty, loading, and error states that explain what is happening in plain language.
- Desktop and mobile layouts must both remain fully usable.

### Verification Strategy

Start with the narrowest useful checks for each batch of route updates, then expand:

- `npm run lint`
- `npm run test -- --watch=false`
- `npm run build`
- targeted manual responsive verification for each changed route
- targeted Playwright verification when local runtime is available

### Done Criteria For The UI Pass

- Core routes share one coherent shell and spacing system.
- Overlapping or clipped layout issues are removed on supported viewport sizes.
- Beginner-first workflow hierarchy is visible on every primary route.
- Safety-critical mode and risk cues remain prominent and unambiguous.
- No existing functionality is removed.
- Relevant docs stay aligned with the simplified UI structure.

## Verification Baseline

- Backend: `.\gradlew.bat javaMigrationAudit --no-daemon`, `.\gradlew.bat test`, `.\gradlew.bat build`
- Frontend: `npm run contract:check`, `npm run lint`, `npm run test -- --watch=false`, `npm run build`
- Security: `.\security-scan.ps1 -FailOnFindings`
- Runtime smoke: `.\run.ps1` / `.\stop.ps1` and `.\run-all.ps1` / `.\stop-all.ps1`

## Known Non-Gating Warnings

- Frontend tests still emit repeated Node warnings about `--localstorage-file` lacking a valid path.
- Chart tests still emit container-size warnings under jsdom while passing.
- Runtime smoke still surfaces the known `X-Frame-Options` meta-tag warning in the browser.
