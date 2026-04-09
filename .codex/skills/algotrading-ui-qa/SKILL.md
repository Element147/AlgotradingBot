---
name: algotrading-ui-qa
description: Repo-specific frontend QA playbook for C:\Git\algotradingbot. Use for browser-based verification, frontend bug hunting, or route-level UI validation in the React/Vite dashboard, especially on Market Data, Backtest, Risk, Paper, and dashboard shell flows.
---

# AlgoTrading UI QA

Use this skill for frontend verification in this repository.

## Default loop

1. Prefer MCP Playwright first.
2. Choose the URL that matches the browser location: use `localhost` for the local or desktop connector, and `host.docker.internal` for a container-hosted browser.
3. Navigate to the route under test and capture a fresh browser snapshot before any interaction.
4. Interact only with current snapshot refs; resnapshot after each meaningful UI change.
5. Check browser console and network when the UI does not match the visible state.
6. Capture a browser screenshot or fall back to the installed `screenshot` skill only when browser-native capture is not enough.

## Route focus

- `Market Data`: provider imports, jobs, dataset readiness, archive/restore flows.
- `Backtest`: form submission, progress, history, replay, compare, and detail panes.
- `Risk`: limits, circuit breakers, overrides, audit visibility, and environment posture.
- Shared shell: navigation, auth state, error/loading states, and environment indicators.

## Guardrails

- Do not start a frontend or backend dev server before existing tracked instances are stopped.
- Prefer the repo run scripts over ad hoc startup commands.
- Keep environment mode visible and conservative; `test` is the baseline.

## References

- Browser verification checklist: `references/browser-checklist.md`
- Recommended route scenarios: `references/route-scenarios.md`
