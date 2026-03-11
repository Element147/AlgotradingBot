# Implementation Plan: Frontend Dashboard (Local-First)

## Overview

This roadmap is optimized for a local research workflow:

- run backend/frontend on a local machine
- keep runtime on PostgreSQL Docker
- keep tests/build Docker-independent via H2 in-memory
- iterate safely in `test`/`paper` mode

Primary goal: evaluate strategy hypotheses on 2-3 years of historical data with clear UX guidance for beginner users.

## Active Phase Structure (1-13)

- [Phase 1: Project Setup and Authentication](./phase-01-authentication.md)
- [Phase 2: Core Layout and Dashboard](./phase-02-layout-dashboard.md)
- [Phase 3: Strategy Management](./phase-03-strategy-management.md)
- [Phase 4: Trade History and Details](./phase-04-trade-history.md)
- [Phase 5: Backtest Visualization](./phase-05-backtest-visualization.md)
- [Phase 6: Risk Management](./phase-06-risk-management.md)
- [Phase 7: Settings and Exchange Integration](./phase-07-settings-exchange.md)
- [Phase 8: Charts and Visualization](./phase-08-charts-visualization.md)
- [Phase 9: Performance Optimization](./phase-09-performance-optimization.md)
- [Phase 10: Security Hardening](./phase-10-security-hardening.md)
- [Phase 11: Accessibility Compliance](./phase-11-accessibility-compliance.md)
- [Phase 12: Local Deployment and Testing](./phase-12-local-deployment-testing.md)
- [Phase 13: Testing and Documentation](./phase-13-testing-documentation.md)

## Optional Future Phase

- [Phase 14 (Optional): Production Deployment and Monitoring](./phase-14-production-deployment-monitoring.md)

This optional phase is intentionally excluded from the current default execution path.

## Success Criteria for Local-First Track

- Core dashboard pages are implemented (no core placeholders).
- FE/BE contracts are verified after each major refactor.
- Beginner users can understand strategy intent, field meaning, and risk context directly in UI.
- Backtest workflow supports realistic fees/slippage assumptions.
- Build/test commands stay independent of Docker PostgreSQL.

## Notes

- Keep `test`/`paper` defaults conservative.
- Treat backtest outputs as research artifacts, never guaranteed profitability.
- Update docs when behavior changes.
