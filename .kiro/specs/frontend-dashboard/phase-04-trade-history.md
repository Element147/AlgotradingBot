# Phase 4: Trade History and Details (Week 4)

[← Back to Overview](./00-overview.md) | [Previous: Phase 3](./phase-03-strategy-management.md) | [Next: Phase 5 →](./phase-05-backtest-visualization.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 3 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 4, verify:
- [ ] Phase 3 git commit exists: `git log --oneline --grep="feat: Phase 3"`
- [x] Phase 3 verification passed (build, run, test)
- [x] Strategy management is functional
- [x] All Phase 3 tests passing

### If Phase 3 is Incomplete
1. **STOP** - Do not proceed with Phase 4
2. **NOTIFY** - "Phase 3 must be completed first"
3. **QUEUE** - Add Phase 4 to queue
4. **REDIRECT** - Complete Phase 3 first

## Phase Status

- **Dependencies:** Phase 1, 2, 3
- **Can Start:** Only if Phase 3 is COMPLETE
- **Blocks:** Phase 5, 6, 7, 8, 9, 10, 11, 12, 13

## Tasks

- [x] 4.1 Create trades API slice with history and details endpoints
  - Implement tradesApi with getTradeHistory, getTradeDetails, getTradeStatistics queries
  - Support pagination parameters (page, pageSize)
  - Support filter parameters (date range, symbol, status, strategy)
  - Support sort parameters (column, direction)
  - Configure caching with 5 minute TTL
  - _Requirements: 6.1, 6.6, 7.2_

- [x] 4.2 Build trades page with paginated table
  - Create TradesPage component
  - Display paginated table with 50 trades per page
  - Show columns: ID, timestamp, symbol, side, entry/exit prices, quantity, P&L, P&L %, duration, strategy
  - Add pagination controls (current page, total pages, next/previous buttons)
  - Add loading skeleton for table rows
  - _Requirements: 6.1, 6.2, 6.9_

- [x] 4.3 Implement virtualized trade table for performance
  - Use @tanstack/react-virtual for virtualization
  - Render only visible rows (50px height each)
  - Add 10 row overscan for smooth scrolling
  - Optimize for tables with 100+ rows
  - _Requirements: 19.3_

- [x] 4.4 Add table sorting functionality
  - Make all column headers clickable
  - Toggle between ascending and descending sort on click
  - Display sort indicator (arrow icon) on active column
  - Fetch sorted data from API
  - _Requirements: 6.3, 6.4_

- [x] 4.5 Implement trade filtering controls
  - Create filter panel with date range picker, symbol dropdown, status dropdown, strategy dropdown
  - Fetch filtered data from API when filters change
  - Update URL query parameters to persist filters
  - Restore filters from URL on page load
  - Clear filters button to reset all
  - _Requirements: 6.5, 6.6, 23.7, 23.8_

- [x] 4.6 Add trade search with debouncing
  - Create search input for trade ID lookup
  - Implement 300ms debounce using useDebouncedCallback
  - Fetch search results from API
  - Display "no results" message when search returns empty
  - _Requirements: 6.7, 6.8, 19.4_

- [x] 4.7 Display aggregate trade statistics
  - Create TradeStatistics component above table
  - Show total trades, win rate, average win, average loss, profit factor
  - Calculate from filtered trade data
  - Update when filters change
  - _Requirements: 6.10_

- [x] 4.8 Create trade details modal with full information
  - Build TradeDetailsModal component
  - Fetch complete trade data from /api/trades/{id}
  - Display entry/exit reasons, slippage breakdown, fees breakdown
  - Show risk metrics: risk amount, reward amount, R-multiple, stop-loss, take-profit
  - Add price action chart during trade duration
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4.9 Implement CSV export functionality
  - Create export button on trades page
  - Generate CSV file with all filtered trade records
  - Include column headers as first row
  - Format monetary values with 2 decimal places
  - Format timestamps in ISO 8601 format
  - Trigger browser download with filename trades_YYYY-MM-DD_HHmmss.csv
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [x] 4.10 Write unit tests for trade components
  - Test TradesPage renders table with pagination
  - Test TradeTable sorting functionality
  - Test filter controls update query parameters
  - Test search input debouncing
  - Test TradeDetailsModal displays complete data
  - Test CSV export generates correct format
  - Achieve 80%+ coverage
  - _Requirements: 25.1, 25.4_

- [x] 4.11 Write property tests for table sorting and CSV export
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

- [x] 4.12 Write integration tests for trade history
  - Test fetch trade history with pagination
  - Test filter trades by date range, symbol, status
  - Test sort trades by column (ascending/descending)
  - Test search trades by ID
  - Test fetch trade details by ID
  - Test export trades to CSV
  - Verify pagination, filtering, sorting functionality
  - _Requirements: 30.5, 30.14, 30.15_

- [x] 4.13 Checkpoint - Verify trade history complete
  - Ensure all tests pass (unit, property, integration)
  - Verify pagination, sorting, filtering work correctly
  - Check CSV export generates valid files
  - Ask user if questions arise

- [x] 4.14 Phase 4 Verification - Build, Run, and Test Application
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

- [x] 4.15 Backend - Implement Trade History API Endpoints
  - **Location:** `AlgotradingBot/src/main/java/com/algotrader/bot/`
  - **Note:** Trade history endpoint already exists in `controller/TradingStrategyController.java`
  - Enhance existing GET `/api/trades/history` endpoint with pagination, sorting, filtering
  - Add query parameters: page, pageSize (default 50), sortBy, sortDirection (asc/desc)
  - Add filter parameters: startDate, endDate, symbol, status, strategyId
  - Return paginated response with total count, current page, total pages
  - Create GET `/api/trades/{id}` endpoint for detailed trade information
  - Return complete trade data: entry/exit reasons, slippage breakdown, fees breakdown, risk metrics
  - Calculate and include R-multiple: (exit - entry) / (entry - stopLoss)
  - Create GET `/api/trades/statistics` endpoint for aggregate stats
  - Return: totalTrades, winRate, averageWin, averageLoss, profitFactor
  - Support filtering by date range, symbol, strategy
  - Enhance `repository/TradeRepository.java` with custom query methods
  - Add methods: findByFilters, findByIdWithDetails, calculateStatistics
  - Use JPA Specifications for dynamic filtering
  - Implement sorting with Sort parameter
  - Add `@Secured` annotation to require authentication
  - Write unit tests for trade filtering and sorting logic
  - Write integration tests for trade history endpoints with various filter combinations
  - Test pagination edge cases (empty results, single page, multiple pages)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 7.1, 7.2, 7.3, 7.4, 7.5_

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Trade history with pagination, sorting, filtering
- ✅ Trade details modal with full information
- ✅ CSV export functionality
- ✅ Virtualized table for performance
- ✅ All tests passing (unit, property, integration)
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 5: Backtest Visualization](./phase-05-backtest-visualization.md)



