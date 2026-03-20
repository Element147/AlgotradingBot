# Plan

## Purpose

This plan resets the frontend direction around one coherent research workstation for backtesting, signal review, paper trading, and future live monitoring.
It replaces the older lightweight polish pass with a full UI and UX plan that is easier for beginners to learn, clearer to operate, and safer to extend.

The plan stays aligned with:

- `docs/ROADMAP.md`: local-first delivery, small reversible increments, verified behavior
- `docs/ACCEPTANCE_CRITERIA.md`: clear boundaries, honest verification, updated docs
- `PRODUCT.md`: preserve the current SPA route surfaces and operator jobs
- `TRADING_GUARDRAILS.md`: `test` first, paper before live, explicit live friction, no weakened risk cues
- `ARCHITECTURE.md`: keep the React/Vite SPA, feature-based structure, and backend-owned telemetry model

## Current Diagnosis

The application is already functional and safer than a typical hobby trading dashboard, but the current UI still feels too packed and visually flat for a workflow this dense.

Current problems to solve:

- Too many panels compete for attention with similar visual weight.
- The shell, route intro, cards, tables, and charts do not yet feel like one unified design language.
- Backtest review exposes rich telemetry, but the main price-review experience still behaves like a generic dashboard instead of a trading analysis workspace.
- Chart review, trade review, and signal review are visible, but not yet tightly linked.
- Beginner guidance exists, but it is distributed across too many cards instead of being structured into one learnable flow.
- Dense operational surfaces still depend too much on scanning boxes instead of following a clear task hierarchy.

## Product Outcome

Build a calm, interactive "Research Workstation Lite" with these properties:

- beginner-friendly by default in `test`
- operationally useful in `paper`
- explicit, friction-heavy, and visually distinct in `live`
- strong at evidence review: chart, signal, trade, exit, risk, and provenance in one place
- visually consistent across Dashboard, Backtest, Paper, Strategies, Trades, Market Data, Risk, and Settings

## Research Anchors

External references reviewed on March 20, 2026 and used to shape this plan:

- Carbon dashboards guidance distinguishes between presentation dashboards and exploration dashboards, recommends strong hierarchy, fewer headline metrics, consistent chart layouts, linked charts, and annotations for interpretation: <https://carbondesignsystem.com/data-visualization/dashboards/>
- Carbon data-visualization color guidance emphasizes accessibility, harmony, consistent sequences, and deliberate use of alert colors instead of decorative gradients: <https://carbondesignsystem.com/data-visualization/color-palettes/>
- USWDS table guidance recommends simple styling, clear header rows, right-aligned numerical data, monospace for dense numeric values, and mobile-aware table behavior: <https://designsystem.digital.gov/components/table/>
- Atlassian's UI refresh guidance emphasizes more readable fonts and clearer heading levels to improve scanning in dense application UIs: <https://atlassian.design/whats-new/atlassian-ui-refresh-updates/>
- TradingView Lightweight Charts documentation confirms support for chart panes and layout controls that fit trading-style price inspection better than generic chart primitives: <https://tradingview.github.io/lightweight-charts/docs/api/interfaces/LayoutOptions>
- MUI X Data Grid guidance remains the benchmark for controlled sorting, filtering, and virtualization if the current table approach becomes too limiting on dense routes: <https://mui.com/x/react-data-grid/sorting/> and <https://mui.com/x/react-data-grid/server-side-data/lazy-loading/>

## Non-Negotiables

- Keep the current React/Vite SPA. No Next.js or broad frontend migration.
- Keep the feature-first structure under `frontend/src/features/`.
- Preserve the `test` default and explicit `paper` or `live` visibility at all times.
- Do not hide or soften risk, circuit-breaker, telemetry, or environment posture.
- Do not imply that live trading is production-ready or safe by default.
- Do not trade clarity for novelty. "Looks like a pro tool" must not mean "hard to learn."
- Do not let route pages recreate shell chrome that already belongs to the shared layout.
- Keep backend contracts authoritative. UI adaptation belongs in API and feature contract layers, not random components.

## Experience Principles

### 1. Beginner-first progressive disclosure

Every core route should have a simple default state, with advanced filters, comparison tools, and destructive actions pushed one level deeper.

### 2. One primary task per view

Each page should answer one question clearly:

- Dashboard: What needs attention now?
- Backtest: What happened, where, and why?
- Paper: What is the current simulated execution state?
- Trades: Which fills matter, and what can I learn from them?
- Strategies: Which algorithm am I configuring, and is it safe to run in paper?
- Market Data: What is importing, what failed, and what is ready?
- Risk: What is protected, what is tripped, and what requires action?
- Settings: What can I safely change, and what is the impact?

### 3. Stable safety context

Environment mode, connection state, risk posture, and live-readiness caveats must stay visible in the shell without forcing every route to duplicate warning banners.

### 4. Linked evidence, not disconnected cards

Signals, trades, chart markers, equity changes, and validation metadata should point to each other instead of living in separate islands.

### 5. Calm data density

This is a dense product, but density must come from meaningful information, not stacked borders, repeated chips, or nested cards.

### 6. Explain first, optimize second

A beginner should understand the purpose of a section before they need to interpret a metric or interact with a control.

### 7. Interaction should add insight

Use interactivity for drill-down, linked charts, filtering, replay, and explanation.
Do not use interactivity as decoration.

## Target Visual Direction

### Design Theme

Use a light-first visual system that feels like a modern trading research notebook rather than a generic dark crypto terminal.

Why:

- light themes remain easier for beginners to scan over long sessions
- a light-first system keeps warning states, risk accents, and chart overlays clearer
- the current app already leans toward a warm, research-workstation aesthetic that can be refined instead of replaced

Dark mode should stay supported, but it should be a token-driven variant of the same system, not a separate personality.

### Typography

Use stronger hierarchy and clearer numeric treatment.

Recommended direction:

- primary UI font: `IBM Plex Sans` or `Aptos` if avoiding new font loading
- numeric and dense tabular font: `IBM Plex Mono`
- headings: same family with stronger weight and spacing, not a second decorative font everywhere

Rules:

- page titles should be shorter and more distinct
- supporting copy should be concise and instructional
- metrics, prices, percentages, fees, and position sizes should use a monospace treatment

### Color System

Use deliberate, semantic color instead of many bright accents.

Core token direction:

- canvas: warm neutral
- panel: near-white
- elevated panel: pale mineral tint
- primary action: deep teal
- secondary action: muted amber
- info: cobalt
- success: green
- warning: amber
- danger: red

Trading-specific semantics:

- long entry: green plus upward shape
- long exit: teal or blue plus exit iconography
- short entry: red plus downward shape
- short cover: orange or amber plus exit iconography
- breaker or risk stop: red plus explicit label

Do not rely on color alone.
Shapes, labels, and legends must reinforce action meaning.

### Surfaces

Reduce the "card inside card inside grid" effect.

Adopt three surface levels only:

1. Canvas: page background
2. Panel: default working surface
3. Elevated panel: inspector, modal, or sticky control area

Rules:

- prefer dividers and spacing over extra outlines
- keep border radii modest and consistent
- reserve filled backgrounds for safety states, selected states, and emphasis

### Motion

Use motion to confirm transitions, not to entertain.

Allowed:

- route-content fade and slide on page load
- drawer and inspector transitions
- skeleton loading and progressive reveal
- chart hover and brush feedback
- subtle row highlight when a chart interaction selects a trade

Avoid:

- floating cards
- animated gradients
- decorative counters
- autoplay chart motion

## Layout System

### App Shell

The shell should become a stable operating frame, not another dense content layer.

Planned shell structure:

- left sidebar: grouped navigation, collapsible on desktop, drawer on mobile
- top command bar: page title, concise subtitle, environment pill, telemetry pill, risk pill, active connection, user menu
- optional route action bar under the command bar on complex routes only
- content stage with route-specific width rules

Shell rules:

- keep the header as the primary route-title surface
- remove duplicated hero treatments from pages that do not need onboarding copy
- keep no more than four persistent shell status chips visible at once
- add a command palette later if needed, but not before the shared layout is stable

### Width Model

Use route-specific max widths instead of one width for every page:

- overview routes: `max-width: 1440px`
- dense research routes: `max-width: 1680px`
- settings and forms: `max-width: 1200px`

### Page Grammar

Every route should use the same visual grammar:

1. optional short intro or task summary
2. metric strip with at most four high-value metrics
3. one primary work area
4. one optional secondary or inspector area
5. one optional reference or history area

Avoid more than two nested layout containers before meaningful content begins.

## Core Interaction Model

### Shared Behaviors

- deep-linkable filters and selected entities through the URL
- clear selected state on rows, markers, tabs, and chart legends
- empty states that explain the next step in plain language
- visible loading states for queries, mutations, and live transport fallback
- sticky filters only where they reduce repeated scrolling
- keyboard support for tables, drawers, tabs, dialogs, and chart-adjacent controls

### Progressive Disclosure Model

Basic mode should be the default mental model:

- recommended presets visible first
- advanced parameters hidden behind "Advanced" toggles or drawers
- destructive actions grouped into a lower "Danger Zone" or explicit menu
- technical metadata visible, but secondary

## Flagship Surface: Backtest Research Workspace

This route should become the visual and interaction reference for the entire app.

### Why it matters

The user goal is not only to launch backtests.
The user needs to inspect charts, signals, entry points, short entries, exits, and the context around those decisions.
That makes Backtest the flagship workflow.

### Target Layout

Desktop:

- top sticky research bar
- main chart workspace in the center
- contextual inspector on the right
- evidence tables and secondary analytics below

Mobile and tablet:

- stacked workspace with the inspector becoming a bottom sheet or accordion section

### Research Bar

The sticky research bar should show:

- run ID and validation state
- strategy and dataset
- symbol and timeframe
- status and transport state
- replay, compare, export, and shareable-link actions
- overlay toggles and pane toggles

This bar should replace scattered route-level chips.

### Chart Workspace

The primary market chart should no longer be a generic line chart.

Recommendation:

- keep `Recharts` for summary analytics such as equity, drawdown, histogram, and comparison charts
- introduce `lightweight-charts` for the primary price-action workspace

Reasoning:

- candlesticks are a better mental model for strategy inspection
- chart markers map naturally to buy, sell, short, and cover events
- panes and crosshair behavior support synchronized indicator review
- this is the route where trading-specific interaction matters most

### Chart Workspace Anatomy

The chart workspace should contain:

- main pane: candlesticks, trade markers, indicator overlays
- pane 2: volume or exposure
- pane 3: oscillator or regime view when relevant
- bottom range control: brush or date-range scrubber
- optional compare mode: synced overlay or side-by-side view for two runs

### Marker Semantics

Use a consistent action legend:

- `BUY`: filled upward marker
- `SELL`: outlined exit marker
- `SHORT`: filled downward marker
- `COVER`: outlined recovery marker
- forced exit, stop, or breaker event: diamond or flagged marker

Hover tooltip should include:

- timestamp
- symbol
- action
- price
- position side
- trade ID if available
- signal reason label if available
- key indicator values at that candle

### Linked Review Behavior

The user should be able to:

- click a marker to open the related trade in the inspector
- click a trade row to jump the chart to that point
- hover one pane and see the same timestamp across all linked panes
- filter the chart to only long trades, short trades, exits, or forced exits
- jump between next and previous trade events
- switch between overview, replay, and compare modes without leaving the run

### Inspector Panel

The inspector should show the currently selected trade or signal:

- entry and exit timestamps
- side and quantity
- entry and exit prices
- PnL and return
- fees and slippage
- duration
- signal reason or exit reason
- related indicator snapshot
- link to full trade row and export

### Required Contract Improvements

The current telemetry model is already useful, but a stronger signal-review UX will likely need richer metadata.

Plan for optional backend additions:

- explicit `tradeId` on action markers
- explicit `signalReason` or `decisionReason`
- explicit `exitReason`
- optional `orderGroupId`
- optional action category such as `ENTRY`, `EXIT`, `STOP`, `TAKE_PROFIT`, `FORCED_CLOSE`

This should be added only through the existing DTO and contract boundaries.

## Route Blueprints

### Dashboard

Role:

- presentation dashboard

Target changes:

- one clear "What needs attention now" block
- one "What to do next" guidance block
- fewer equal-weight metric cards
- recent alerts, recent paper activity, and system posture grouped by urgency

### Backtest

Role:

- exploration dashboard and flagship research workspace

Target changes:

- sticky research bar
- chart-first review surface
- linked chart and trade inspection
- compare mode that feels like a deliberate workflow, not extra cards

### Paper

Role:

- execution desk with strong guardrails

Target changes:

- keep order ticket visually primary
- show instrument context and state summary near the order flow
- use a clean split between order entry, open orders, and recent fills
- surface stale state, recovery, and incidents without crowding order entry

### Strategies

Role:

- catalog and configuration desk

Target changes:

- emphasize template understanding first
- treat configuration editing as the primary action
- move start and stop into a clearly secondary action band
- show strategy readiness, best use, and short exposure posture consistently

### Trades

Role:

- evidence review and export

Target changes:

- sticky filter panel or top filter bar
- tighter numeric formatting
- stronger selected-row state
- optional right-side trade detail drawer
- easy jump from trade table into related chart review when backtest context exists

### Market Data

Role:

- import control room

Target changes:

- make the route feel like a three-step flow:
  1. choose provider
  2. define import scope
  3. review job progress and output
- keep retries, waiting state, and completion clearer at a glance

### Risk

Role:

- protection-first operations page

Target changes:

- breaker posture becomes the dominant top element
- overrides move into a clearly isolated audited danger zone
- alerts and risk metrics become easier to scan chronologically

### Settings

Role:

- configuration and audit workspace

Target changes:

- replace broad tab density with calmer section navigation
- use left-side subnavigation on desktop and stacked sections on mobile
- group forms by intent: display, connections, notifications, database, audit
- separate normal settings from operationally sensitive exchange actions

## Shared Components To Add Or Refactor

Priority shared building blocks:

- route action bar
- sticky inspector panel
- reusable metric card with numeric mono styling
- unified empty-state component with guided next step
- unified table toolbar
- chart legend and marker legend
- key-value evidence panel
- mobile bottom-sheet inspector pattern
- compact status pill system

Potential folders:

- `frontend/src/components/layout/*`
- `frontend/src/components/ui/*`
- `frontend/src/components/workspace/*`
- feature-local chart and inspector components under `frontend/src/features/backtest/*`

## Delivery Phases

### Phase 0: UX Foundation And Token Cleanup

Scope:

- refine theme tokens
- standardize spacing, radii, borders, shadows, and numeric typography
- reduce duplicated page-hero styling

Primary files:

- `frontend/src/theme/theme.ts`
- `frontend/src/components/layout/AppLayout.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/PageContent.tsx`

### Phase 1: Shared Surface Simplification

Scope:

- unify metric strip behavior
- add consistent section headers and action bars
- standardize empty, loading, and error states
- reduce nested card depth on all routes

### Phase 2: Backtest Workspace Redesign

Scope:

- add sticky research bar
- introduce chart-first layout
- add linked inspector and trade selection
- keep comparison and export intact
- evaluate `lightweight-charts` for the price-review surface while preserving `Recharts` for aggregate analytics

This phase is the highest product priority.

### Phase 3: Paper, Trades, And Strategies Harmonization

Scope:

- align interaction patterns around selection, detail inspection, and table review
- make numeric density consistent
- move advanced actions lower in the hierarchy

### Phase 4: Market Data, Risk, And Settings Rationalization

Scope:

- simplify route information architecture
- separate primary tasks from advanced or dangerous tasks
- finish mobile and tablet behavior

### Phase 5: Accessibility, Responsiveness, And Final Polish

Scope:

- focus order and keyboard checks
- contrast validation
- table and chart mobile behavior
- empty and failure state polish
- final copy cleanup

## Verification Strategy

Use the narrowest meaningful verification for each batch:

- `cd frontend`
- `npm run lint`
- `npm run test -- --watch=false`
- `npm run build`

Use targeted Playwright checks when local runtime is available.

Manual verification focus:

- desktop, tablet, and mobile layout stability
- chart and table selection sync
- sticky headers and inspectors
- environment and risk visibility
- `live` warning posture
- loading, empty, error, and success states

If backend telemetry contracts change, also run:

- `npm run contract:check`
- targeted backend tests for the modified DTO or query services

## Acceptance Criteria For This Plan

This UI plan is considered delivered only when:

- every major route clearly communicates its primary task
- the shell remains calm and safety-critical information stays visible
- the Backtest route supports chart-centered review of entries, exits, and signal context
- styles, spacing, and status semantics are unified across the SPA
- dense tables and metrics are easier to scan than the current baseline
- the default experience remains beginner-friendly
- advanced controls are still available without dominating the default path
- docs remain aligned with actual implementation

## Open Decisions

These are the only significant design decisions that may need confirmation later:

1. Font loading policy
   - Default assumption: keep the current system-friendly approach unless a hosted font materially improves readability.
2. Primary charting library for price review
   - Default assumption: keep `Recharts` for analytics and add `lightweight-charts` only for the Backtest market chart.
3. Dense-table strategy
   - Default assumption: improve current MUI tables first and evaluate `MUI X Data Grid` only if the routes outgrow the simpler stack.

## Immediate Next Step

The next implementation batch should start with Phase 0 and Phase 2 together:

- simplify the shell and shared tokens first
- then redesign Backtest as the reference route

That gives the project one strong visual and interaction standard before the same system is rolled out to the rest of the SPA.
