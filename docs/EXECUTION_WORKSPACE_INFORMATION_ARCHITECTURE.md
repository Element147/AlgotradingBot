# Execution Workspace Information Architecture

Design date: March 26, 2026

This document defines the information architecture required by `FEATURE_DEVELOPMENT_PLAN.md` task `2A.2`.
It extends the current workstation shell and route model already implemented in `PLAN.md` and audited in `docs/WORKSTATION_EXPERIENCE_AUDIT.md`.

## Intent

Introduce an `Execution Workspace` that separates:

- research
- forward testing
- paper execution
- live monitoring or future approved live execution

The design preserves the current React or Vite SPA shell, keeps safe defaults, and avoids breaking existing deep links while the new route structure is phased in.

## Baseline Constraints

- `Backtest` remains the flagship research workspace.
- `Market Data` remains the import and dataset-preparation control room.
- `Strategies` remains the catalog and configuration desk.
- The shared shell in `Header`, `Sidebar`, `PageContent`, and `Workbench` remains in place.
- Unsupported live actions must fail closed with explicit capability messaging.
- The IA must reduce route-level responsibility collisions instead of recreating them under a new label.

## Proposed Top-Level Navigation

Top-level shell navigation after the execution-workspace migration:

- Dashboard
- Execution Workspace
- Strategies
- Trades
- Backtest
- Market Data
- Risk
- Settings

Navigation intent:

- `Dashboard` answers what needs attention now.
- `Execution Workspace` owns active strategy observation and execution context.
- `Strategies` owns template understanding and saved configuration.
- `Backtest` owns research and replay.

## Proposed Route Tree

Primary route tree:

- `/dashboard`
- `/execution`
- `/execution/forward-testing`
- `/execution/paper`
- `/execution/live`
- `/strategies`
- `/trades`
- `/backtest`
- `/market-data`
- `/risk`
- `/settings`

Recommended default behavior:

- `/execution` redirects to `/execution/forward-testing`
- this preserves the safest default inside the execution family
- the first execution surface a user sees remains paper-safe observation rather than order placement

## Backward-Compatible Routing Plan

The transition should happen without breaking the SPA or existing bookmarks.

### Required compatibility rules

- `/paper` should remain valid during the migration window.
- `/paper` redirects to `/execution/paper`.
- existing query params on `/paper` should be preserved on redirect.
- route titles, breadcrumbs, and sidebar highlighting should treat the new canonical destination as `Execution Workspace`.

### Optional compatibility aliases if needed later

- `/forward-testing` redirects to `/execution/forward-testing`
- `/live-monitoring` redirects to `/execution/live`

### Current implementation guidance

Use redirects rather than duplicate route implementations.
The product should have one canonical execution route family, with legacy paths acting only as compatibility entry points.

## Execution Workspace Structure

The execution workspace is one parent route with three child tabs or child routes:

1. Forward Testing
2. Paper
3. Live

The shared parent responsibilities are:

- keep the execution-family title and subtitle in the shell
- show capability posture and route-owned execution context
- host tab navigation
- preserve shared filters or selected algorithm state when appropriate

The child-route responsibilities are:

- own one dominant job each
- own their tab-specific layout
- avoid importing Backtest or Strategies responsibilities directly

## Tab Ownership

### Forward Testing

Dominant job:

- Observe strategy behavior and investigate signals without placing live orders.

What belongs here:

- strategy or strategy-version selection
- live or near-live chart evidence
- signal reason inspection
- indicator and regime context
- operator notes and investigation log
- incident annotations related to observed behavior

What does not belong here:

- manual order ticket
- backtest dataset management
- strategy-template editing
- live execution controls

Dominant layout:

- chart and signal review first
- investigation and notes second
- strategy context rail third

### Paper

Dominant job:

- Review and control paper execution behavior in one simulated execution context.

What belongs here:

- active paper strategy list
- per-exchange or per-profile paper assignment
- paper performance and incident review
- current positions, orders, and signal-to-order explanation
- optional manual paper order utility if retained

What does not belong here:

- full strategy-catalog editing
- research-run comparison
- live execution controls

Dominant layout:

- active algorithms or accounts first
- selected algorithm detail workspace second
- manual utility actions in a secondary band

### Live

Dominant job:

- Monitor live context explicitly and fail closed unless approved live capability exists.

What belongs here:

- capability and approval posture
- live monitoring state
- active live positions or incidents when available
- signal and order explainability for live-visible algorithms
- future live controls only when the backend reports support

What does not belong here:

- silent fall-through from paper behavior
- optimistic exposure of unsupported controls
- research or dataset management

Dominant layout:

- capability posture and warnings first
- monitored live state second
- dangerous controls isolated and only rendered when supported

## Dominant Layout Rule

The execution-workspace redesign should remove the current "wall of text" feeling by giving each tab one dominant job and one dominant layout.

Required rule per tab:

- one primary action zone
- one primary evidence zone
- one optional secondary rail or reference zone

This means:

- `Forward Testing` is chart-and-investigation first
- `Paper` is active-execution-state first
- `Live` is capability-and-monitoring first

It also means the execution workspace should not stack multiple unrelated panels with equal visual weight just because they are execution-adjacent.

## Relationship To Existing Routes

### Dashboard

Stays focused on:

- attention management
- operator posture
- next-step guidance

Should link into:

- the execution workspace when the user needs active-state review

### Strategies

Stays focused on:

- template understanding
- saved configuration editing
- readiness framing

Should hand off to:

- `Execution Workspace > Forward Testing`
- `Execution Workspace > Paper`
- `Execution Workspace > Live`

depending on the user's next job

### Backtest

Stays focused on:

- research runs
- replay
- evidence review
- compare and export

Should not own:

- active execution monitoring
- strategy assignment
- live capability posture

### Trades

Stays focused on:

- cross-workspace fill review
- filter, inspection, and export

### Settings

Should lose ownership over global execution intent over time.

Settings should keep:

- preferences
- exchange connections
- notification preferences
- audit and database tooling

Settings should not remain the long-term owner of:

- a global execution mode that changes unrelated route behavior

## Shared Execution Context Model

The IA assumes an explicit route-owned execution context model that later implementation tasks can enforce:

- `research`
- `forward-test`
- `paper`
- `live`

Immediate implication:

- research routes such as `Backtest` and `Market Data` should not depend on a global live or paper switch to explain their behavior
- execution tabs should own their own context explicitly

## Header And Shell Behavior

The shared shell stays in place, but the header should adapt to the execution workspace in a controlled way.

Shared shell continues to own:

- route title and subtitle
- mode, telemetry, risk, and exchange chips
- session-level context

Execution workspace route-level additions may own:

- selected execution tab
- selected strategy or algorithm
- capability or approval banner
- route-local action bar

The shell should not duplicate tab-level controls in the global header.

## State And Deep-Linking Guidance

Execution workspace routes should support deep linking where it improves review and handoff:

- selected tab is route-owned by pathname
- selected strategy or algorithm can live in search params
- selected account or exchange profile can live in search params
- selected chart symbol, marker, or incident can live in search params

Recommended examples:

- `/execution/forward-testing?strategy=EMA_PULLBACK&symbol=BTC/USDT`
- `/execution/paper?algo=paper-btc-breakout&exchangeProfile=binance-testnet`
- `/execution/live?algo=live-monitor-btc&capability=monitor-only`

## Capability Gating Rules

The IA must make fail-closed behavior obvious.

Required behavior:

- `Forward Testing` is always observation-first and paper-safe.
- `Paper` is always simulated.
- `Live` renders monitor-only behavior by default.
- any future approved live action is hidden or disabled until the backend reports capability support.
- unsupported controls explain why they are unavailable instead of disappearing without context.

## Migration Sequence

Recommended phased rollout:

1. Add the `Execution Workspace` navigation entry and parent route.
2. Add `Forward Testing`, `Paper`, and `Live` child routes with placeholder-safe real information architecture scaffolding.
3. Redirect `/paper` to `/execution/paper`.
4. Move strategy-owned active-state review out of `PaperTradingPage` and `StrategiesPage`.
5. Remove dependence on the global environment switch for route intent.

## Acceptance Check Against `2A.2`

This IA satisfies the task goals by defining:

- a clear separation between research, forward testing, paper execution, and live monitoring or live execution capability
- a backward-compatible navigation model using `/execution/*` plus `/paper` redirect compatibility
- a structure where each execution tab has one dominant job and one dominant layout, reducing dense mixed-responsibility surfaces
