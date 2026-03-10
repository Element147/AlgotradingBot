# Backend Tasks Added to Frontend Phases

## Summary

All 13 frontend dashboard phases have been updated to include backend implementation tasks. Each phase now ensures full-stack feature completion before proceeding to the next phase.

## Changes by Phase

### Phase 1: Authentication (Week 1)
**New Task 1.14:** Backend - Implement Authentication API Endpoints
- JWT token generation and validation
- Spring Security configuration
- User entity and repository
- AuthController with login/logout/refresh/me endpoints
- Password hashing with BCrypt
- JwtAuthenticationFilter for token validation
- Dependencies: Spring Security, JJWT

### Phase 2: Core Layout and Dashboard (Week 2)
**New Task 2.17:** Backend - Implement Account and Dashboard API Endpoints
- Account balance endpoint with environment routing (test/live)
- Performance metrics endpoint with timeframes
- Open positions endpoint
- Recent trades endpoint
- WebSocket endpoint for real-time updates
- Environment-aware WebSocket channels
- Dependencies: Spring WebSocket

### Phase 3: Strategy Management (Week 3)
**New Task 3.13:** Backend - Implement Strategy Management API Endpoints
- Enhance existing strategy endpoints
- Strategy configuration CRUD operations
- Configuration validation (risk 1-5%, positive position sizes)
- StrategyConfig entity and repository
- WebSocket events for strategy status updates
- Real-time metrics publishing

### Phase 4: Trade History and Details (Week 4)
**New Task 4.15:** Backend - Implement Trade History API Endpoints
- Enhanced trade history with pagination, sorting, filtering
- Trade details endpoint with R-multiple calculation
- Trade statistics endpoint (aggregate metrics)
- Custom repository methods with JPA Specifications
- Dynamic filtering and sorting support

### Phase 5: Backtest Visualization (Week 5)
**New Task 5.17:** Backend - Implement Backtest API Endpoints
- Backtest results list endpoint
- Detailed backtest results with all chart data
- Backtest execution endpoint (async)
- Validation logic (dates, initial balance)
- Monte Carlo and walk-forward results
- Asynchronous execution with @Async

### Phase 6: Risk Management (Week 6)
**New Task 6.15:** Backend - Implement Risk Management API Endpoints
- Risk status endpoint with current metrics
- Risk configuration CRUD operations
- Circuit breaker management endpoints
- Circuit breaker override with password authentication
- Risk alerts log endpoint
- WebSocket events for risk alerts
- BigDecimal precision for all calculations

### Phase 7: Settings and Exchange Integration (Week 7)
**New Task 7.15:** Backend - Implement Settings and Exchange Integration API Endpoints
- System info endpoint
- Exchange connection testing
- Database backup endpoint
- Exchange balance endpoint (live mode)
- Exchange connection status
- ExchangeService with rate limiting
- Encrypted API credentials storage
- User preferences endpoints
- Dependencies: Binance/Coinbase/Kraken connectors

### Phase 8: Charts and Visualization (Week 8)
**New Task 8.10:** Backend - Verify Chart Data Endpoints (No New Implementation)
- Verification task only
- Ensure existing endpoints provide correct data format
- Verify timestamps in ISO 8601 format
- Verify numeric precision (8 decimal places)
- No new implementation unless issues found

### Phase 9: Performance Optimization (Week 9)
**New Task 9.10:** Backend - Verify API Performance (No New Implementation)
- Verification task only
- Check API response times (< 500ms)
- Verify database indexes
- Check connection pooling configuration
- Test under load (100+ concurrent requests)
- No new implementation unless issues found

### Phase 10: Security Hardening (Week 10)
**New Task 10.12:** Backend - Verify Security Configuration (Minimal Implementation)
- Verification task only
- Verify Spring Security configuration
- Check HTTPS enforcement
- Verify CORS configuration
- Check security headers
- Verify JWT token expiration
- Test with security scanner (OWASP ZAP)
- No new implementation unless issues found

### Phase 11: Accessibility Compliance (Week 11)
**New Task 11.13:** Backend - No Backend Changes Required
- Note only - entirely frontend-focused
- No backend implementation required

### Phase 12: Testing and Documentation (Week 12)
**New Task 12.12:** Backend - Verify Backend Test Coverage
- Verification task only
- Run backend tests with `./gradlew test`
- Verify 100% coverage for financial calculations
- Check integration tests for all endpoints
- Review backend documentation
- No new implementation unless test gaps found

### Phase 13: Deployment and Monitoring (Week 13)
**New Task 13.14:** Backend - Verify Production Deployment Configuration
- Verification task only
- Verify Dockerfile and AlgotradingBot/compose.yaml
- Test Docker build and container
- Verify health check and metrics endpoints
- Test full stack with docker-compose
- Verify logging configuration
- No new implementation unless deployment issues found

## Implementation Strategy

### Phases 1-7: Active Backend Development
These phases require significant backend implementation to support frontend features:
- Authentication and authorization
- Data endpoints for dashboard
- Strategy management APIs
- Trade history with advanced querying
- Backtest execution and results
- Risk management and monitoring
- Exchange integration

### Phases 8-13: Verification and Optimization
These phases are primarily frontend-focused with minimal backend changes:
- Chart data format verification
- Performance testing
- Security audit
- Accessibility (frontend only)
- Testing and documentation review
- Deployment configuration verification

## Key Backend Technologies

### Required Dependencies
- Spring Boot Starter Security
- JJWT (JWT tokens)
- Spring Boot Starter WebSocket
- Binance/Coinbase/Kraken connectors (for exchange integration)

### Existing Backend Components
Many backend features already exist from the original trading bot implementation:
- TradingStrategyController (strategy start/stop)
- BacktestEngine (backtest execution)
- RiskManager (risk calculations)
- Trade entity and repository
- PostgreSQL database
- Kafka event streaming

### New Backend Components
The following components need to be created:
- AuthController and AuthService
- AccountController and AccountService
- RiskController
- ExchangeController and ExchangeService
- SystemController
- WebSocket handler and event publishing
- StrategyConfig entity
- ExchangeConfig entity
- UserPreferences entity

## Testing Requirements

### Backend Testing
- 100% test coverage for financial calculations (risk, position sizing, P&L)
- Unit tests for all service classes
- Integration tests for all REST API endpoints
- WebSocket event publishing tests
- Security tests (authentication, authorization)

### Integration Testing
- Frontend-backend API contract tests
- WebSocket communication tests
- Environment switching tests (test/live mode)
- End-to-end workflow tests

## Benefits of This Approach

1. **Full-Stack Completion**: Each phase delivers a complete, working feature
2. **Incremental Progress**: No orphaned frontend code waiting for backend
3. **Early Integration**: Issues discovered early in development
4. **Testable Milestones**: Each phase can be fully tested before moving on
5. **Reduced Risk**: Smaller, more manageable chunks of work
6. **Better Coordination**: Frontend and backend developed together

## Next Steps

1. **Phase 1 Backend**: Implement task 1.14 (Authentication API)
2. **Test Integration**: Verify frontend authentication works with backend
3. **Commit and Push**: Complete Phase 1 before starting Phase 2
4. **Repeat**: Follow same pattern for each subsequent phase

## Notes

- Backend tasks are added AFTER the phase verification task
- Each backend task includes location, requirements, and dependencies
- Verification tasks (Phases 8-13) require minimal or no new backend code
- All backend tasks require authentication (@Secured annotation)
- All financial calculations must use BigDecimal precision
- All endpoints must be documented in OpenAPI/Swagger

