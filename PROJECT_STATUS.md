# Project Status

## Current Posture

The repository is an operational local-first MVP for research and paper-trading workflows.

- Backend and frontend are integrated and usable end to end.
- Default posture remains `test` first, with paper trading available and live execution still gated out of the default path.
- Java 25 is the standard backend toolchain across Gradle, Docker, local scripts, and CI.
- Runtime uses PostgreSQL with Liquibase-managed schema creation and `spring.jpa.hibernate.ddl-auto=validate`.
- Tests and backend builds use the H2 `test` profile.

## Current Capabilities

### Research And Backtesting

- Strategy catalog is modular and registry-driven.
- Backtests support `SINGLE_SYMBOL` and `DATASET_UNIVERSE` execution modes.
- Runs persist history, details, equity series, trade series, validation state, and experiment labels.
- Operators can replay a prior run, compare runs side by side, and delete finished results.
- Dataset provenance includes checksum, schema version, retention status, archive or restore controls, and download support.
- Export flows fail closed when dataset provenance is incomplete.

### Market Data

- Operators can import stock and crypto history from supported providers directly into the backtest dataset catalog.
- Import jobs are persistent, retry-aware, and visible in the UI.
- Import progress is streamed through WebSocket events with polling fallback.
- Provider credentials can be stored encrypted in PostgreSQL or supplied through environment variables.

### Paper Trading And Operations

- Strategy configuration, version history, and typed preset guidance are available through backend and UI flows.
- Paper-trading state includes recovery-aware telemetry, stale-order and stale-position visibility, and in-app incident alerts.
- Risk controls include environment-aware status, configurable limits, and circuit-breaker overrides with auditability.
- Exchange connection profiles are persisted per authenticated user in PostgreSQL.
- Critical system actions are recorded in durable operator audit events.
- System backup produces real database-native backup artifacts.

### Platform And Developer Workflow

- Local fast mode runs PostgreSQL in Docker with backend and frontend locally.
- Full-stack mode runs app, PostgreSQL, and Kafka in Docker with the frontend locally.
- Compose identity is fixed to `algotradingbot`, with reusable named volumes for PostgreSQL, Kafka, and Kafka secrets.
- Script-driven backend logs go to `.runtime/logs`.
- Project-local Codex agents under `.codex/agents/` cover quant, Java/Spring, frontend, risk, security, and local ops workflows for this repository.
- CI checks backend build and tests, frontend lint and tests, and OpenAPI contract drift.
- MCP support is documented for `context7`, `database-server`, `openapi-schema`, `playwright`, `semgrep`, and `hoverfly-mcp-server`.

## Verified Baseline

The repository runbooks and verification flow assume the following baseline:

- `.\run.ps1` and `.\stop.ps1` manage the fast local stack cleanly.
- `.\run-all.ps1` and `.\stop-all.ps1` manage the Docker-backed full stack cleanly.
- `.\gradlew.bat javaMigrationAudit --no-daemon` is the Java 25 audit entrypoint.
- OpenAPI artifacts are tracked in `contracts/openapi.json` and `frontend/src/generated/openapi.d.ts`.
- `.\security-scan.ps1 -FailOnFindings` is the local zero-findings gate for security-sensitive changes.

Use `TECH.md` and `docs/guides/TESTING_AND_CONTRACTS.md` for exact command sequences.

## Active Priorities

- Keep canonical docs aligned with the actual system and avoid reintroducing progress-log style documentation.
- Extend alerting and review workflows around paper-trading incidents and experiment governance.
- Add market-data providers only when they close a concrete coverage gap not served by the current free-provider set.
- Continue hardening runtime and verification flows without weakening safety defaults.

## Current Constraints

- Backtests and paper trading remain simulation workflows.
- Direct short exposure is available only in research and paper flows when explicitly enabled per strategy.
- Live direct shorting, leverage, and margin remain out of scope in the default path.
- Strict auth is the normal posture; relaxed auth is a local debugging override only.
- Java 25 preview features such as structured concurrency are intentionally not enabled in default runtime paths.
