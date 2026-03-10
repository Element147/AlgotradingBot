# Phase 2: Core Layout and Dashboard (Week 2)

[← Back to Overview](./00-overview.md) | [Previous: Phase 1](./phase-01-authentication.md) | [Next: Phase 3 →](./phase-03-strategy-management.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 1 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 2, verify:
- [x] Phase 1 git commit exists: `git log --oneline --grep="feat: Phase 1"`
- [x] Phase 1 verification passed (build, run, test)
- [x] Authentication module is functional
- [x] All Phase 1 tests passing (97/97 tests passing)

### If Phase 1 is Incomplete
1. **STOP** - Do not proceed with Phase 2
2. **NOTIFY** - "Phase 1 must be completed first"
3. **QUEUE** - Add Phase 2 to queue
4. **REDIRECT** - Complete Phase 1 first

## Phase Status

- **Dependencies:** Phase 1 (Authentication)
- **Can Start:** Only if Phase 1 is COMPLETE
- **Blocks:** Phase 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13

## Tasks

- [x] 2.1 Create app layout with responsive sidebar and header
  - Build AppLayout component with sidebar, header, and main content area
  - Implement Sidebar component with navigation links
  - Create Header component with user menu and notifications bell
  - Add hamburger menu for mobile (< 960px width)
  - Implement responsive breakpoints (mobile < 600px, tablet 600-960px, desktop > 960px)
  - _Requirements: 16.1, 16.2_

- [x] 2.2 Set up React Router with protected routes
  - Configure BrowserRouter with route definitions
  - Create routes for dashboard, strategies, trades, backtest, risk, settings
  - Wrap all routes with ProtectedRoute component
  - Implement lazy loading for each route component
  - Add loading fallback UI (skeleton screens)
  - _Requirements: 19.1, 19.2_

- [x] 2.3 Implement environment state slice and switch component
  - Create environmentSlice with mode, connectedExchange, lastSyncTime state
  - Add setEnvironmentMode, setConnectedExchange, updateSyncTime actions
  - Build EnvironmentSwitch toggle component (Test/Backtest vs Live Trading)
  - Add confirmation dialog when switching environments
  - Persist environment mode to localStorage
  - Display environment badge indicator
  - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.17_

- [x] 2.4 Create account API slice with balance endpoint
  - Implement accountApi with getBalance and getPerformance queries
  - Configure environment-aware base query (X-Environment header)
  - Set up cache invalidation tags
  - Add polling for live environment (60 second interval)
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 2.5 Build dashboard page with balance and performance cards
  - Create DashboardPage component as main landing page
  - Build BalanceCard showing total, available, locked balance
  - Display asset breakdown (USDT, BTC, ETH)
  - Create PerformanceCard with profit/loss metrics (today, week, month, all-time)
  - Color-code profit (green) and loss (red)
  - Show cash to invested capital ratio
  - Add manual refresh button
  - _Requirements: 2.2, 2.8, 2.9, 2.10, 2.15_

- [x] 2.6 Set up WebSocket service and connection management
  - Create WebSocketManager class with connect, disconnect, subscribe methods
  - Implement connection with auth token in URL
  - Add reconnection logic (3 attempts, 5 second delay)
  - Create websocketSlice to track connection state
  - Implement event routing to Redux store
  - Add environment-aware channel subscriptions
  - _Requirements: 15.1, 15.2, 15.9, 15.10_

- [x] 2.7 Implement WebSocket middleware for Redux integration
  - Create websocketMiddleware to handle WebSocket events
  - Subscribe to balance.updated, trade.executed, position.updated events
  - Dispatch Redux actions on event receipt
  - Implement event throttling (max 1 update per second per type)
  - Pause event processing when tab is inactive
  - _Requirements: 15.3, 15.4, 15.5, 15.11, 15.12_

- [x] 2.8 Create theme slice and toggle component
  - Implement settingsSlice with theme, currency, timezone state
  - Create Material-UI theme provider with light and dark themes
  - Build theme toggle button in header
  - Apply theme immediately without page reload
  - Persist theme preference to localStorage
  - _Requirements: 14.6, 14.7, 14.8, 23.5, 23.6_

- [x] 2.9 Display open positions and recent trades on dashboard
  - Create PositionsList component showing open positions
  - Display entry price, current price, unrealized P&L for each position
  - Create RecentTradesList showing last 10 completed trades
  - Display symbol, entry/exit prices, P&L, timestamp
  - Update in real-time via WebSocket events
  - _Requirements: 2.12, 2.13_

- [x] 2.10 Add system health indicator and connection status
  - Create SystemHealthIndicator component
  - Display backend API connection status (connected/disconnected)
  - Show WebSocket connection status with reconnection attempts
  - Display last data update timestamp
  - Show circuit breaker status
  - _Requirements: 2.14, 2.15, 2.16_

- [x] 2.11 Write unit tests for layout and dashboard components
  - Test AppLayout renders sidebar, header, and content
  - Test Sidebar navigation links
  - Test EnvironmentSwitch toggle and confirmation dialog
  - Test BalanceCard displays balance data correctly
  - Test PerformanceCard color-coding
  - Achieve 80%+ coverage
  - _Requirements: 25.1, 25.4_

- [x] 2.12 Write property tests for environment persistence
  - **Property 3: Environment Mode Persistence**
  - **Validates: Requirements 2.6**
  - Test that any environment mode selection is persisted to localStorage
  - **Property 4: Environment Mode Restoration Round-Trip**
  - **Validates: Requirements 2.7**
  - Test that persisted environment mode is restored correctly on startup
  - Use fast-check with 100+ iterations
  - _Requirements: 30.1_

- [x] 2.13 Write integration tests for environment switching
  - Test environment switch updates X-Environment header in API calls
  - Test switching from test to live fetches different balance data
  - Test WebSocket reconnects with new environment channels
  - Test environment mode persists across page reload
  - _Requirements: 30.19_

- [x] 2.14 Write integration tests for WebSocket communication
  - Test WebSocket connection establishment with auth token
  - Test balance.updated event updates Redux state
  - Test trade.executed event updates trade history
  - Test position.updated event updates position display
  - Test reconnection after connection loss
  - _Requirements: 30.8_

- [x] 2.15 Checkpoint - Verify dashboard and layout complete
  - Ensure all tests pass (unit, property, integration)
  - Verify environment switching works correctly
  - Check WebSocket connection and real-time updates
  - Ask user if questions arise

- [ ] 2.16 Phase 2 Verification - Build, Run, and Test Application
  - Stop all running services using `.\stop-all.ps1`
  - Build both backend and frontend using `.\build-all.ps1`
  - Verify builds complete successfully without errors
  - Start all services using `.\run-all.ps1`
  - Verify backend is accessible at http://localhost:8080
  - Verify frontend is accessible at http://localhost:5173
  - Test dashboard page loads and displays balance/performance cards
  - Test environment switching between test and live modes
  - Test WebSocket connection status indicator
  - Test sidebar navigation and responsive layout
  - If any issues found, diagnose and repair immediately
  - Once all verification passes, commit to git:
    - `git add .`
    - `git commit -m "feat: Phase 2 - Core layout and dashboard complete"`
    - `git push origin main` (or your branch)
  - Do not proceed to Phase 3 until all verification passes and code is committed
  - _Requirements: 26.8, 26.9, 26.10_

- [x] 2.17 Backend - Implement Account and Dashboard API Endpoints
  - **Location:** `AlgotradingBot/src/main/java/com/algotrader/bot/`
  - Create `controller/AccountController.java` with REST endpoints
  - Implement GET `/api/account/balance` endpoint with `?env=test|live` query parameter
  - Return balance data: total, available, locked, assets breakdown (USDT, BTC, ETH)
  - Implement GET `/api/account/performance` endpoint with timeframe parameter
  - Return performance metrics: totalProfitLoss, profitLossPercentage, winRate, tradeCount, cashRatio
  - Support timeframes: today, week, month, all-time
  - Create `service/AccountService.java` to fetch balance from test DB or live exchange API
  - Implement environment routing logic (test = PostgreSQL, live = Exchange API)
  - Add `@Secured` annotation to require authentication
  - Create GET `/api/positions/open` endpoint returning open positions with unrealized P&L
  - Create GET `/api/trades/recent?limit=10` endpoint for recent completed trades
  - Implement WebSocket endpoint `/ws` for real-time updates
  - Create `websocket/WebSocketHandler.java` to handle connections and subscriptions
  - Implement event publishing for `balance.updated`, `trade.executed`, `position.updated`
  - Add environment-aware WebSocket channels (test.balance, live.balance, etc.)
  - Write unit tests for AccountService (balance calculation, performance metrics)
  - Write integration tests for AccountController endpoints
  - Test WebSocket connection and event publishing
  - _Requirements: 2.2, 2.3, 2.4, 2.8, 2.9, 2.10, 2.12, 2.13, 15.1, 15.2, 15.3, 15.4, 15.5_
  - **Dependencies:** Add to `build.gradle.kts`:
    - `implementation("org.springframework.boot:spring-boot-starter-websocket")`

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Core layout with responsive sidebar and header
- ✅ Dashboard with balance and performance cards
- ✅ Environment switching (test/live modes)
- ✅ WebSocket real-time updates
- ✅ All tests passing (unit, property, integration)
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 3: Strategy Management](./phase-03-strategy-management.md)
