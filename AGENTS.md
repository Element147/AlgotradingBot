# AGENTS.md

## Mission

This repository is a local-first full-stack algorithmic trading research platform. The goal is to build a reliable Spring Boot backend and React/Vite dashboard for strategy research, backtesting, paper trading, and operational controls.

This repository does not assume strategy profitability. Treat every strategy as a hypothesis to test under realistic costs, risk limits, and verification gates.

## Scope

- Backend: `AlgotradingBot/` Java 21, Spring Boot 4.0.3, Gradle, PostgreSQL, Kafka, WebSocket, JWT auth
- Frontend: `frontend/` React 19, TypeScript, Vite, Redux Toolkit, RTK Query, React Router 7, MUI 7
- Local orchestration: PowerShell scripts in repo root and Docker Compose in `AlgotradingBot/compose.yaml`

## Non-Negotiables

- Default to `test` or `paper` behavior. Never enable real-money trading by default.
- Do not claim a strategy is profitable without reproducible evidence.
- Do not weaken environment separation, risk controls, auditability, or operator override paths.
- Preserve the current React/Vite SPA unless a migration is explicitly approved and justified.
- Prefer small, verified increments over broad rewrites.

## Read Before Coding

Before changing code, read in this order:

1. `README.md`
2. `PROJECT_STATUS.md`
3. `ARCHITECTURE.md`
4. `TRADING_GUARDRAILS.md`
5. `PLAN.md`
6. `PRODUCT.md`
7. `TECH.md`
8. `STRUCTURE.md`
9. `GRADLE_AUTOMATION.md`
10. `docs/ROADMAP.md`
11. `docs/ACCEPTANCE_CRITERIA.md`
12. The modules and tests you are about to change

If a task touches a planned feature, cite the relevant root planning document and keep implementation aligned with what is actually present in the repo.

## Working Rules

### Backend

- Keep controller, service, repository, and domain logic separated.
- Use `BigDecimal` for money, prices, fees, PnL, and risk calculations.
- Prefer DTOs at HTTP boundaries. Do not leak JPA entities directly to the frontend.
- Keep live-exchange integration isolated behind services and environment gates.
- Do not add new trading execution paths without explicit risk checks, environment routing, and kill-switch behavior.

### Frontend

- Keep the feature-based structure under `frontend/src/features/`.
- Prefer adapting backend payloads inside API slices instead of scattering contract fixes across components.
- Keep React/Vite as the baseline. Do not migrate to Next.js without explicit approval.
- Treat environment mode as a safety-critical UI state. Default to `test`.

### Cross-Cutting

- When docs and code disagree, update docs to match verified reality and record the contradiction in `PROJECT_STATUS.md`.
- Keep code ASCII unless the file already needs other characters.
- Update docs when architecture, workflow, risk posture, or project status materially changes.
- Never start a frontend or backend dev server until existing instances are checked and stopped first; always stop any server you started before finishing the task.

## Preferred Workflow

1. Read the relevant root plan/docs and current implementation.
2. Identify the smallest safe change that moves the project forward.
3. Implement the change without disturbing unrelated work.
4. Run the narrowest useful verification first, then broader checks if needed.
5. Update documentation for status, architecture, or guardrails when needed.
6. Report assumptions, verification results, and any remaining risks.

## Definition Of Done

A task is done when all of the following are true:

- The change matches the relevant plan/architecture docs or explicitly documents why it does not.
- Behavior is verified with the most relevant available checks.
- New or changed API behavior is reflected in the frontend contract and docs.
- Safety defaults remain conservative.
- Docs are updated if project status, architecture, workflows, or guardrails changed.
- Known gaps, blockers, and assumptions are called out plainly.

## Verification Expectations

### Frontend

Use the narrowest meaningful set of:

- `npm run lint`
- `npx vitest run --watch=false`
- `npm run build`

If lint or tests are already failing for unrelated reasons, document the existing failures and avoid hiding them.

### Backend

Use the narrowest meaningful set of:

- `.\gradlew.bat test`
- `.\gradlew.bat build`
- targeted controller or service tests when appropriate

If sandboxing, missing services, or local environment limits prevent verification, state that explicitly.

## Documentation Files To Keep Current

- `PLAN.md`: slim current/future implementation plan
- `PRODUCT.md`: product intent and operating boundaries
- `TECH.md`: stack and command standards
- `STRUCTURE.md`: module boundaries and architectural structure
- `GRADLE_AUTOMATION.md`: backend build/test execution guidance
- `PROJECT_STATUS.md`: current completion, gaps, contradictions, risks, priorities
- `ARCHITECTURE.md`: actual module boundaries and data flow
- `TRADING_GUARDRAILS.md`: risk, paper/live rules, validation gates
- `docs/ROADMAP.md`: realistic phased next work
- `docs/ACCEPTANCE_CRITERIA.md`: feature completion standards

## Strategy And Live Trading Guardrails

- Backtests are research artifacts, not proof of future returns.
- Include fees, slippage, and out-of-sample evaluation in strategy claims.
- Paper trading must precede any live-trading consideration.
- Live exchange connectivity, if added later, should start read-only or paper-only unless explicitly approved.
- Never market hypothetical or paper results as real profitability.
