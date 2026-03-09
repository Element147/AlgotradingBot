# Phase 8: Charts and Visualization (Week 8)

[← Back to Overview](./00-overview.md) | [Previous: Phase 7](./phase-07-settings-exchange.md) | [Next: Phase 9 →](./phase-09-performance-optimization.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 7 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 8, verify:
- [ ] Phase 7 git commit exists: `git log --oneline --grep="feat: Phase 7"`
- [ ] Phase 7 verification passed (build, run, test)
- [ ] Settings and exchange integration functional
- [ ] All Phase 7 tests passing

### If Phase 7 is Incomplete
1. **STOP** - Do not proceed with Phase 8
2. **NOTIFY** - "Phase 7 must be completed first"
3. **QUEUE** - Add Phase 8 to queue
4. **REDIRECT** - Complete Phase 7 first

## Phase Status

- **Dependencies:** Phase 1, 2, 3, 4, 5, 6, 7
- **Can Start:** Only if Phase 7 is COMPLETE
- **Blocks:** Phase 9, 10, 11, 12, 13

## Tasks

- [ ] 8.1 Implement equity curve chart component
  - Create EquityCurve component using Recharts or Lightweight Charts
  - Display account balance over time as line chart
  - Add timeframe selection buttons (1d, 1w, 1m, 3m, 1y, all)
  - Update chart within 500ms when timeframe changes
  - Add hover tooltips with exact values
  - Apply theme-aware color scheme
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 22.1, 22.2, 22.5_

- [ ] 8.2 Implement drawdown chart component
  - Create DrawdownChart component
  - Display percentage decline from peak as area chart
  - Add horizontal line for max drawdown limit
  - Color-code danger zones (red when approaching limit)
  - Add tooltips with exact values
  - Apply theme-aware colors
  - _Requirements: 3.1, 3.2, 22.1, 22.2, 22.5_

- [ ] 8.3 Add chart zoom and pan functionality
  - Implement zoom for charts with 100+ data points
  - Add pan functionality for zoomed charts
  - Add reset zoom button to return to default view
  - Ensure smooth interaction without lag
  - _Requirements: 22.6, 22.7, 22.8_

- [ ] 8.4 Create accessible table alternatives for charts
  - Provide data table view as alternative to visual charts
  - Include all chart data in accessible format
  - Add toggle to switch between chart and table view
  - Ensure screen reader compatibility
  - _Requirements: 17.6_

- [ ] 8.5 Optimize chart rendering performance
  - Render charts within 500ms of data availability
  - Update charts smoothly without full re-render
  - Use memoization for expensive calculations
  - Implement canvas-based rendering for large datasets
  - _Requirements: 22.9, 22.10_

- [ ] 8.6 Add chart export functionality
  - Provide export button for each chart
  - Export chart as PNG image
  - Export underlying data as CSV
  - Include chart in PDF exports
  - _Requirements: 20.7, 20.9_

- [ ] 8.7 Write unit tests for chart components
  - Test EquityCurve renders with data
  - Test DrawdownChart renders with data
  - Test timeframe selection updates chart
  - Test zoom and pan functionality
  - Test accessible table alternative
  - Test chart export
  - Achieve 80%+ coverage
  - _Requirements: 25.1, 25.4_

- [ ] 8.8 Checkpoint - Verify charts and visualization complete
  - Ensure all tests pass
  - Verify charts render correctly in both themes
  - Check zoom/pan interactions work smoothly
  - Verify accessible alternatives work
  - Ask user if questions arise

- [ ] 8.9 Phase 8 Verification - Build, Run, and Test Application
  - Stop all running services using `.\stop-all.ps1`
  - Build both backend and frontend using `.\build-all.ps1`
  - Verify builds complete successfully without errors
  - Start all services using `.\run-all.ps1`
  - Verify backend is accessible at http://localhost:8080
  - Verify frontend is accessible at http://localhost:5173
  - Test equity curve chart renders and displays data
  - Test drawdown chart renders correctly
  - Test chart zoom and pan functionality
  - Test timeframe selection updates charts
  - Test accessible table alternatives
  - Test chart export functionality (PNG, CSV)
  - If any issues found, diagnose and repair immediately
  - Once all verification passes, commit to git:
    - `git add .`
    - `git commit -m "feat: Phase 8 - Charts and visualization complete"`
    - `git push origin main` (or your branch)
  - Do not proceed to Phase 9 until all verification passes and code is committed
  - _Requirements: 26.8, 26.9, 26.10_

- [ ] 8.10 Backend - Verify Chart Data Endpoints (No New Implementation Required)
  - **Location:** `AlgotradingBot/src/main/java/com/algotrader/bot/`
  - **Note:** This phase is primarily frontend-focused (chart rendering)
  - Verify existing endpoints provide data in correct format for charts:
    - GET `/api/account/performance` returns time-series data for equity curve
    - GET `/api/backtest/{id}` returns equity curve and drawdown data points
    - GET `/api/trades/history` returns data for trade distribution charts
  - Ensure all endpoints return timestamps in ISO 8601 format
  - Ensure all numeric values use consistent precision (8 decimal places for crypto)
  - Add CORS headers if needed for chart export functionality
  - Test data format compatibility with frontend chart libraries
  - No new backend implementation required unless data format issues are found
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8_

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Equity curve and drawdown charts
- ✅ Chart zoom and pan functionality
- ✅ Accessible table alternatives
- ✅ Chart export (PNG, CSV)
- ✅ All tests passing
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 9: Performance Optimization](./phase-09-performance-optimization.md)
