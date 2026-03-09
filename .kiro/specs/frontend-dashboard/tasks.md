# Implementation Plan: Frontend Dashboard

## Overview

This implementation plan transforms the frontend dashboard requirements and design into actionable coding tasks. The plan follows a 13-week roadmap with incremental development, comprehensive testing, and integration validation after each phase. Each task builds on previous work, ensuring no orphaned code and complete feature integration.

The dashboard is a production-grade React TypeScript SPA providing real-time trading monitoring, strategy management, trade analytics, backtest visualization, and risk management. It connects to the Spring Boot backend via REST APIs and WebSocket for live updates.

**Repository Structure:**
```
repository-root/
├── AlgotradingBot/          # Spring Boot backend
│   ├── src/
│   ├── build.gradle.kts
│   └── ...
├── frontend/                 # React TypeScript frontend (NEW)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── .gitignore               # Updated to include frontend/node_modules and frontend/dist
└── README.md
```

Both frontend and backend will coexist in the same Git repository, allowing for coordinated development and deployment.

## Tasks

- [ ] 1. Phase 1: Project Setup and Authentication (Week 1)
  - [x] 1.1 Initialize Vite + React + TypeScript project with strict mode
    - Create new directory `frontend/` at repository root (same level as AlgotradingBot/)
    - Initialize Vite project with React-TS template inside `frontend/` directory
    - Configure TypeScript with strict mode enabled
    - Set up project directory structure (features, components, hooks, services, utils, types)
    - Install core dependencies: React 18+, React Router v6, Redux Toolkit, RTK Query
    - Configure path aliases in tsconfig.json and vite.config.ts
    - Update root .gitignore to include frontend/node_modules and frontend/dist
    - _Requirements: 26.1, 26.2, 28.2_
    - **Note:** Frontend will be in `frontend/` folder, backend in `AlgotradingBot/` folder within same repository
  
  - [x] 1.2 Configure code quality tools (ESLint, Prettier, Vitest)
    - Install and configure ESLint with Airbnb React config
    - Install and configure Prettier with consistent formatting rules
    - Set up Vitest as test runner with React Testing Library
    - Configure test setup file with global mocks and utilities
    - Add pre-commit hooks with Husky and lint-staged
    - _Requirements: 26.9, 28.1_
  
  - [x] 1.3 Set up Redux store with RTK Query base configuration
    - Create Redux store with configureStore
    - Implement base query with environment injection middleware
    - Configure RTK Query with retry logic and error handling
    - Set up Redux DevTools integration
    - Create root reducer combining all slices
    - _Requirements: 23.1, 23.2_
  
  - [ ] 1.4 Implement authentication state slice and API
    - Create authSlice with login, logout, setToken, and session management actions
    - Implement authApi with login, logout, refresh, and getMe endpoints
    - Add token storage in memory and session storage
    - Implement automatic token refresh on 401 errors
    - Add session timeout logic (30 minutes inactivity)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [ ] 1.5 Create login page with form validation
    - Build LoginPage component with username, password, and "remember me" fields
    - Implement form validation using Zod schema
    - Add loading states and error display
    - Handle successful login with redirect to dashboard
    - Style with Material-UI components
    - _Requirements: 1.1, 1.2_
  
  - [ ] 1.6 Implement protected route component with role-based access
    - Create ProtectedRoute wrapper component
    - Check authentication status and redirect to login if needed
    - Implement role-based access control (admin vs trader)
    - Add loading state while checking auth
    - _Requirements: 24.7, 24.8_
  
  - [ ] 1.7 Set up error boundary for React error handling
    - Create ErrorBoundary class component
    - Implement getDerivedStateFromError and componentDidCatch
    - Create ErrorFallback UI with reload button
    - Integrate with error tracking service (Sentry placeholder)
    - Wrap app and route-level components with error boundaries
    - _Requirements: 18.8, 27.2_
  
  - [ ] 1.8 Configure environment variables and API client
    - Set up .env files for development and production
    - Configure VITE_API_BASE_URL and VITE_WS_URL variables
    - Create Axios instance with base configuration
    - Add request/response interceptors for auth tokens
    - Implement automatic token refresh interceptor
    - _Requirements: 26.3, 26.4, 24.2_
  
  - [ ] 1.9 Write unit tests for auth slice and components
    - Test authSlice reducers (login, logout, setToken)
    - Test LoginPage component rendering and form submission
    - Test ProtectedRoute redirect logic
    - Test ErrorBoundary error catching
    - Achieve 80%+ coverage for auth module
    - _Requirements: 25.1, 25.2, 25.4_

  - [ ] 1.10 Write property test for authentication token inclusion
    - **Property 1: Authentication Token Inclusion**
    - **Validates: Requirements 1.4, 24.2**
    - Test that all authenticated API requests include token in Authorization header
    - Use fast-check with 100+ iterations testing random tokens and endpoints
    - _Requirements: 30.1, 30.9_
  
  - [ ] 1.11 Write integration tests for authentication flow
    - Test login with valid credentials stores token and redirects
    - Test login with invalid credentials shows error
    - Test token refresh on 401 error
    - Test logout clears session and redirects to login
    - Use MSW to mock backend responses
    - _Requirements: 30.3_
  
  - [ ] 1.12 Checkpoint - Verify authentication module complete
    - Ensure all tests pass (unit, property, integration)
    - Verify login/logout flow works end-to-end
    - Check code coverage meets 80% threshold
    - Ask user if questions arise
  
  - [ ] 1.13 Phase 1 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify builds complete successfully without errors
    - Start all services using `.\run-all.ps1`
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Verify Swagger UI works at http://localhost:8080/swagger-ui.html
    - Test authentication endpoints via Swagger or curl
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 1 - Authentication module complete"`
      - `git push origin main` (or your branch)
    - Do not proceed to Phase 2 until all verification passes and code is committed
    - _Requirements: 26.8, 26.9, 26.10_

- [ ] 2. Phase 2: Core Layout and Dashboard (Week 2)
  - [ ] 2.1 Create app layout with responsive sidebar and header
    - Build AppLayout component with sidebar, header, and main content area
    - Implement Sidebar component with navigation links
    - Create Header component with user menu and notifications bell
    - Add hamburger menu for mobile (< 960px width)
    - Implement responsive breakpoints (mobile < 600px, tablet 600-960px, desktop > 960px)
    - _Requirements: 16.1, 16.2_
  
  - [ ] 2.2 Set up React Router with protected routes
    - Configure BrowserRouter with route definitions
    - Create routes for dashboard, strategies, trades, backtest, risk, settings
    - Wrap all routes with ProtectedRoute component
    - Implement lazy loading for each route component
    - Add loading fallback UI (skeleton screens)
    - _Requirements: 19.1, 19.2_
  
  - [ ] 2.3 Implement environment state slice and switch component
    - Create environmentSlice with mode, connectedExchange, lastSyncTime state
    - Add setEnvironmentMode, setConnectedExchange, updateSyncTime actions
    - Build EnvironmentSwitch toggle component (Test/Backtest vs Live Trading)
    - Add confirmation dialog when switching environments
    - Persist environment mode to localStorage
    - Display environment badge indicator
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.17_
  
  - [ ] 2.4 Create account API slice with balance endpoint
    - Implement accountApi with getBalance and getPerformance queries
    - Configure environment-aware base query (X-Environment header)
    - Set up cache invalidation tags
    - Add polling for live environment (60 second interval)
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 2.5 Build dashboard page with balance and performance cards
    - Create DashboardPage component as main landing page
    - Build BalanceCard showing total, available, locked balance
    - Display asset breakdown (USDT, BTC, ETH)
    - Create PerformanceCard with profit/loss metrics (today, week, month, all-time)
    - Color-code profit (green) and loss (red)
    - Show cash to invested capital ratio
    - Add manual refresh button
    - _Requirements: 2.2, 2.8, 2.9, 2.10, 2.15_

  - [ ] 2.6 Set up WebSocket service and connection management
    - Create WebSocketManager class with connect, disconnect, subscribe methods
    - Implement connection with auth token in URL
    - Add reconnection logic (3 attempts, 5 second delay)
    - Create websocketSlice to track connection state
    - Implement event routing to Redux store
    - Add environment-aware channel subscriptions
    - _Requirements: 15.1, 15.2, 15.9, 15.10_
  
  - [ ] 2.7 Implement WebSocket middleware for Redux integration
    - Create websocketMiddleware to handle WebSocket events
    - Subscribe to balance.updated, trade.executed, position.updated events
    - Dispatch Redux actions on event receipt
    - Implement event throttling (max 1 update per second per type)
    - Pause event processing when tab is inactive
    - _Requirements: 15.3, 15.4, 15.5, 15.11, 15.12_
  
  - [ ] 2.8 Create theme slice and toggle component
    - Implement settingsSlice with theme, currency, timezone state
    - Create Material-UI theme provider with light and dark themes
    - Build theme toggle button in header
    - Apply theme immediately without page reload
    - Persist theme preference to localStorage
    - _Requirements: 14.6, 14.7, 14.8, 23.5, 23.6_
  
  - [ ] 2.9 Display open positions and recent trades on dashboard
    - Create PositionsList component showing open positions
    - Display entry price, current price, unrealized P&L for each position
    - Create RecentTradesList showing last 10 completed trades
    - Display symbol, entry/exit prices, P&L, timestamp
    - Update in real-time via WebSocket events
    - _Requirements: 2.12, 2.13_
  
  - [ ] 2.10 Add system health indicator and connection status
    - Create SystemHealthIndicator component
    - Display backend API connection status (connected/disconnected)
    - Show WebSocket connection status with reconnection attempts
    - Display last data update timestamp
    - Show circuit breaker status
    - _Requirements: 2.14, 2.15, 2.16_
  
  - [ ] 2.11 Write unit tests for layout and dashboard components
    - Test AppLayout renders sidebar, header, and content
    - Test Sidebar navigation links
    - Test EnvironmentSwitch toggle and confirmation dialog
    - Test BalanceCard displays balance data correctly
    - Test PerformanceCard color-coding
    - Achieve 80%+ coverage
    - _Requirements: 25.1, 25.4_
  
  - [ ] 2.12 Write property tests for environment persistence
    - **Property 3: Environment Mode Persistence**
    - **Validates: Requirements 2.6**
    - Test that any environment mode selection is persisted to localStorage
    - **Property 4: Environment Mode Restoration Round-Trip**
    - **Validates: Requirements 2.7**
    - Test that persisted environment mode is restored correctly on startup
    - Use fast-check with 100+ iterations
    - _Requirements: 30.1_
  
  - [ ] 2.13 Write integration tests for environment switching
    - Test environment switch updates X-Environment header in API calls
    - Test switching from test to live fetches different balance data
    - Test WebSocket reconnects with new environment channels
    - Test environment mode persists across page reload
    - _Requirements: 30.19_
  
  - [ ] 2.14 Write integration tests for WebSocket communication
    - Test WebSocket connection establishment with auth token
    - Test balance.updated event updates Redux state
    - Test trade.executed event updates trade history
    - Test position.updated event updates position display
    - Test reconnection after connection loss
    - _Requirements: 30.8_
  
  - [ ] 2.15 Checkpoint - Verify dashboard and layout complete
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

- [ ] 3. Phase 3: Strategy Management (Week 3)
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

- [ ] 4. Phase 4: Trade History and Details (Week 4)
  - [ ] 4.1 Create trades API slice with history and details endpoints
    - Implement tradesApi with getTradeHistory, getTradeDetails, getTradeStatistics queries
    - Support pagination parameters (page, pageSize)
    - Support filter parameters (date range, symbol, status, strategy)
    - Support sort parameters (column, direction)
    - Configure caching with 5 minute TTL
    - _Requirements: 6.1, 6.6, 7.2_
  
  - [ ] 4.2 Build trades page with paginated table
    - Create TradesPage component
    - Display paginated table with 50 trades per page
    - Show columns: ID, timestamp, symbol, side, entry/exit prices, quantity, P&L, P&L %, duration, strategy
    - Add pagination controls (current page, total pages, next/previous buttons)
    - Add loading skeleton for table rows
    - _Requirements: 6.1, 6.2, 6.9_
  
  - [ ] 4.3 Implement virtualized trade table for performance
    - Use @tanstack/react-virtual for virtualization
    - Render only visible rows (50px height each)
    - Add 10 row overscan for smooth scrolling
    - Optimize for tables with 100+ rows
    - _Requirements: 19.3_
  
  - [ ] 4.4 Add table sorting functionality
    - Make all column headers clickable
    - Toggle between ascending and descending sort on click
    - Display sort indicator (arrow icon) on active column
    - Fetch sorted data from API
    - _Requirements: 6.3, 6.4_
  
  - [ ] 4.5 Implement trade filtering controls
    - Create filter panel with date range picker, symbol dropdown, status dropdown, strategy dropdown
    - Fetch filtered data from API when filters change
    - Update URL query parameters to persist filters
    - Restore filters from URL on page load
    - Clear filters button to reset all
    - _Requirements: 6.5, 6.6, 23.7, 23.8_
  
  - [ ] 4.6 Add trade search with debouncing
    - Create search input for trade ID lookup
    - Implement 300ms debounce using useDebouncedCallback
    - Fetch search results from API
    - Display "no results" message when search returns empty
    - _Requirements: 6.7, 6.8, 19.4_
  
  - [ ] 4.7 Display aggregate trade statistics
    - Create TradeStatistics component above table
    - Show total trades, win rate, average win, average loss, profit factor
    - Calculate from filtered trade data
    - Update when filters change
    - _Requirements: 6.10_
  
  - [ ] 4.8 Create trade details modal with full information
    - Build TradeDetailsModal component
    - Fetch complete trade data from /api/trades/{id}
    - Display entry/exit reasons, slippage breakdown, fees breakdown
    - Show risk metrics: risk amount, reward amount, R-multiple, stop-loss, take-profit
    - Add price action chart during trade duration
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 4.9 Implement CSV export functionality
    - Create export button on trades page
    - Generate CSV file with all filtered trade records
    - Include column headers as first row
    - Format monetary values with 2 decimal places
    - Format timestamps in ISO 8601 format
    - Trigger browser download with filename trades_YYYY-MM-DD_HHmmss.csv
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_
  
  - [ ] 4.10 Write unit tests for trade components
    - Test TradesPage renders table with pagination
    - Test TradeTable sorting functionality
    - Test filter controls update query parameters
    - Test search input debouncing
    - Test TradeDetailsModal displays complete data
    - Test CSV export generates correct format
    - Achieve 80%+ coverage
    - _Requirements: 25.1, 25.4_

  - [ ] 4.11 Write property tests for table sorting and CSV export
    - **Property 7: Table Sorting Correctness**
    - **Validates: Requirements 6.4**
    - Test that sorting by any column produces correctly ordered data
    - **Property 8: R-Multiple Calculation Correctness**
    - **Validates: Requirements 7.5**
    - Test R-multiple = (exit - entry) / (entry - stopLoss) for all trades
    - **Property 17: CSV Export Column Headers**
    - **Validates: Requirements 20.3**
    - Test CSV always includes headers as first row
    - **Property 18: CSV Monetary Value Formatting**
    - **Validates: Requirements 20.4**
    - Test all monetary values have exactly 2 decimal places
    - **Property 19: CSV Timestamp Formatting**
    - **Validates: Requirements 20.5**
    - Test all timestamps are in ISO 8601 format
    - Use fast-check with 100+ iterations for each property
    - _Requirements: 30.1_
  
  - [ ] 4.12 Write integration tests for trade history
    - Test fetch trade history with pagination
    - Test filter trades by date range, symbol, status
    - Test sort trades by column (ascending/descending)
    - Test search trades by ID
    - Test fetch trade details by ID
    - Test export trades to CSV
    - Verify pagination, filtering, sorting functionality
    - _Requirements: 30.5, 30.14, 30.15_
  
  - [ ] 4.13 Checkpoint - Verify trade history complete
    - Ensure all tests pass (unit, property, integration)
    - Verify pagination, sorting, filtering work correctly
    - Check CSV export generates valid files
    - Ask user if questions arise
  
  - [ ] 4.14 Phase 4 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify builds complete successfully without errors
    - Start all services using `.\run-all.ps1`
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Test trades page displays paginated trade history
    - Test table sorting by different columns
    - Test filtering by date range, symbol, status
    - Test trade search functionality
    - Test trade details modal
    - Test CSV export functionality
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 4 - Trade history and details complete"`
      - `git push origin main` (or your branch)
    - Do not proceed to Phase 5 until all verification passes and code is committed
    - _Requirements: 26.8, 26.9, 26.10_

- [ ] 5. Phase 5: Backtest Visualization (Week 5)
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

- [ ] 6. Phase 6: Risk Management (Week 6)
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

- [ ] 7. Phase 7: Settings and Exchange Integration (Week 7)
  - [ ] 7.1 Create exchange API slice with balance and connection endpoints
    - Implement exchangeApi with getExchangeBalance, getExchangeOrders, testExchangeConnection mutation
    - Configure polling for live balance (60 second interval)
    - Add cache invalidation on connection test
    - _Requirements: 31.2, 31.9_
  
  - [ ] 7.2 Build settings page with multiple sections
    - Create SettingsPage component
    - Organize sections: API configuration, notifications, display preferences, database management
    - Add tabbed navigation for sections
    - _Requirements: 14.1_
  
  - [ ] 7.3 Implement API configuration section
    - Display masked API keys with reveal button
    - Add "Test Connection" button
    - Send request to /api/system/test-connection on click
    - Display success message with rate limit info on success
    - Display error message on failure
    - _Requirements: 14.2, 14.3, 14.4_
  
  - [ ] 7.4 Create notification settings section
    - Add toggle switches for email alerts, Telegram notifications
    - Add input fields for alert thresholds (profit/loss, drawdown, risk)
    - Save settings to backend on change
    - Persist to localStorage
    - _Requirements: 14.5_
  
  - [ ] 7.5 Implement display preferences section
    - Add theme selector (light/dark) with immediate preview
    - Add currency display options (USD/BTC)
    - Add timezone selection with auto-detection
    - Persist all preferences to localStorage
    - Apply changes immediately without reload
    - _Requirements: 14.6, 14.7, 14.8, 14.9, 14.10_
  
  - [ ] 7.6 Add database management section
    - Display system information: app version, last deployment date, database status, Kafka status
    - Add database backup button
    - Trigger /api/system/backup on click
    - Display success/error notification
    - _Requirements: 14.11, 14.12_
  
  - [ ] 7.7 Create exchange balance display for live mode
    - Display connected exchange name (Binance, Coinbase, Kraken)
    - Show available, locked, and total balance from exchange
    - Display balance breakdown by asset (USDT, BTC, ETH)
    - Add manual refresh button
    - Auto-refresh every 60 seconds in live mode
    - Display last sync timestamp
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7_
  
  - [ ] 7.8 Implement exchange connection status and testing
    - Display exchange API connection status (connected/disconnected)
    - Show error message if connection fails
    - Add "Test Connection" button to verify connectivity
    - Display exchange API rate limit info and usage
    - Warn when approaching rate limits
    - _Requirements: 31.8, 31.9, 31.10, 31.11_
  
  - [ ] 7.9 Add exchange order display
    - Fetch and display open orders from connected exchange
    - Show order ID, symbol, side, price, quantity, status
    - Synchronize with exchange account positions
    - Display exchange-specific trading fees and limits
    - _Requirements: 31.12, 31.13, 31.14, 31.15_
  
  - [ ] 7.10 Write unit tests for settings components
    - Test SettingsPage renders all sections
    - Test API configuration with masked keys
    - Test notification settings toggles
    - Test display preferences apply immediately
    - Test exchange balance display
    - Achieve 80%+ coverage
    - _Requirements: 25.1, 25.4_

  - [ ] 7.11 Write property tests for user preferences persistence
    - **Property 21: User Preferences Persistence**
    - **Validates: Requirements 23.5**
    - Test that any preference change is persisted to localStorage
    - **Property 22: User Preferences Restoration Round-Trip**
    - **Validates: Requirements 23.6**
    - Test that persisted preferences are restored correctly on startup
    - Use fast-check with 100+ iterations
    - _Requirements: 30.1_
  
  - [ ] 7.12 Write integration tests for settings and exchange
    - Test API connection test endpoint
    - Test fetch exchange balance in live mode
    - Test exchange connection status
    - Test update notification settings
    - Test persist and restore display preferences
    - _Requirements: 30.1_
  
  - [ ] 7.13 Checkpoint - Verify settings and exchange integration complete
    - Ensure all tests pass (unit, property, integration)
    - Verify exchange balance displays correctly in live mode
    - Check settings persist and restore properly
    - Ask user if questions arise
  
  - [ ] 7.14 Phase 7 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify builds complete successfully without errors
    - Start all services using `.\run-all.ps1`
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Test settings page displays all sections
    - Test API configuration and connection testing
    - Test notification settings toggles
    - Test display preferences (theme, currency, timezone)
    - Test exchange balance display in live mode
    - Test database management functions
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 7 - Settings and exchange integration complete"`
      - `git push origin main` (or your branch)
    - Do not proceed to Phase 8 until all verification passes and code is committed
    - _Requirements: 26.8, 26.9, 26.10_

- [ ] 8. Phase 8: Charts and Visualization (Week 8)
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

- [ ] 9. Phase 9: Performance Optimization (Week 9)
  - [ ] 9.1 Implement code splitting for all route components
    - Use React.lazy() for all page components
    - Configure Suspense with loading fallbacks
    - Create separate bundles for each route
    - Verify bundle sizes with rollup-plugin-visualizer
    - _Requirements: 19.1, 26.7_
  
  - [ ] 9.2 Add virtualization for all large lists
    - Implement virtualization for trade history table (100+ rows)
    - Implement virtualization for strategy list if needed
    - Use @tanstack/react-virtual consistently
    - Measure scroll performance improvement
    - _Requirements: 19.3_
  
  - [ ] 9.3 Optimize WebSocket event handling with throttling
    - Throttle balance updates to max 1 per second
    - Throttle position updates to max 1 per second
    - Batch multiple Redux updates within 16ms
    - Pause event processing when tab is inactive
    - _Requirements: 15.11, 15.12, 19.7_
  
  - [ ] 9.4 Implement comprehensive caching strategy
    - Configure RTK Query cache TTL (5 minutes default)
    - Implement optimistic updates for mutations
    - Cache static data (strategies, symbols) longer
    - Preload critical data on app startup
    - _Requirements: 19.5, 19.6, 19.9, 23.3, 23.4_
  
  - [ ] 9.5 Add background tab optimization
    - Pause polling when tab is inactive
    - Pause WebSocket event processing when inactive
    - Resume on tab activation
    - Use Page Visibility API
    - _Requirements: 19.8_
  
  - [ ] 9.6 Optimize bundle size with Vite configuration
    - Configure manual chunks for vendor libraries
    - Split react, redux, ui, and chart vendors
    - Enable terser minification with console.log removal
    - Generate source maps for debugging
    - Analyze bundle with visualizer
    - _Requirements: 26.5, 26.6_
  
  - [ ] 9.7 Run Lighthouse audits and optimize
    - Measure Core Web Vitals (LCP, FID, CLS)
    - Achieve initial load < 3 seconds on 3G
    - Achieve Lighthouse performance score ≥ 90
    - Optimize images and assets
    - Implement resource hints (preload, prefetch)
    - _Requirements: 19.2, 19.10, 27.4_
  
  - [ ] 9.8 Checkpoint - Verify performance optimization complete
    - Ensure Lighthouse score ≥ 90
    - Verify initial load < 3 seconds
    - Check bundle sizes are optimized
    - Verify smooth scrolling and interactions
    - Ask user if questions arise
  
  - [ ] 9.9 Phase 9 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify builds complete successfully without errors
    - Measure build time (should be < 2 minutes)
    - Check bundle sizes with visualizer
    - Start all services using `.\run-all.ps1`
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Test initial page load time (should be < 3 seconds)
    - Run Lighthouse audit (score should be ≥ 90)
    - Test virtualized lists scroll smoothly
    - Test code splitting with network tab
    - Test WebSocket throttling with rapid updates
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 9 - Performance optimization complete"`
      - `git push origin main` (or your branch)
    - Do not proceed to Phase 10 until all verification passes and code is committed
    - _Requirements: 26.8, 26.9, 26.10, 19.2, 19.10_

- [ ] 10. Phase 10: Security Hardening (Week 10)
  - [ ] 10.1 Enforce HTTPS in production environment
    - Configure API_CONFIG to use HTTPS in production
    - Redirect HTTP to HTTPS automatically
    - Use WSS for WebSocket in production
    - _Requirements: 24.1_
  
  - [ ] 10.2 Implement secure token management
    - Store tokens in memory and sessionStorage (not localStorage)
    - Clear tokens on logout and session timeout
    - Never log or display tokens in plain text
    - Use httpOnly cookies for refresh tokens in production
    - _Requirements: 1.3, 24.3_
  
  - [ ] 10.3 Add XSS input sanitization
    - Sanitize all user input before rendering
    - Escape HTML tags in user-generated content
    - Use DOMPurify library for sanitization
    - Test with XSS payloads
    - _Requirements: 24.5_
  
  - [ ] 10.4 Implement CSRF protection
    - Add CSRF token to all mutation requests
    - Validate CSRF token on backend
    - Use SameSite cookie attribute
    - _Requirements: 24.6_
  
  - [ ] 10.5 Add Content Security Policy headers
    - Configure CSP headers in production
    - Restrict script sources to same-origin
    - Prevent inline scripts and eval()
    - Allow only trusted CDNs
    - _Requirements: 24.10_

  - [ ] 10.6 Implement role-based access control
    - Hide admin-only features from non-admin users
    - Check user role in ProtectedRoute component
    - Validate permissions on backend as well
    - _Requirements: 24.8_
  
  - [ ] 10.7 Add security headers and best practices
    - Implement X-Content-Type-Options: nosniff
    - Implement X-Frame-Options: DENY
    - Implement Strict-Transport-Security
    - Mask sensitive data (API keys, passwords) with reveal buttons
    - _Requirements: 14.2, 24.4_
  
  - [ ] 10.8 Write property test for XSS sanitization
    - **Property 23: XSS Input Sanitization**
    - **Validates: Requirements 24.5**
    - Test that all user input is sanitized (HTML tags escaped/removed)
    - Use fast-check with 100+ iterations testing various XSS payloads
    - _Requirements: 30.1_
  
  - [ ] 10.9 Conduct security audit
    - Test authentication and authorization flows
    - Test for XSS vulnerabilities
    - Test for CSRF vulnerabilities
    - Test token management security
    - Test API security headers
    - Document findings and fixes
    - _Requirements: 25.1_
  
  - [ ] 10.10 Checkpoint - Verify security hardening complete
    - Ensure all security tests pass
    - Verify HTTPS enforcement works
    - Check XSS and CSRF protection
    - Review security audit report
    - Ask user if questions arise
  
  - [ ] 10.11 Phase 10 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify builds complete successfully without errors
    - Start all services using `.\run-all.ps1`
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Test HTTPS configuration (if in production mode)
    - Test token management (login, logout, session timeout)
    - Test XSS sanitization with malicious input
    - Test CSRF protection on mutation requests
    - Test role-based access control (admin vs trader)
    - Test security headers in browser dev tools
    - Verify sensitive data is masked (API keys, passwords)
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 10 - Security hardening complete"`
      - `git push origin main` (or your branch)
    - Do not proceed to Phase 11 until all verification passes and code is committed
    - _Requirements: 26.8, 26.9, 26.10, 24.1, 24.3, 24.5, 24.6_

- [ ] 11. Phase 11: Accessibility Compliance (Week 11)
  - [ ] 11.1 Implement keyboard navigation for all interactive elements
    - Ensure logical tab order throughout app
    - Add keyboard shortcuts for common actions
    - Test navigation with keyboard only
    - Ensure all buttons, links, inputs are keyboard accessible
    - _Requirements: 17.1_
  
  - [ ] 11.2 Add skip to main content link
    - Create skip link at top of each page
    - Link jumps to main content area
    - Make visible on keyboard focus
    - _Requirements: 17.2_
  
  - [ ] 11.3 Use semantic HTML and ARIA labels
    - Use semantic HTML elements (nav, main, article, section)
    - Add ARIA labels to all icon-only buttons
    - Add ARIA roles where semantic HTML is insufficient
    - Add ARIA descriptions for complex components
    - _Requirements: 17.3, 17.4_
  
  - [ ] 11.4 Implement ARIA live regions for real-time updates
    - Add aria-live="polite" for balance updates
    - Add aria-live="assertive" for critical alerts
    - Announce WebSocket events to screen readers
    - Test with screen reader (NVDA, JAWS, VoiceOver)
    - _Requirements: 17.5_
  
  - [ ] 11.5 Create accessible alternatives for charts
    - Provide data tables as alternatives to visual charts
    - Add text descriptions of chart trends
    - Ensure chart data is available to screen readers
    - Add toggle between chart and table view
    - _Requirements: 17.6_
  
  - [ ] 11.6 Ensure color contrast compliance
    - Maintain minimum 4.5:1 contrast ratio for text
    - Test both light and dark themes
    - Use color contrast checker tool
    - Fix any failing contrast ratios
    - _Requirements: 17.7_
  
  - [ ] 11.7 Add non-color indicators for information
    - Use icons and text labels in addition to color
    - Add patterns or textures to charts
    - Ensure status is conveyed through multiple means
    - _Requirements: 17.8_
  
  - [ ] 11.8 Support text resizing up to 200%
    - Test UI at 200% text size
    - Ensure no loss of functionality
    - Fix any layout issues
    - Use relative units (rem, em) instead of px
    - _Requirements: 17.9_
  
  - [ ] 11.9 Add visible focus indicators
    - Ensure all interactive elements have visible focus
    - Use consistent focus styling
    - Test focus visibility in both themes
    - Never remove outline without replacement
    - _Requirements: 17.10_
  
  - [ ] 11.10 Conduct accessibility audit
    - Run automated accessibility tests (axe, Lighthouse)
    - Test with keyboard navigation
    - Test with screen readers
    - Test color contrast
    - Test text resizing
    - Document WCAG 2.1 AA compliance
    - Fix any violations
    - _Requirements: 25.1_
  
  - [ ] 11.11 Checkpoint - Verify accessibility compliance complete
    - Ensure WCAG 2.1 AA compliance
    - Verify keyboard navigation works
    - Check screen reader compatibility
    - Review accessibility audit report
    - Ask user if questions arise
  
  - [ ] 11.12 Phase 11 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify builds complete successfully without errors
    - Start all services using `.\run-all.ps1`
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Test keyboard navigation through entire app (Tab, Enter, Escape)
    - Test skip to main content link
    - Run automated accessibility audit (axe DevTools or Lighthouse)
    - Test with screen reader if available (NVDA, JAWS, VoiceOver)
    - Test color contrast in both light and dark themes
    - Test UI at 200% text size
    - Verify all interactive elements have visible focus indicators
    - Verify ARIA live regions announce updates
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 11 - Accessibility compliance complete"`
      - `git push origin main` (or your branch)
    - Do not proceed to Phase 12 until all verification passes and code is committed
    - _Requirements: 26.8, 26.9, 26.10, 17.1-17.10_

- [ ] 12. Phase 12: Testing and Documentation (Week 12)
  - [ ] 12.1 Complete unit test coverage to 80%+
    - Write missing unit tests for all components
    - Write unit tests for all Redux slices
    - Write unit tests for all utility functions
    - Run coverage report and identify gaps
    - Achieve minimum 80% code coverage
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [ ] 12.2 Complete integration test suite
    - Write integration tests for all API endpoints
    - Test authentication flow end-to-end
    - Test environment switching
    - Test WebSocket connection and events
    - Test data serialization/deserialization
    - Test error handling (4xx, 5xx responses)
    - Test pagination, filtering, sorting
    - Test file export functionality
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 30.13, 30.14, 30.15_
  
  - [ ] 12.3 Write end-to-end tests for critical user flows
    - Test complete trading workflow (login → dashboard → start strategy → view trades)
    - Test backtest execution flow
    - Test risk management flow
    - Test settings configuration flow
    - Use Playwright for E2E tests
    - _Requirements: 25.7_
  
  - [ ] 12.4 Complete all property-based tests
    - Verify all 25 properties have tests
    - Ensure each property runs 100+ iterations
    - Test with random inputs using fast-check
    - Document property test results
    - Properties to verify:
      - Property 1: Authentication Token Inclusion
      - Property 2: Authentication Token Storage
      - Property 3: Environment Mode Persistence
      - Property 4: Environment Mode Restoration Round-Trip
      - Property 5: Risk Percentage Validation
      - Property 6: Position Size Validation
      - Property 7: Table Sorting Correctness
      - Property 8: R-Multiple Calculation Correctness
      - Property 9: Date Range Validation
      - Property 10: Initial Balance Validation
      - Property 11: Position Sizing Calculator Risk Validation
      - Property 12: BigDecimal Precision Preservation
      - Property 13: Daily Loss Limit Validation
      - Property 14: Drawdown Limit Validation
      - Property 15: Open Positions Limit Validation
      - Property 16: WebSocket Trade Event Handling
      - Property 17: CSV Export Column Headers
      - Property 18: CSV Monetary Value Formatting
      - Property 19: CSV Timestamp Formatting
      - Property 20: Cache Invalidation on Mutation
      - Property 21: User Preferences Persistence
      - Property 22: User Preferences Restoration Round-Trip
      - Property 23: XSS Input Sanitization
      - Property 24: Configuration Serialization Round-Trip
      - Property 25: API Data Serialization Round-Trip
    - _Requirements: 30.1, 30.9_
  
  - [ ] 12.5 Set up CI/CD pipeline with automated tests
    - Configure GitHub Actions workflow
    - Run unit tests on every push
    - Run integration tests on every push
    - Run E2E tests on pull requests
    - Fail build if any test fails
    - Fail build if coverage drops below 80%
    - Generate test reports
    - _Requirements: 25.9, 25.10, 30.11, 30.16_
  
  - [ ] 12.6 Write user documentation
    - Create user guide for dashboard features
    - Document authentication and login
    - Document environment switching
    - Document strategy management
    - Document trade history and analysis
    - Document backtest execution
    - Document risk management
    - Document settings configuration
    - Include screenshots and examples
    - _Requirements: 28.1_
  
  - [ ] 12.7 Write developer documentation
    - Document project structure and architecture
    - Document component hierarchy
    - Document state management patterns
    - Document API integration
    - Document WebSocket integration
    - Document testing strategy
    - Document build and deployment process
    - Include code examples
    - _Requirements: 28.1, 28.5, 28.6, 28.7_
  
  - [ ] 12.8 Create deployment guide
    - Document environment variable configuration
    - Document build process
    - Document Docker deployment
    - Document static hosting deployment (Vercel, Netlify)
    - Document monitoring setup
    - Include troubleshooting section
    - _Requirements: 26.11_
  
  - [ ] 12.9 Conduct final QA testing
    - Test all features end-to-end
    - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
    - Test on multiple devices (desktop, tablet, mobile)
    - Test both light and dark themes
    - Test with slow network (3G)
    - Document and fix any issues found
    - _Requirements: 25.1_
  
  - [ ] 12.10 Checkpoint - Verify testing and documentation complete
    - Ensure 80%+ test coverage achieved
    - Verify all integration tests pass
    - Check E2E tests pass
    - Review all documentation
    - Ask user if questions arise
  
  - [ ] 12.11 Phase 12 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify builds complete successfully without errors
    - Run all unit tests and verify 80%+ coverage
    - Run all integration tests and verify they pass
    - Run all property-based tests (25 properties, 100+ iterations each)
    - Run E2E tests for critical user flows
    - Start all services using `.\run-all.ps1`
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Test complete trading workflow end-to-end
    - Test on multiple browsers (Chrome, Firefox, Edge)
    - Test both light and dark themes
    - Review all documentation for completeness
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 12 - Testing and documentation complete"`
      - `git push origin main` (or your branch)
    - Do not proceed to Phase 13 until all verification passes and code is committed
    - _Requirements: 26.8, 26.9, 26.10, 25.1-25.10, 30.1-30.16_

- [ ] 13. Phase 13: Deployment and Monitoring (Week 13)
  - [ ] 13.1 Configure production environment variables
    - Set VITE_API_BASE_URL to production backend URL
    - Set VITE_WS_URL to production WebSocket URL
    - Configure environment-specific settings
    - Set up .env.production file
    - _Requirements: 26.3, 26.4_
  
  - [ ] 13.2 Create production build
    - Run npm run build for production
    - Verify build completes in < 2 minutes
    - Check bundle sizes are optimized
    - Verify source maps are generated
    - Test production build locally
    - _Requirements: 26.5, 26.6, 26.8_
  
  - [ ] 13.3 Set up Docker deployment
    - Create Dockerfile in `frontend/` directory with multi-stage build
    - Use nginx to serve static files
    - Configure nginx for SPA routing
    - Build Docker image
    - Test Docker container locally
    - Update root docker-compose.yml to include frontend service
    - Configure frontend to connect to backend service
    - _Requirements: 26.12_
  
  - [ ] 13.4 Deploy to staging environment
    - Deploy Docker container to staging
    - Configure staging environment variables
    - Run smoke tests on staging
    - Test all critical user flows
    - Verify integration with staging backend
    - _Requirements: 26.11_
  
  - [ ] 13.5 Set up error tracking with Sentry
    - Create Sentry project
    - Install @sentry/react package
    - Configure Sentry with DSN
    - Integrate with ErrorBoundary
    - Test error reporting
    - Set up error alerts
    - _Requirements: 27.1, 27.2, 27.3_
  
  - [ ] 13.6 Set up analytics with Google Analytics 4
    - Create GA4 property
    - Install gtag.js or @analytics/google-analytics
    - Track page views on route changes
    - Track user interactions (strategy start/stop, trade export, backtest run)
    - Respect user privacy (no PII tracking)
    - _Requirements: 27.5, 27.6, 27.9_
  
  - [ ] 13.7 Set up performance monitoring
    - Measure and report Core Web Vitals (LCP, FID, CLS)
    - Track API request performance (response time, error rate)
    - Track WebSocket connection stability
    - Send metrics to analytics service
    - Set up performance alerts
    - _Requirements: 27.4, 27.7, 27.8_
  
  - [ ] 13.8 Create monitoring dashboards
    - Create dashboard for error rates
    - Create dashboard for performance metrics
    - Create dashboard for user activity
    - Create dashboard for API health
    - Set up alerts for critical issues
    - _Requirements: 27.1_
  
  - [ ] 13.9 Deploy to production
    - Deploy Docker container to production
    - Configure production environment variables
    - Enable HTTPS and security headers
    - Run smoke tests on production
    - Monitor error rates and performance
    - _Requirements: 26.11_
  
  - [ ] 13.10 Set up CI/CD for automated deployments
    - Configure GitHub Actions for deployment
    - Deploy to staging on merge to develop branch
    - Deploy to production on merge to main branch
    - Run tests before deployment
    - Implement rollback capability
    - _Requirements: 25.9_
  
  - [ ] 13.11 Verify production deployment
    - Test all features in production
    - Verify HTTPS works correctly
    - Check error tracking is working
    - Verify analytics is collecting data
    - Monitor performance metrics
    - Check all integrations work
    - _Requirements: 26.11_
  
  - [ ] 13.12 Final checkpoint - Production deployment complete
    - Ensure all features work in production
    - Verify monitoring and alerts are active
    - Check error rates are low
    - Verify performance meets requirements
    - Document any production issues
    - Ask user if questions arise
  
  - [ ] 13.13 Phase 13 Verification - Build, Run, and Test Application
    - Stop all running services using `.\stop-all.ps1`
    - Build both backend and frontend using `.\build-all.ps1`
    - Verify production build completes in < 2 minutes
    - Check bundle sizes are optimized
    - Verify source maps are generated
    - Build Docker images for both frontend and backend
    - Start all services using `.\run-all.ps1` or docker-compose
    - Verify backend is accessible at http://localhost:8080
    - Verify frontend is accessible at http://localhost:5173
    - Test HTTPS configuration (if applicable)
    - Verify error tracking (Sentry) is capturing errors
    - Verify analytics (GA4) is tracking page views
    - Test all critical user flows in production-like environment
    - Run smoke tests on all major features
    - Verify monitoring dashboards show correct data
    - Test CI/CD pipeline (if configured)
    - Verify rollback capability works
    - Run final Lighthouse audit (score should be ≥ 90)
    - Test on multiple browsers and devices
    - If any issues found, diagnose and repair immediately
    - Once all verification passes, commit to git:
      - `git add .`
      - `git commit -m "feat: Phase 13 - Production deployment complete"`
      - `git tag -a v1.0.0 -m "Frontend Dashboard v1.0.0 - Production Ready"`
      - `git push origin main` (or your branch)
      - `git push origin v1.0.0`
    - Document deployment process and any issues encountered
    - _Requirements: 26.8, 26.9, 26.10, 26.11, 27.1-27.9_

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- Property tests validate universal correctness properties with 100+ iterations each
- Integration tests run automatically after each phase to catch breaking changes
- All monetary calculations use BigDecimal precision to match backend
- Environment switching is a core feature tested throughout implementation
- WebSocket integration provides real-time updates across all features
- Accessibility and security are built in from the start, not added later
- Performance optimization is continuous, with final tuning in Phase 9
- Documentation is created alongside implementation for accuracy

## Success Criteria

**Functional Requirements:**
- All 32 requirements implemented and tested
- All acceptance criteria met
- Integration tests passing for all phases
- Environment switching works correctly (test/live modes)
- Real-time updates via WebSocket functional
- Multi-exchange support implemented

**Performance Requirements:**
- Initial load < 3 seconds on 3G connection
- Lighthouse performance score ≥ 90
- Time to Interactive < 5 seconds
- First Contentful Paint < 1.5 seconds
- Smooth scrolling with virtualized lists

**Quality Requirements:**
- Unit test coverage ≥ 80%
- All 25 property tests passing (100+ iterations each)
- All integration tests passing
- Zero critical security vulnerabilities
- WCAG 2.1 AA accessibility compliance

**Deployment Requirements:**
- Automated CI/CD pipeline functional
- Zero-downtime deployments
- Rollback capability implemented
- Error tracking and monitoring active
- Performance monitoring dashboards created
