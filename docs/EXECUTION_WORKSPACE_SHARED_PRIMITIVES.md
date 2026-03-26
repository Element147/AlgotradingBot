# Execution Workspace Shared Primitives

Design date: March 26, 2026

This document records the shared UI primitives added for `FEATURE_DEVELOPMENT_PLAN.md` task `2A.4`.
These components extend the existing workstation visual system only where the planned execution workflow needs new shared patterns.

## Added Primitives

- `ExecutionStatusRail`
  Location: `frontend/src/components/workspace/ExecutionWorkspacePrimitives.tsx`
  Purpose: compact route-local posture strip for execution context, capability, freshness, and incident cues.
- `ExecutionCard`
  Location: `frontend/src/components/workspace/ExecutionWorkspacePrimitives.tsx`
  Purpose: selectable execution card for strategies, active algorithms, or monitored accounts.
- `InvestigationLogPanel`
  Location: `frontend/src/components/workspace/ExecutionWorkspacePrimitives.tsx`
  Purpose: shared note, incident, and follow-up timeline surface.
- `LiveMetricStrip`
  Location: `frontend/src/components/workspace/ExecutionWorkspacePrimitives.tsx`
  Purpose: execution-focused metric strip for current PnL, incidents, positions, and freshness.
- `ActiveAlgorithmDetailDrawer`
  Location: `frontend/src/components/workspace/ExecutionWorkspacePrimitives.tsx`
  Purpose: shared sticky-on-desktop and drawer-on-mobile detail surface for selected active algorithms.

## Visual System Alignment

- All primitives build on the existing workstation surfaces:
  - `SurfacePanel`
  - `MetricCard`
  - `StatusPill`
  - `EmptyState`
  - `StickyInspectorPanel`
- No new visual language was introduced.
- Borders, spacing, typography, and dense-data presentation stay consistent with the current shell and Backtest workspace.

## Accessibility And Interaction Notes

### `ExecutionStatusRail`

- Uses a list-style structure for compact posture blocks.
- Empty state is built in, so routes do not need to improvise blank containers.
- Intended to stay read-only and glanceable.

### `ExecutionCard`

- Supports selection through `ButtonBase` with `aria-pressed`.
- Focus-visible outline is explicit.
- Metrics remain tabular and mono-styled through shared numeric text rules.

### `InvestigationLogPanel`

- Provides loading, populated, and empty states.
- Uses a labeled list for chronological entries.
- Entries are read-first; hover styling is intentionally quiet to avoid fake click affordance.

### `LiveMetricStrip`

- Wraps the current metric-card pattern instead of inventing a second metric system.
- Includes an explicit empty state for contexts that do not yet have live or near-live metrics.

### `ActiveAlgorithmDetailDrawer`

- Reuses the shared inspector behavior:
  - sticky detail rail on desktop
  - bottom drawer on mobile
- Includes loading and empty states.
- Mobile open and close controls remain keyboard and screen-reader reachable through button semantics inherited from `StickyInspectorPanel`.

## Intended Usage Boundaries

- `Forward Testing`
  - `ExecutionStatusRail`
  - `InvestigationLogPanel`
  - `ActiveAlgorithmDetailDrawer`
- `Paper`
  - `ExecutionCard`
  - `LiveMetricStrip`
  - `ActiveAlgorithmDetailDrawer`
- `Live`
  - `ExecutionStatusRail`
  - `ExecutionCard`
  - `LiveMetricStrip`
  - `ActiveAlgorithmDetailDrawer`

## Acceptance Check Against `2A.4`

This implementation satisfies the task by:

- placing the new primitives in shared workstation modules instead of route files
- covering loading and empty states inside the components themselves
- preserving the current workstation theme instead of creating a disconnected execution mini-app
