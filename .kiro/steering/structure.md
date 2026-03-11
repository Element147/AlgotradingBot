---
inclusion: always
---

# Project Structure and Architecture

## Monorepo Layout

```text
repository-root/
  AlgotradingBot/          Spring Boot backend
    src/main/java/com/algotrader/bot/
      backtest/
      config/
      controller/
      entity/
      repository/
      risk/
      security/
      service/
      strategy/
      validation/
      websocket/
    src/main/resources/
    src/test/java/
  frontend/
    src/
      app/
      features/
      components/
      services/
      tests/
  docs/
  .kiro/
```

## Backend Boundaries

- `controller`: HTTP layer and DTO mapping
- `service`: business orchestration
- `repository`: persistence access
- `entity`: database models
- `backtest` and `backtest/strategy`: strategy evaluation and simulation
- `risk`: guardrail and risk-related calculations

Key backend rules:

- keep money/risk on `BigDecimal`
- keep strategy logic separate from orchestration
- keep DTO boundaries explicit

## Frontend Boundaries

- Feature-first modules in `frontend/src/features`
- Shared infrastructure in `app`, `components`, and `services`
- API contract adaptation should be centralized in API/service layers

## Current Architectural Priorities

1. Keep strategy modules composable and independently testable.
2. Keep environment-mode behavior visible and safe in UI.
3. Keep backend and frontend contracts synchronized and verifiable.
4. Keep docs aligned to current architecture; remove legacy progress artifacts.
