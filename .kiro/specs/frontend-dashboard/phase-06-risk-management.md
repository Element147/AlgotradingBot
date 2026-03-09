# Phase 6: Risk Management (Week 6)

[← Back to Overview](./00-overview.md) | [Previous: Phase 5](./phase-05-backtest-visualization.md) | [Next: Phase 7 →](./phase-07-settings-exchange.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 5 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 6, verify:
- [ ] Phase 5 git commit exists: `git log --oneline --grep="feat: Phase 5"`
- [ ] Phase 5 verification passed (build, run, test)
- [ ] Backtest visualization is functional
- [ ] All Phase 5 tests passing

### If Phase 5 is Incomplete
1. **STOP** - Do not proceed with Phase 6
2. **NOTIFY** - "Phase 5 must be completed first"
3. **QUEUE** - Add Phase 6 to queue
4. **REDIRECT** - Complete Phase 5 first

## Phase Status

- **Dependencies:** Phase 1, 2, 3, 4, 5
- **Can Start:** Only if Phase 5 is COMPLETE
- **Blocks:** Phase 7, 8, 9, 10, 11, 12, 13

## Tasks

- [ ] 6.1 Create risk API slice with status and config endpoints
  - Implement riskApi with getRiskStatus, getRiskConfig, updateRiskConfig, overrideCircuitBreaker mutations
  - Configure polling for risk status (30 second interval)
  - Set up cache invalidation on mutations
  - _Requirements: 10.7, 13.9_

- [ ] 6.2 Build risk management page layout
  - Create RiskPage component
  - Organize sections: risk metrics, circuit breakers, position calculator, configuration
  - Add loading and error states
  - _Requirements: 11.1_

- [ ] 6.3 Implement risk metrics display with progress bars
  - Create RiskMetrics component
  - Display current drawdown with progress bar (current/max limit)
  - Display daily loss limit with progress bar (used/available)
  - Display open risk exposure as percentage of account balance
  - Display position correlation
  - Color-code: green (safe), yellow (warning), red (danger)
  - Update in real-time via WebSocket
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 6.4 Create circuit breaker management panel
  - Build CircuitBreakerPanel component
  - Display list of active circuit breakers
  - Show trigger condition, activation time, reset time for each
  - Add manual override button with password confirmation
  - Display risk alerts log with timestamp, type, severity, action
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.7_

- [ ] 6.5 Implement circuit breaker override with password
  - Create password confirmation dialog
  - Send POST request to /api/risk/circuit-breaker/override with password
  - Display error if password is incorrect
  - Display success notification on override
  - Invalidate risk status cache to refetch
  - _Requirements: 11.3, 11.4, 11.5_

- [ ] 6.6 Add high-priority notifications for circuit breakers and risk alerts
  - Display high-priority notification when circuit breaker triggers
  - Display notification when risk alert event received via WebSocket
  - Play subtle sound for high-priority notifications
  - Keep notifications visible until manually dismissed
  - _Requirements: 11.6, 15.7, 21.9_

- [ ] 6.7 Create position sizing calculator widget
  - Build PositionSizingCalculator component
  - Add input fields: account balance, risk percentage, stop-loss distance
  - Calculate position size in real-time on input change
  - Display result in both units and dollar value
  - Validate risk percentage is between 0.1% and 5%
  - Validate stop-loss distance is positive
  - Display error messages for invalid inputs
  - Use BigDecimal precision for calculations
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 6.8 Implement risk configuration form
  - Create risk configuration form with fields: max risk per trade, max daily loss limit, max drawdown limit, max open positions, correlation limits
  - Validate max risk per trade is between 1% and 5%
  - Validate max daily loss limit is between 1% and 10%
  - Validate max drawdown limit is between 10% and 50%
  - Validate max open positions is between 1 and 10
  - Send PUT request to /api/risk/config on save
  - Display success notification on save
  - Display error notification if rejected by backend
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [ ] 6.9 Add real-time risk updates via WebSocket
  - Subscribe to risk.alert WebSocket events
  - Update risk metrics within 1 second of event
  - Display high-priority notification for risk alerts
  - Update circuit breaker status in real-time
  - _Requirements: 10.6, 10.8, 15.7_

- [ ] 6.10 Write unit tests for risk components
  - Test RiskMetrics displays correct values and colors
  - Test CircuitBreakerPanel shows active breakers
  - Test password confirmation dialog
  - Test PositionSizingCalculator calculations
  - Test risk configuration form validation
  - Achieve 80%+ coverage
  - _Requirements: 25.1, 25.4_

- [ ] 6.11 Write property tests for risk validation and calculations
  - **Property 11: Position Sizing Calculator Risk Validation**
  - **Validates: Requirements 12.5**
  - Test risk values outside [0.1%, 5%] are rejected
  - **Property 12: BigDecimal Precision Preservation**
  - **Validates: Requirements 12.8**
  - Test monetary calculations use BigDecimal precision (no floating-point errors)
  - **Property 13: Daily Loss Limit Validation**
  - **Validates: Requirements 13.3**
  - Test daily loss values outside [1%, 10%] are rejected
  - **Property 14: Drawdown Limit Validation**
  - **Validates: Requirements 13.4**
  - Test drawdown values outside [10%, 50%] are rejected
  - **Property 15: Open Positions Limit Validation**
  - **Validates: Requirements 13.5**
  - Test open positions values outside [1, 10] are rejected
  - Use fast-check with 100+ iterations for each property
  - _Requirements: 30.1_

- [ ] 6.12 Write integration tests for risk management
  - Test fetch risk status with metrics
  - Test update risk configuration
  - Test override circuit breaker with password
  - Test WebSocket risk.alert event updates UI
  - Test position sizing calculator calculations match backend
  - _Requirements: 30.7_

- [ ] 6.13 Checkpoint - Verify risk management complete
  - Ensure all tests pass (unit, property, integration)
  - Verify risk metrics display correctly
  - Check circuit breaker override works
  - Verify position calculator accuracy
  - Ask user if questions arise

- [ ] 6.14 Phase 6 Verification - Build, Run, and Test Application
  - Stop all running services using `.\stop-all.ps1`
  - Build both backend and frontend using `.\build-all.ps1`
  - Verify builds complete successfully without errors
  - Start all services using `.\run-all.ps1`
  - Verify backend is accessible at http://localhost:8080
  - Verify frontend is accessible at http://localhost:5173
  - Test risk management page displays risk metrics
  - Test circuit breaker panel and override functionality
  - Test position sizing calculator with various inputs
  - Test risk configuration form and validation
  - Test real-time risk updates via WebSocket
  - If any issues found, diagnose and repair immediately
  - Once all verification passes, commit to git:
    - `git add .`
    - `git commit -m "feat: Phase 6 - Risk management complete"`
    - `git push origin main` (or your branch)
  - Do not proceed to Phase 7 until all verification passes and code is committed
  - _Requirements: 26.8, 26.9, 26.10_

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Risk management with metrics and circuit breakers
- ✅ Position sizing calculator
- ✅ Risk configuration with validation
- ✅ Real-time risk updates via WebSocket
- ✅ All tests passing (unit, property, integration)
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 7: Settings and Exchange Integration](./phase-07-settings-exchange.md)
