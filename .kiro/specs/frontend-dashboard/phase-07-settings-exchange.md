# Phase 7: Settings and Exchange Integration (Week 7)

[← Back to Overview](./00-overview.md) | [Previous: Phase 6](./phase-06-risk-management.md) | [Next: Phase 8 →](./phase-08-charts-visualization.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 6 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 7, verify:
- [ ] Phase 6 git commit exists: `git log --oneline --grep="feat: Phase 6"`
- [ ] Phase 6 verification passed (build, run, test)
- [ ] Risk management is functional
- [ ] All Phase 6 tests passing

### If Phase 6 is Incomplete
1. **STOP** - Do not proceed with Phase 7
2. **NOTIFY** - "Phase 6 must be completed first"
3. **QUEUE** - Add Phase 7 to queue
4. **REDIRECT** - Complete Phase 6 first

## Phase Status

- **Dependencies:** Phase 1, 2, 3, 4, 5, 6
- **Can Start:** Only if Phase 6 is COMPLETE
- **Blocks:** Phase 8, 9, 10, 11, 12, 13

## Tasks

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

- [ ] 7.15 Backend - Implement Settings and Exchange Integration API Endpoints
  - **Location:** `AlgotradingBot/src/main/java/com/algotrader/bot/`
  - Create `controller/SystemController.java` with REST endpoints
  - Implement GET `/api/system/info` endpoint returning system information
  - Return: applicationVersion, lastDeploymentDate, databaseStatus, kafkaStatus
  - Implement POST `/api/system/test-connection` endpoint to test exchange API connection
  - Test connection to configured exchange (Binance, Coinbase, or Kraken)
  - Return connection status, rate limit information, and any errors
  - Implement POST `/api/system/backup` endpoint to trigger database backup
  - Create backup file with timestamp: `backup_YYYY-MM-DD_HHmmss.sql`
  - Return backup file path and size
  - Create `controller/ExchangeController.java` for exchange operations
  - Implement GET `/api/exchange/balance` endpoint with `?env=live` parameter
  - Integrate with exchange API (Binance/Coinbase/Kraken) to fetch real balance
  - Return balance data: exchange name, timestamp, balances by asset, totalValueUSD
  - Implement GET `/api/exchange/connection-status` endpoint
  - Return: connected, exchange, lastSync, rateLimitUsage, error (if any)
  - Create `service/ExchangeService.java` to handle exchange API integration
  - Implement connection pooling and rate limiting
  - Add retry logic with exponential backoff for failed requests
  - Store exchange API credentials securely (encrypted in database or environment variables)
  - Create `entity/ExchangeConfig.java` JPA entity for exchange configurations
  - Store: name, apiKey (encrypted), apiSecret (encrypted), testnet flag, rateLimits
  - Implement GET `/api/settings/user` endpoint for user preferences
  - Return: theme, currency, timezone, notifications settings
  - Implement PUT `/api/settings/user` endpoint to update preferences
  - Store preferences in `entity/UserPreferences.java`
  - Add `@Secured` annotation to require authentication
  - Write unit tests for exchange API integration (mock external calls)
  - Write integration tests for settings endpoints
  - Test connection to exchange APIs (use testnet for safety)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.9, 14.10, 14.11, 14.12, 2.18_
  - **Dependencies:** Add to `build.gradle.kts`:
    - `implementation("com.binance.connector:binance-connector-java:3.0.0")` (for Binance)
    - Or equivalent for Coinbase/Kraken

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Settings page with multiple sections
- ✅ Exchange integration with balance display
- ✅ API configuration and testing
- ✅ Display preferences with persistence
- ✅ All tests passing (unit, property, integration)
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 8: Charts and Visualization](./phase-08-charts-visualization.md)
