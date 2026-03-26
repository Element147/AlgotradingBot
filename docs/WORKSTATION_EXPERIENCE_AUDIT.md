# Workstation Experience Audit

Audit date: March 26, 2026

This document records the current workstation audit required by `FEATURE_DEVELOPMENT_PLAN.md` task `2A.1`.
It reviews the implemented SPA shell and route surfaces as they exist today and defines the baseline for the next execution-workspace redesign steps.

## Scope Reviewed

- Shared shell:
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/Sidebar.tsx`
  - `frontend/src/components/layout/PageContent.tsx`
  - `frontend/src/components/ui/Workbench.tsx`
- Route surfaces:
  - `frontend/src/features/dashboard/DashboardPage.tsx`
  - `frontend/src/features/backtest/BacktestPage.tsx`
  - `frontend/src/features/backtest/BacktestResults.tsx`
  - `frontend/src/features/paper/PaperTradingPage.tsx`
  - `frontend/src/features/strategies/StrategiesPage.tsx`
  - `frontend/src/features/trades/TradesPage.tsx`
  - `frontend/src/features/marketData/MarketDataPage.tsx`
  - `frontend/src/features/risk/RiskPage.tsx`
  - `frontend/src/features/settings/SettingsPage.tsx`

## Baseline To Preserve

The current redesign recorded as completed in `PLAN.md` is the baseline for future frontend work.
This audit does not propose undoing the implemented shell, workstation theme, shared page grammar, or the Backtest chart-first research workspace.

The current strengths that should be preserved are:

- A consistent shell with route-aware title, subtitle, mode, telemetry, risk, and exchange context in the header.
- A grouped sidebar that already teaches the current safe workflow: Dashboard, Backtest, then Paper.
- Shared `PageContent`, `PageIntro`, metric-strip, and `Workbench` primitives that keep spacing and surface language coherent across routes.
- A flagship Backtest workspace that already proves the product can support linked chart, trade, and inspector review.

## Current Shared-Shell Responsibility Map

### Header

Primary responsibilities:

- Own route title and explanatory subtitle.
- Keep safety posture visible through mode, telemetry, risk, and exchange chips.
- Hold account access, theme toggle, and notification entry.

What belongs here:

- Persistent operator context.
- Cross-route safety cues.
- Session-level actions.

What should not be pushed here next:

- Tab-specific execution controls.
- Dense route-level filters.
- Secondary workflow help that competes with route content.

### Sidebar

Primary responsibilities:

- Teach the overall workstation flow.
- Group routes into command, research, and operations.
- Keep the default-safe path visible.

What belongs here:

- Stable navigation.
- Safety framing.
- Execution-workspace entry point once introduced.

What should not be pushed here next:

- Live operational state details that need fast refresh.
- Route-specific subnavigation that is only meaningful after a route loads.

### PageContent and Workbench primitives

Primary responsibilities:

- Standardize route spacing, intros, metric strips, section headers, panels, pills, legends, and empty states.
- Keep dense pages from improvising incompatible layout patterns.

What belongs here:

- Shared presentation grammar.
- Reusable workstation surfaces.
- Sticky action-bar and inspector primitives.

What should not be pushed here next:

- Feature-specific data shaping.
- Route-specific business logic.

## Route-By-Route Responsibility Map

### Dashboard

Current dominant job:

- Answer "What needs attention now?"

Current responsibilities:

- Show overall operating mode and safe research path.
- Surface system health, paper status, balances, performance, positions, and recent trades.
- Expose admin-only audit visibility without making it primary for non-admin users.

Should remain responsible for:

- High-level posture.
- Next-step guidance.
- Attention management.

Should not absorb:

- Detailed execution controls.
- Backtest evidence review.
- Deep strategy editing.

### Backtest

Current dominant job:

- Run research experiments and inspect what happened, where, and why.

Current responsibilities:

- Dataset upload, archive, restore, and download.
- Backtest launch and replay.
- Experiment summaries and run history.
- Active-run progress tracking.
- Completed-run research workspace with chart, overlays, trade table, inspector, and analytics.
- URL-deep-linkable selection and comparison state.

Should remain responsible for:

- Research and replay.
- Evidence review.
- Compare and export workflows.

Should not absorb:

- Paper or live execution ownership.
- Forward-testing observation workflows.

### Proposed Execution Workspace

Dominant job:

- Own active strategy observation and execution context without coupling it to research routes.

Responsibilities that should move here from adjacent surfaces:

- Forward-testing observation and investigation.
- Paper strategy ownership and active-state drill-down.
- Future live monitoring and approved live capability gating.

Responsibilities that should stay out:

- Backtest dataset management.
- Historical research-run comparison.
- Global shell posture.

### Paper

Current dominant job:

- Provide a single simulated order desk.

Current responsibilities:

- Manual paper order entry.
- Current paper state summary.
- Order list with fill and cancel actions.

Responsibilities that likely remain after execution-workspace split:

- Manual paper desk or paper-order utility.

Responsibilities that likely migrate into the future execution workspace:

- Active algorithm review.
- Strategy-owned paper execution state.
- Signal-to-order explainability.

### Strategies

Current dominant job:

- Teach the strategy catalog and edit saved configurations.

Current responsibilities:

- Present strategy guide cards.
- Show saved configs and status.
- Start and stop paper-mode strategies.
- Open config editor.

Should remain responsible for:

- Catalog understanding.
- Configuration authoring.
- Readiness framing.

Should not stay responsible for long term:

- Rich execution-state monitoring.
- Active algorithm drill-down.

### Market Data

Current dominant job:

- Run the provider-import control room.

Current responsibilities:

- Provider selection.
- Scope definition.
- Job creation.
- Retry-aware job monitoring.
- Dataset handoff back to the Backtest catalog.

Should remain responsible for:

- Import workflows.
- Import failure visibility.
- Provider prerequisites.

Should not absorb:

- Research-run dataset analysis.
- Execution-workspace state.

### Trades

Current dominant job:

- Filter, inspect, and export fills.

Current responsibilities:

- Filter draft management.
- URL-persisted review state.
- Sorting, pagination, CSV export, and detail modal.

Should remain responsible for:

- Evidence review across fills.
- Export and tabular analysis.

Should not absorb:

- Chart-first signal explanation for active algorithms.

### Risk

Current dominant job:

- Keep protection posture primary.

Current responsibilities:

- Show breaker posture and recent alerts.
- Allow audited override flow.
- Edit risk config.
- Provide position-sizing support.

Should remain responsible for:

- Guardrails.
- Overrides.
- Risk telemetry.

Should not absorb:

- Strategy execution ownership.
- Shell-wide alert center behavior.

### Settings

Current dominant job:

- Provide calmer access to preferences, connections, audit, and sensitive operator tooling.

Current responsibilities:

- Exchange connection draft and activation flow.
- Notification, display, database, exchange, and audit sections.
- Environment switch ownership.

Should remain responsible for:

- User and operator settings.
- Connection administration.
- Audit review.

Should not absorb:

- Day-to-day execution monitoring.
- Research workflow guidance beyond section descriptions.

## Pain-Point Analysis

### Information Architecture pain points

Observed issues:

- `BacktestPage` still owns too many jobs at once: dataset catalog, run launch, run tracking, result review, history, and comparison all share one route.
- `StrategiesPage` still mixes catalog education, config management, and start or stop actions, which makes configuration and execution posture feel closer together than they should.
- `PaperTradingPage` is focused for manual orders, but it is not the right long-term home for strategy-owned forward testing or active algorithm monitoring.
- `SettingsPage` succeeds at calmer sectioning, but the environment switch still lives there, which reinforces the current global execution-context model that Phase `2C` intends to retire.

Impact:

- New users can still understand the shell, but expert workflows require too much route-level scanning before the next action is obvious.
- Execution ownership is still spread across Paper, Strategies, and Settings instead of being owned by one dedicated workspace.

### Payload-size pain points

Observed issues:

- `BacktestResults` is much slimmer than earlier revisions, but it still triggers multiple independent reads once a run is selected: details, equity, trade series, and symbol telemetry.
- `BacktestPage` remains the route most exposed to polling churn because history, active summary, and selected-result detail can all refresh in adjacent sections.
- Trade review and market-data review are less severe, but both still depend on route-level polling rather than narrower user-driven detail retrieval.

Impact:

- The product no longer blocks on the worst oversized payloads, but the flagship research route is still the highest-pressure network surface in the SPA.
- Future execution tabs should not repeat the old "one route owns every related payload" pattern.

### Component render-cost pain points

Observed issues:

- `BacktestResults.tsx` is still a very large orchestration and rendering surface, combining async queries, chart workspace state, export behavior, analytics derivation, table sorting, and inspector behavior in one file.
- `SettingsPage.tsx` remains a large route container because the API configuration section still contains substantial inline form and mutation logic.
- `StrategiesPage.tsx` keeps guide cards, table rendering, and modal orchestration together, which is workable now but likely to get noisy once more strategy metadata or execution context is added.

Impact:

- The route decomposition work from Phase `1C` helped, but Backtest and Settings still carry enough local responsibility that future UX work should continue splitting orchestration from heavy panel rendering.
- Render-cost risk is now concentrated in a few dense route containers rather than the whole shell, which is progress but still a design constraint.

### Visual-density pain points

Observed issues:

- The shell and shared surfaces are calmer than before, but `BacktestPage` can still present intro, metrics, alerts, transport state, tracked run or full results, launcher, dataset manager, summaries, and history in one long scan.
- `StrategiesPage` uses informative profile cards plus a dense saved-config table, which can feel like two primary surfaces competing for attention.
- `SettingsPage` is calmer than older versions, yet the API-config section remains form-heavy and verbose compared with the rest of the workstation.

Impact:

- The redesign baseline solved inconsistent chrome and card nesting, but dense routes still need stronger dominant-task separation.
- Phase `2A.2` and `2A.3` should focus more on route ownership and primary-layout hierarchy than on visual restyling.

## Route Complexity Ranking

Highest current complexity:

1. Backtest
2. Settings
3. Strategies

Moderate complexity:

1. Market Data
2. Trades
3. Risk

Lower complexity and currently clearer:

1. Dashboard
2. Paper

## Audit Conclusions

- The workstation redesign in `PLAN.md` was successful and should remain the foundation.
- The next UX wave should not replace the shell; it should reduce route-level responsibility collisions.
- Backtest is the clear reference surface, but it is also the strongest signal that some jobs now need their own workspace instead of more panels on one page.
- The biggest UX opportunity is not visual reinvention. It is execution-context ownership: one dedicated execution workspace that cleanly separates forward testing, paper activity, and future live monitoring from research and configuration routes.

## Recommended Follow-On For Phase 2

Use this audit as the starting point for `2A.2` through `2C`:

- Introduce an `Execution Workspace` entry in navigation while preserving existing deep links during migration.
- Keep `Backtest` as the research workspace and resist moving execution-state monitoring into it.
- Keep `Strategies` focused on catalog and configuration, then move strategy-owned active-state review out of that route.
- Treat `Paper` as the seed for one child route or tab inside the future execution workspace, not as the sole execution surface forever.
- Continue splitting dense route files where orchestration, async state, and rendering still live together.
