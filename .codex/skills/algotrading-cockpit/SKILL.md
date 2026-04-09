---
name: algotrading-cockpit
description: Repo-specific Codex workflow for C:\Git\algotradingbot. Use when working in this algorithmic trading research platform and you need the correct doc read order, guide selection, MCP choice, verification order, or safe local runbook before coding, reviewing, or validating changes.
---

# AlgoTrading Cockpit

Use this skill as the default operating playbook for work in this repository.

## Core workflow

1. Read the slim core docs from the repo root before substantial changes:
   `README.md`, `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `TRADING_GUARDRAILS.md`, `PRODUCT.md`, `docs/README.md`.
2. Read exactly one matching guide before deep work:
   `docs/guides/FRONTEND.md`, `docs/guides/BACKEND.md`, `docs/guides/LOCAL_DEVELOPMENT.md`, `docs/guides/TESTING_AND_CONTRACTS.md`, or `docs/guides/MARKET_DATA.md`.
3. Keep the change small, verified, and local-first.
4. Stop tracked frontend or backend dev servers before starting new ones.
5. Use the MCP that removes the most guesswork for the current task.

## Guardrails

- Default to `test` or `paper`; never enable live trading by default.
- Treat strategies as hypotheses, not profitability claims.
- Preserve hybrid DDD backend boundaries and feature-first frontend boundaries.
- Prefer DTO boundaries, exact money handling, and explicit environment separation.

## References

- Verification order and task-to-check mapping: `references/verification-matrix.md`
- MCP choice and when to reach for each server: `references/mcp-playbook.md`
