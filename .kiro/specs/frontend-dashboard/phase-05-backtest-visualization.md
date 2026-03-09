# Phase 5: Backtest Visualization (Week 5)

[← Back to Overview](./00-overview.md) | [Previous: Phase 4](./phase-04-trade-history.md) | [Next: Phase 6 →](./phase-06-risk-management.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 4 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 5, verify:
- [ ] Phase 4 git commit exists: `git log --oneline --grep="feat: Phase 4"`
- [ ] Phase 4 verification passed (build, run, test)
- [ ] Trade history is functional
- [ ] All Phase 4 tests passing

### If Phase 4 is Incomplete
1. **STOP** - Do not proceed with Phase 5
2. **NOTIFY** - "Phase 4 must be completed first"
3. **QUEUE** - Add Phase 5 to queue
4. **REDIRECT** - Complete Phase 4 first

## Phase Status

- **Dependencies:** Phase 1, 2, 3, 4
- **Can Start:** Only if Phase 4 is COMPLETE
- **Blocks:** Phase 6, 7, 8, 9, 10, 11, 12, 13

## Tasks

- [ ] 5.1 Create backtest API slice with results and run endpoints
  - Implement backtestApi with getBacktestResults, getBacktestDetails, runBacktest mutation
  - Configure caching with 10 minute TTL for results
  - Add polling mechanism for pending backtest status
  - _Requirements: 8.1, 8.4, 9.6_

- [ ] 5.2 Build backtest results page with list view
  - Create BacktestPage component
  - Display list of backtest results with date, strategy, symbol, timeframe, validation status
  - Color-code validation status (green=PASSED, red=FAILED, yellow=PENDING)
  - Add "Run New Backtest" button
  - Make rows clickable to view details
  - _Requirements: 8.1, 8.2, 9.1_

- [ ] 5.3 Create backtest details view with performance metrics
  - Build BacktestResults component
  - Fetch complete backtest data from /api/backtest/{id}
  - Display performance metrics table: Sharpe ratio, profit factor, win rate, max drawdown, total trades, avg win/loss
  - Show initial balance, final balance, total P&L
  - Display validation status prominently
  - _Requirements: 8.4, 8.5_

- [ ] 5.4 Implement equity curve chart
  - Create EquityCurve chart component using Recharts
  - Display account balance over time as line chart
  - Add hover tooltips with exact values
  - Implement zoom and pan for large datasets
  - Add reset zoom button
  - Apply theme-aware colors
  - _Requirements: 8.6, 22.1, 22.2, 22.6, 22.7, 22.8_

- [ ] 5.5 Implement drawdown chart
  - Create DrawdownChart component
  - Display drawdown percentage as area chart
  - Add horizontal line for max drawdown limit
  - Color-code danger zones (approaching limit)
  - Add tooltips with exact values
  - _Requirements: 8.7_

- [ ] 5.6 Create monthly returns heatmap
  - Build MonthlyReturnsHeatmap component
  - Display returns as color-coded grid (rows=years, columns=months)
  - Use green for positive returns, red for negative
  - Add tooltips showing exact percentage
  - _Requirements: 8.8_

- [ ] 5.7 Add trade distribution histogram
  - Create TradeDistributionHistogram component
  - Display trade P&L distribution as bar chart
  - Group trades into bins (-10 to -5, -5 to 0, 0 to 5, etc.)
  - Show count of trades in each bin
  - _Requirements: 8.9_

- [ ] 5.8 Display Monte Carlo and walk-forward results
  - Show Monte Carlo confidence intervals (95%)
  - Display worst-case scenario projections
  - Show in-sample vs out-of-sample performance comparison
  - Display degradation percentage for walk-forward
  - Only render if data exists
  - _Requirements: 8.10, 8.11_

- [ ] 5.9 Create backtest configuration modal
  - Build BacktestConfigModal component
  - Add input fields: strategy, symbol, timeframe, start date, end date, initial balance
  - Validate start date < end date
  - Validate initial balance > 100
  - Display inline validation errors
  - Disable run button while errors exist
  - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [ ] 5.10 Implement backtest execution and polling
  - Send POST request to /api/backtest/run on submit
  - Display pending notification with backtest ID
  - Poll /api/backtest/results every 5 seconds while pending
  - Display completion notification with link to results
  - Display error notification if backtest fails
  - Stop polling when complete or failed
  - _Requirements: 9.6, 9.7, 9.8, 9.9, 9.10_

- [ ] 5.11 Add PDF export functionality for backtest results
  - Create export button on backtest details page
  - Generate PDF with all metrics and charts
  - Include chart visualizations as images
  - Trigger download with filename backtest_{id}_YYYY-MM-DD.pdf
  - _Requirements: 8.12, 20.7, 20.8, 20.9, 20.10_

- [ ] 5.12 Write unit tests for backtest components
  - Test BacktestPage renders results list
  - Test BacktestResults displays metrics correctly
  - Test chart components render with data
  - Test BacktestConfigModal validation
  - Test backtest execution and polling logic
  - Test PDF export generation
  - Achieve 80%+ coverage
  - _Requirements: 25.1, 25.4_

- [ ] 5.13 Write property tests for backtest validation
  - **Property 9: Date Range Validation**
  - **Validates: Requirements 9.4**
  - Test that start date >= end date is rejected
  - **Property 10: Initial Balance Validation**
  - **Validates: Requirements 9.5**
  - Test that initial balance <= 100 is rejected
  - Use fast-check with 100+ iterations
  - _Requirements: 30.1_

- [ ] 5.14 Write integration tests for backtest operations
  - Test fetch backtest results list
  - Test fetch backtest details by ID
  - Test run new backtest with valid configuration
  - Test poll for backtest completion
  - Test backtest validation status (PASSED/FAILED/PENDING)
  - Test export backtest to PDF
  - _Requirements: 30.6_

- [ ] 5.15 Checkpoint - Verify backtest visualization complete
  - Ensure all tests pass (unit, property, integration)
  - Verify all charts render correctly
  - Check backtest execution and polling work
  - Ask user if questions arise

- [ ] 5.16 Phase 5 Verification - Build, Run, and Test Application
  - Stop all running services using `.\stop-all.ps1`
  - Build both backend and frontend using `.\build-all.ps1`
  - Verify builds complete successfully without errors
  - Start all services using `.\run-all.ps1`
  - Verify backend is accessible at http://localhost:8080
  - Verify frontend is accessible at http://localhost:5173
  - Test backtest results page displays list of backtests
  - Test backtest details view with performance metrics
  - Test all chart components (equity curve, drawdown, heatmap, histogram)
  - Test backtest configuration modal and validation
  - Test backtest execution and polling
  - Test PDF export functionality
  - If any issues found, diagnose and repair immediately
  - Once all verification passes, commit to git:
    - `git add .`
    - `git commit -m "feat: Phase 5 - Backtest visualization complete"`
    - `git push origin main` (or your branch)
  - Do not proceed to Phase 6 until all verification passes and code is committed
  - _Requirements: 26.8, 26.9, 26.10_

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Backtest visualization with multiple chart types
- ✅ Backtest execution and polling
- ✅ PDF export functionality
- ✅ Monte Carlo and walk-forward analysis
- ✅ All tests passing (unit, property, integration)
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 6: Risk Management](./phase-06-risk-management.md)
