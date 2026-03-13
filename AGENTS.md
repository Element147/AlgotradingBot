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

Always read this slim core first:

1. `README.md`
2. `PROJECT_STATUS.md`
3. `ARCHITECTURE.md`
4. `TRADING_GUARDRAILS.md`
5. `PLAN.md`
6. `PRODUCT.md`

Then open only the guides that match the task:

- task-to-guide index first when routing is unclear: `docs/guides/README.md`
- Frontend feature or UI work: `docs/guides/FRONTEND_IMPLEMENTATION.md`
- Backend/controller/service/repository work: `docs/guides/BACKEND_IMPLEMENTATION.md`
- Local runtime, Docker, PowerShell, or MCP work: `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- Verification, CI, or contract drift work: `docs/guides/TESTING_AND_CONTRACTS.md`
- Downloader, provider credentials, or research workflow work: `docs/guides/MARKET_DATA_RESEARCH.md`
- Module/file boundary clarification: `STRUCTURE.md`
- Planned feature scope or acceptance gates: `docs/ROADMAP.md` and `docs/ACCEPTANCE_CRITERIA.md`
- Backend wrapper-specific execution detail only when needed: `GRADLE_AUTOMATION.md`

If a task touches a planned feature, cite the relevant planning document and keep implementation aligned with what is actually present in the repo.

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

### Tooling

- Prefer the persistent free Docker MCP set when it reduces guesswork:
  - `context7` for up-to-date library/framework docs
  - `database-server` for runtime PostgreSQL inspection
  - `openapi-schema` for contract inspection
  - `playwright` for UI verification
  - `semgrep` for optional security scans on auth/secrets/request-boundary changes
  - `hoverfly-mcp-server` for optional provider/exchange API mocking
- Docker MCP path and host conventions are documented in `docs/guides/LOCAL_DEV_DOCKER_MCP.md`.

## Preferred Workflow

1. Read the slim core docs and the single most relevant optional guide.
2. Identify the smallest safe change that moves the project forward.
3. Implement the change without disturbing unrelated work.
4. Run the narrowest useful verification first, then broader checks if needed.
5. Update documentation for status, architecture, workflow, or guardrails when needed.
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
- `npm run test -- --watch=false`
- `npm run build`

If lint or tests are already failing for unrelated reasons, document the existing failures and avoid hiding them.

### Backend

Use the narrowest meaningful set of:

- `.\gradlew.bat test`
- `.\gradlew.bat build`
- targeted controller or service tests when appropriate

If sandboxing, missing services, or local environment limits prevent verification, state that explicitly.

## Documentation Files To Keep Current

Slim core docs:

- `README.md`
- `PLAN.md`
- `PRODUCT.md`
- `PROJECT_STATUS.md`
- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`

Optional durable docs:

- `TECH.md`
- `STRUCTURE.md`
- `GRADLE_AUTOMATION.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/guides/FRONTEND_IMPLEMENTATION.md`
- `docs/guides/BACKEND_IMPLEMENTATION.md`
- `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
- `docs/guides/MARKET_DATA_RESEARCH.md`

## Strategy And Live Trading Guardrails

- Backtests are research artifacts, not proof of future returns.
- Include fees, slippage, and out-of-sample evaluation in strategy claims.
- Paper trading must precede any live-trading consideration.
- Live exchange connectivity, if added later, should start read-only or paper-only unless explicitly approved.
- Never market hypothetical or paper results as real profitability.
