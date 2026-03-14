# PROJECT_STATUS.md

Status updated: March 14, 2026

## Current State

The repository is in an operational local-first MVP state:

- Backend and frontend are integrated for core research workflows.
- Default operating posture remains `test`/`paper`.
- Local runtime uses Docker PostgreSQL; backend tests/build run on H2 `test` profile.
- Local Docker runtime now uses the explicit Compose project name `algotradingbot`, keeping container/network naming stable across scripts and manual runs.
- Kafka runtime storage now uses reusable named volumes, including a named secrets volume, instead of creating new anonymous secrets volumes on repeated full-stack runs.
- Saved exchange connection profiles are now persisted per user in the runtime database instead of browser storage.
- Persistent free Docker MCP support is configured for `context7`, `database-server`, `openapi-schema`, and `playwright`.
- Optional free Docker MCP support now also includes `semgrep` and `hoverfly-mcp-server` for security scanning and provider/exchange mocking when a task needs them.
- Canonical docs now use a slim core plus task-specific optional guides so Codex and humans can load only the workflow detail relevant to the current task.
- Local script-driven runtime now keeps backend file logs under repo-local untracked `.runtime/logs` instead of tracked source paths.
- Local developer memory behavior now keeps reclaim-friendly build defaults while giving backend runtime more headroom: no-daemon `bootRun`, a larger 2 GB backend heap, and ZGC for lower-pause local/container startup and runtime behavior.
- Docker Desktop AI and inference UI features are disabled locally because this workflow does not use them.
- No default real-money execution path is enabled.
- Cross-stack CI verification gates now exist in `.github/workflows/ci.yml`.

Implemented product slices:

1. Strategy management
2. Backtest execution plus history/details plus replay/compare APIs
3. Risk controls plus circuit-breaker override safeguards
4. Paper-trading account/order state
5. Operator audit-event trail for critical actions (`/api/system/audit-events`)
6. Dataset lifecycle and reproducibility controls (`checksumSha256`, schema version, retention inventory, archive/restore, download)
7. Strategy configuration version history and versioned defaults
8. Paper-trading recovery status visibility for stale-order/stale-position detection
9. Provenance-guarded backtest reporting and comparison exports
10. Repeatable experiment grouping and multi-run research summaries
11. In-app paper-trading incident alerts and operator actions
12. Typed strategy-configuration preset guidance
13. Filterable operator audit summaries and review UX in dashboard/settings
14. Provider-backed historical market data download/import jobs with automated retry handling and direct dataset ingestion for backtests
15. Admin-managed encrypted market-data provider credentials stored in PostgreSQL with per-provider notes and backend env-var fallback
16. Persisted backtest execution telemetry (stage, percent, current candle date, status messaging), live WebSocket-vs-polling transport visibility, and explicit UI details/delete controls
17. Virtual-thread-backed background execution plus parsed backtest dataset candle caching to improve repeat-run throughput
18. Startup recovery orchestration for unfinished long-running work so interrupted backtests restart automatically and market-data imports resume from saved cursor state after restart
19. Live WebSocket cache streaming for backtest and market-data import progress so operator pages update from backend push events instead of guessed client polling alone

## Active Design Decisions (Source of Truth)

1. Strategy architecture is SOLID-oriented:
   - each backtest strategy is its own class
   - orchestration is in `BacktestSimulationEngine`
   - strategy discovery is bean-driven via `BacktestStrategyRegistry`
2. Backtest engine supports both `SINGLE_SYMBOL` and `DATASET_UNIVERSE` modes.
3. Financial values remain `BigDecimal` in money/risk paths.
4. Immutable HTTP DTOs should prefer Java `record` where contract and framework constraints allow.
5. Runtime/live integration points stay isolated behind services and safety gates.

## Completed In This Iteration

1. Implemented CI workflow with backend `test/build` and frontend `lint/test/build`.
2. Added durable operator audit-event persistence and API for critical operator actions.
3. Added reproducibility features for backtest datasets (checksum + schema version + download).
4. Added backtest replay endpoint and side-by-side comparison endpoint.
5. Completed a controller-DTO modernization wave (mutable DTO classes converted to records where safe).
6. Surfaced audit-event history plus replay/compare and dataset download workflows in the frontend.
7. Persisted real backtest equity/trade series and switched results charts/exports from synthetic data to stored execution analytics.
8. Added generated OpenAPI contract export/check flow and wired it into frontend CI verification.
9. Published strict-auth operator runbook plus explicit dev-only override guidance in canonical docs and login UX.
10. Replaced live-mode account fallback behavior with explicit capability gating; `/api/account/*` now honors query/header environment routing and returns a 409 error instead of paper data when live reads are unavailable.
11. Replaced the backup metadata placeholder with real database backup artifacts (`SCRIPT` on H2 tests, `pg_dump` with Docker fallback on PostgreSQL runtime).
12. Rewired the dashboard system-health card to real `systemInfo` and `riskStatus` APIs, including database/Kafka and circuit-breaker status.
13. Added a dedicated trade-details endpoint and switched the frontend modal off the 1000-row client-side lookup path.
14. Normalized frontend/backend environment routing onto `X-Environment` overrides, with shared resolver use on account/risk paths and explicit request-level header support in the frontend transport.
15. Replaced repair/orchestration placeholders with workspace-aware automation aligned to `run.ps1`, `stop.ps1`, repo-local Compose paths, and managed PID/port cleanup.
16. Added dataset lifecycle inventory, retention reporting, and archive/restore controls with backend enforcement that archived datasets cannot be used for new runs.
17. Added persisted strategy configuration history, surfaced version metadata in strategy management, and exposed a dedicated config-history API/UI.
18. Added paper-trading recovery telemetry (`staleOpenOrderCount`, `stalePositionCount`, recovery status/message) to the backend and dashboard.
19. Extended backtest detail/comparison responses with dataset provenance and blocked report/comparison exports when checksum/schema/timestamp provenance is incomplete.
20. Eliminated the audited deprecated/legacy API usage set and enabled backend `-Xlint:deprecation` compilation so regressions surface during normal verification.
21. Added repeatable backtest experiment names/keys, grouped experiment summaries, and experiment-aware report/details UI.
22. Added paper-trading incident summaries and in-app operator alerts on top of stale-order/stale-position telemetry.
23. Added typed strategy preset guidance in strategy configuration UX.
24. Extended repair action selection for port-conflict and orphan/network failure signatures.
25. Added filterable operator audit summaries plus dashboard/settings audit review surfaces.
26. Added paper/backtest short-selling support with strategy-level enablement, explicit `LONG`/`SHORT` position state, and `BUY`/`SELL`/`SHORT`/`COVER` trade actions across backend and frontend.
27. Moved saved exchange connection profiles from browser storage into database-backed per-user persistence with active-profile selection in the settings UI.
28. Added a market-data downloader tab plus backend import jobs for free stock/crypto providers, automatic wait-and-retry handling, and direct dataset imports into the backtest catalog.
29. Added encrypted database-backed provider credential management in Settings, including note storage and runtime fallback to environment variables.
30. Made the Docker-backed MCP starter set persistent for this repo's workflow (`context7`, `database-server`, `openapi-schema`, `playwright`) and documented the Windows/Docker path plus `host.docker.internal` conventions.
31. Standardized local runtime scripts on an explicit Compose project name and reusable named volumes, including a deterministic Kafka secrets volume.
32. Restructured docs into a slim core plus optional task guides for frontend, backend, runtime/MCP, testing/contracts, and market-data workflows.
33. Extracted shared PowerShell helpers for path refresh, runtime directory setup, PID cleanup, port cleanup, and health polling across the local scripts.
34. Moved script-driven backend logs into untracked `.runtime/logs` storage and stopped using tracked source log files as the default runtime target.
35. Tuned local runtime/build memory behavior to keep parallel builds but release idle memory sooner, including lower Gradle heap ceilings, a shorter daemon idle timeout, `--no-daemon` local `bootRun`, and capped local Kafka heap.
36. Added optional free Semgrep and Hoverfly tooling paths for security-sensitive changes and provider/exchange API mocking.
37. Expanded the optional guide index with task tags and examples so task routing stays low-noise.
38. Disabled unused Docker Desktop AI and inference feature flags to reduce idle workstation overhead.
39. Hardened repair/validation process execution with service/script allowlists, typed process arguments, validated PID parsing, and managed Compose/network identity.
40. Replaced production WebSocket URL string rewriting with explicit secure same-origin resolution, while keeping localhost `ws` only for development/test.
41. Cleaned the Semgrep security baseline to zero findings and documented the resolved rules plus scan workflow in `docs/SEMGREP_TRIAGE.md`.
42. Added a Liquibase repair migration for legacy `market_data_import_jobs.staged_csv_data` large-object columns and aligned backend runtime defaults on a 2 GB ZGC heap for lower-latency local operation.
43. Added persisted backtest progress telemetry with committed mid-run updates, clearer backend execution logging, frontend live-progress transparency, and delete-result controls for finished runs.
44. Added a dedicated virtual-thread async executor, moved market-data job dispatch onto async background workers, reduced backtest progress-write frequency, and reused parsed candles for repeated dataset-backed backtests.
45. Added startup recovery participants that scan for unfinished long-running work and restart interrupted or queued backtests while resuming market-data imports from saved cursor state after server restart.
46. Mounted the frontend WebSocket runtime in the production app shell, subscribed Redux cache updates to `backtest.progress` and `marketData.import.progress`, and exposed live transport/fallback telemetry directly in the backtest and market-data operator pages.

## Remaining Work (Current Priorities)

1. No blocking items remain in the March 12, 2026 current-priority technical-debt set.
2. The March 12, 2026 research-quality, operator-alerting, audit-review, and migration-hardening set is complete end to end.
3. Next priorities move to multi-channel alert delivery plus deeper experiment governance/review automation on top of the now-hardened research workflow.
4. Additional market-data providers should only be added when they cover a concrete stock/crypto history gap not already served by the current free-provider set.

## Risk Elimination Migration Strategy

Phase 1 (implemented now):

1. Add CI gates so regressions are blocked by default.
2. Add audit trails for critical operator actions.
3. Add reproducibility metadata and replay primitives for backtests.

Phase 2 (implemented now):

1. Strict-default auth posture is enabled (`relaxed-auth=false` unless explicitly overridden).
2. Dev-only override guidance and onboarding docs are published.

Phase 3 (implemented now):

1. Surface audit/reproducibility signals in the frontend so operators can verify actions quickly.
2. Persist richer analytics (equity/trade series) for reproducible comparisons.
3. Add contract generation/checks to reduce frontend/backend drift risk.

Phase 4 (implemented now):

1. Align repair/orchestration automation with repo-local scripts and Compose topology instead of ad-hoc global Docker commands.
2. Replace stubbed port-conflict handling with managed stop/cleanup actions and fail-closed reporting when conflicts remain.

Phase 5 (implemented now):

1. Add dataset lifecycle inventory/retention controls and block archived datasets from new research runs.
2. Add versioned strategy configuration history and surface it in the operator UI.
3. Add paper-trading recovery telemetry and provenance-guarded research exports.
4. Remove remaining audited deprecated APIs and enable compiler-level deprecation visibility.

## Known Risks and Constraints

- Strategy outcomes are simulation artifacts and must not be presented as guaranteed returns.
- Short exposure is now supported only in `test`/`paper` research flows and remains disabled for live execution, leverage, and margin expansion.
- Strict auth is the default; local override remains explicit via `ALGOTRADING_RELAXED_AUTH=true`.

## Verification Baseline

Last verified baseline (local):

- Docker MCP persistence verified:
  - enabled servers include `context7`, `database-server`, `openapi-schema`, `playwright`, `semgrep`, and `hoverfly-mcp-server`
  - database MCP connects to local PostgreSQL via `host.docker.internal` and sees 16 tables
  - OpenAPI MCP lists endpoints from `contracts/openapi.json`
  - Context7 resolves Spring Boot docs and returns versioned documentation for Spring Boot `4.0.3`
  - Docker MCP tool listing now includes Hoverfly mock-management tools
- Docker cleanup verified:
  - one-time `docker system prune -a --volumes -f` completed successfully and reclaimed 10.86 GB of unused images, volumes, and build cache
  - only named project data volumes remained after cleanup
- Runtime/memory workflow verified:
  - shared PowerShell helpers now back `build*.ps1`, `run*.ps1`, and `stop*.ps1`
  - local runtime logs now write to `.runtime/logs`
  - Gradle daemon heap is reduced from 2 GB to 1 GB and the idle timeout is 15 minutes
  - backend runtime defaults now use `-Xms512m -Xmx2g -XX:+UseZGC -XX:+ZGenerational -XX:MaxMetaspaceSize=512m` in local script and container entrypoints
  - user-level WSL config now enables `autoMemoryReclaim=gradual` with page reporting and 2 GB swap
  - after `wsl --shutdown`, `vmmemWSL` dropped to roughly 1.1 GB working set / 1.24 GB private memory
- Security workflow verified:
  - `.\security-scan.ps1` now excludes generated/build/runtime directories so the scan remains practical on this workstation
  - `.\security-scan.ps1 -FailOnFindings` now completes successfully with `0 findings`
  - Semgrep cleanup notes and resolved-rule summaries are recorded in `docs/SEMGREP_TRIAGE.md`
- Local runtime verification:
  - `.\run.ps1` starts PostgreSQL plus local backend/frontend; backend health returned `UP` and frontend responded on `5173`
  - `.\stop.ps1` stops backend, frontend, and PostgreSQL cleanly
  - `.\run-all.ps1` starts app, PostgreSQL, Kafka, and frontend successfully; backend health returned `UP`
  - repeated `.\run-all.ps1` start/stop cycles reuse only `algotradingbot_postgres_data`, `algotradingbot_kafka_data`, and `algotradingbot_kafka_secrets`, with no new anonymous Kafka secrets volume created
  - `.\stop-all.ps1` tears down the full stack cleanly
  - full-stack container memory during smoke test was about 446 MiB for `algotrading-app`, 373 MiB for Kafka, and 33 MiB for PostgreSQL
  - Docker Desktop user settings now disable `EnableDockerAI` and `EnableInferenceGPUVariant`

Use `README.md` commands as the standard verification/runbook.
