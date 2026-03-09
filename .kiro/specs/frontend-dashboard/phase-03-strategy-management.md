# Phase 3: Strategy Management (Week 3)

[← Back to Overview](./00-overview.md) | [Previous: Phase 2](./phase-02-layout-dashboard.md) | [Next: Phase 4 →](./phase-04-trade-history.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 2 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 3, verify:
- [ ] Phase 2 git commit exists: `git log --oneline --grep="feat: Phase 2"`
- [ ] Phase 2 verification passed (build, run, test)
- [ ] Dashboard and layout are functional
- [ ] Environment switching works
- [ ] WebSocket connection established
- [ ] All Phase 2 tests passing

### If Phase 2 is Incomplete
1. **STOP** - Do not proceed with Phase 3
2. **NOTIFY** - "Phase 2 must be completed first"
3. **QUEUE** - Add Phase 3 to queue
4. **REDIRECT** - Complete Phase 2 first

## Phase Status

- **Dependencies:** Phase 1, Phase 2
- **Can Start:** Only if Phase 2 is COMPLETE
- **Blocks:** Phase 4, 5, 6, 7, 8, 9, 10, 11, 12, 13

## Tasks

- [ ] 3.1 Create strategies API slice with CRUD operations
  - Implement strategiesApi with getStrategies, startStrategy, stopStrategy, updateStrategyConfig mutations
  - Configure cache invalidation on mutations
  - Add optimistic updates for start/stop actions
  - Set up polling for strategy metrics (30 second interval)
  - _Requirements: 4.1, 4.6, 4.7, 4.8_

- [ ] 3.2 Build strategies page with strategy list
  - Create StrategiesPage component
  - Display list of all available strategies
  - Show strategy name, type, status badge (RUNNING/STOPPED/ERROR)
  - Display real-time metrics: P&L, trade count, current drawdown
  - Add loading and error states
  - _Requirements: 4.1, 4.2, 4.10_

- [ ] 3.3 Implement strategy card component with controls
  - Create StrategyCard component for individual strategy display
  - Add start button (visible when STOPPED)
  - Add stop button (visible when RUNNING)
  - Add configure button (always visible)
  - Show confirmation dialog before start/stop actions
  - Display status badge with color coding
  - _Requirements: 4.3, 4.4, 4.5, 4.11_

- [ ] 3.4 Create strategy configuration modal with validation
  - Build StrategyConfigModal component
  - Add input fields: symbol, timeframe, risk per trade, min/max position size
  - Implement Zod validation schema
  - Validate risk per trade is between 1% and 5%
  - Validate position sizes are positive numbers
  - Display inline error messages below invalid fields
  - Disable save button while validation errors exist
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 3.5 Implement strategy configuration save logic
  - Send PUT request to /api/strategies/config on save
  - Stop strategy before applying config if currently RUNNING
  - Close modal and show success notification on save
  - Handle API errors and display error notification
  - Invalidate strategy cache to refetch updated data
  - _Requirements: 5.8, 5.9, 5.10_

- [ ] 3.6 Add real-time strategy status updates via WebSocket
  - Subscribe to strategy.status WebSocket events
  - Update strategy status badge within 1 second of event
  - Update strategy metrics in real-time
  - Handle strategy error events with error notification
  - _Requirements: 4.11, 15.6_

- [ ] 3.7 Write unit tests for strategy components
  - Test StrategiesPage renders strategy list
  - Test StrategyCard displays correct status and metrics
  - Test start/stop buttons show confirmation dialogs
  - Test StrategyConfigModal form validation
  - Test configuration save flow
  - Achieve 80%+ coverage
  - _Requirements: 25.1, 25.4_

- [ ] 3.8 Write property tests for risk percentage validation
  - **Property 5: Risk Percentage Validation**
  - **Validates: Requirements 5.4, 13.2**
  - Test that risk values outside [1%, 5%] are rejected
  - Test that risk values within [1%, 5%] are accepted
  - Use fast-check with 100+ iterations
  - _Requirements: 30.1_

- [ ] 3.9 Write property tests for position size validation
  - **Property 6: Position Size Validation**
  - **Validates: Requirements 5.5**
  - Test that non-positive position sizes are rejected
  - Test that positive position sizes are accepted
  - Use fast-check with 100+ iterations
  - _Requirements: 30.1_

- [ ] 3.10 Write integration tests for strategy management
  - Test start strategy API call updates status to RUNNING
  - Test stop strategy API call updates status to STOPPED
  - Test update strategy configuration saves changes
  - Test WebSocket strategy.status event updates UI
  - Test optimistic updates revert on error
  - _Requirements: 30.4_

- [ ] 3.11 Checkpoint - Verify strategy management complete
  - Ensure all tests pass (unit, property, integration)
  - Verify start/stop/configure functionality works
  - Check real-time status updates via WebSocket
  - Ask user if questions arise

- [ ] 3.12 Phase 3 Verification - Build, Run, and Test Application
  - Stop all running services using `.\stop-all.ps1`
  - Build both backend and frontend using `.\build-all.ps1`
  - Verify builds complete successfully without errors
  - Start all services using `.\run-all.ps1`
  - Verify backend is accessible at http://localhost:8080
  - Verify frontend is accessible at http://localhost:5173
  - Test strategies page displays strategy list
  - Test start/stop strategy functionality
  - Test strategy configuration modal and validation
  - Test real-time strategy status updates
  - If any issues found, diagnose and repair immediately
  - Once all verification passes, commit to git:
    - `git add .`
    - `git commit -m "feat: Phase 3 - Strategy management complete"`
    - `git push origin main` (or your branch)
  - Do not proceed to Phase 4 until all verification passes and code is committed
  - _Requirements: 26.8, 26.9, 26.10_

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Strategy management with start/stop/configure
- ✅ Real-time strategy status updates via WebSocket
- ✅ Strategy configuration with validation
- ✅ All tests passing (unit, property, integration)
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 4: Trade History and Details](./phase-04-trade-history.md)
