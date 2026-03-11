# Spring Modernization Audit

Status updated: March 11, 2026

## Why this document exists

This tracks legacy Spring/Java coding style in the backend and the phased migration plan toward a modern Java 21 + Spring Boot 4 style.

The goal is not cosmetic refactoring. The goal is:
- less boilerplate
- clearer immutable contracts
- safer DTO handling
- easier long-term maintenance

## Current legacy inventory

### 1) Controller DTOs still written as classic mutable POJOs

Remaining candidates in controller DTO layer:
- `BacktestDetailsResponse`
- `BacktestResultResponse`
- `BackupResponse`
- `BalanceResponse`
- `ErrorResponse`
- `ExchangeConnectionStatusResponse`
- `OpenPositionResponse`
- `PaperOrderResponse`
- `PaperTradingStateResponse`
- `PerformanceResponse`
- `RecentTradeResponse`
- `RiskAlertResponse`
- `RiskConfigResponse`
- `RiskStatusResponse`
- `StartStrategyResponse`
- `StopStrategyResponse`
- `SystemInfoResponse`
- `TradeHistoryResponse`

### 2) Broader service/config modernization opportunities

- `websocket/WebSocketHandler` now uses standard Jackson package, but still creates a local mapper in the default constructor rather than relying purely on Spring-managed JSON configuration.
- Backtest strategy interface still exposes legacy-style `getLabel/getDescription/getSelectionMode` convenience methods.

## Iteration completed now (Phases 1-4)

Phase 1 complete, immutable response DTOs converted to records:

- `BacktestAlgorithmResponse`
- `BacktestDatasetResponse`
- `BacktestHistoryItemResponse`
- `BacktestRunResponse`
- `StrategyActionResponse`
- `StrategyDetailsResponse`
- `StrategyStatusResponse`

Phase 2 complete, request DTOs converted to records with defaults preserved where needed:

- `CircuitBreakerOverrideRequest`
- `ExchangeConnectionTestRequest`
- `LoginRequest`
- `PaperOrderRequest`
- `RefreshTokenRequest`
- `RunBacktestRequest`
- `StartStrategyRequest`
- `UpdateRiskConfigRequest`
- `UpdateStrategyConfigRequest`

Phase 3 complete, transitional compatibility layer removed:

- removed temporary `getX()` methods from migrated response records
- updated service/controller usage to canonical record accessors (`fieldName()`)
- updated integration/unit tests to use record constructors

Phase 4 complete, JSON stack normalization pass:

- replaced `tools.jackson.databind.ObjectMapper` usage in `WebSocketHandler` with `com.fasterxml.jackson.databind.ObjectMapper`
- updated `WebSocketHandlerTest` for constructor-based handler setup

Verification completed:
- backend test suite: `.\gradlew.bat test` passed after migration

## Plan (phased and executable)

### Phase 1 (done)

- convert safe immutable response DTOs to `record`
- verify backend tests

### Phase 2 (done)

- migrate immutable request DTOs to `record`
- preserve request default behavior via canonical constructors
- adjust request-focused tests

### Phase 3 (done)

- remove transitional `getX()` compatibility from migrated records
- use canonical record accessors in service/controller code

### Phase 4 (done)

- standardize WebSocket JSON import path to Jackson mainstream package
- verify context/test compatibility

## Guardrails for further modernization

- do not convert JPA entities to records
- keep money/risk values in `BigDecimal`
- migrate in small batches with test verification after each batch
- preserve API contract unless versioned change is intentional
