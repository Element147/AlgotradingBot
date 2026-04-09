# Route Scenarios

Start with these route-level checks:

- `Market Data`
  - Create or inspect an import job.
  - Verify progress, readiness, and error handling.
  - Confirm archive or restore actions update the visible state.
- `Backtest`
  - Submit a run with valid inputs.
  - Verify progress, status changes, and at least one failure or validation path.
  - Open history or detail panes and confirm the route shows stable data.
- `Risk`
  - Verify limits, breaker state, and override context render together.
  - Confirm any warnings or audit indicators remain visible after interaction.
- Shared shell
  - Verify route navigation, loading, and error surfaces.
  - Confirm the active environment indicator remains visible and conservative.
