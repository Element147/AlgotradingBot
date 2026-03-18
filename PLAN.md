# PLAN

Status updated: March 18, 2026

## Purpose

Single slim implementation plan replacing legacy multi-file phase specs.

## Current State (Done)

1. Core platform and auth foundations are implemented.
2. Strategy management, backtest, risk, and paper-trading workflows are implemented end-to-end.
3. Frontend dashboard flows are implemented with real data integration.
4. Backtest strategy architecture is modular (`BacktestStrategy` + registry + simulation engine).
5. Local run/build workflow is stable (`build.ps1`, `run.ps1`, `stop.ps1`).
6. Local Docker runtime now uses an explicit Compose project identity plus reusable named volumes for PostgreSQL, Kafka, and Kafka secrets.
7. CI verification gates are implemented in GitHub Actions.
8. Operator audit trail and reproducibility APIs (dataset checksum/download, backtest replay/compare) are implemented.
9. Controller DTO modernization to records has progressed to the core mutable response set.
10. Frontend now surfaces operator audit events plus replay/compare and dataset reproducibility workflows.
11. Backtest details now persist and return real equity/trade series used by chart and CSV/PNG exports.
12. Generated OpenAPI contract export/check workflow is implemented and enforced in CI.
13. Account endpoints now fail closed for unavailable live reads and surface explicit capability errors to dashboard/settings flows.
14. System backup endpoint now creates real database backup artifacts instead of placeholder metadata files.
15. Dashboard system-health status now consumes `systemInfo` and `riskStatus` instead of placeholder probes.
16. Trade details now use a dedicated backend endpoint rather than client-side filtering of large history payloads.
17. Environment routing now supports explicit `X-Environment` request overrides end to end for account/risk flows.
18. Repair/orchestration automation now uses repo-aware workspace resolution and the same `run.ps1`/`stop.ps1`/Compose entrypoints as the operator workflow.
19. Dataset lifecycle tooling now includes retention inventory, archive/restore controls, and archived-dataset run blocking.
20. Strategy management now persists configuration history and exposes version metadata in the UI/API.
21. Paper-trading dashboard state now includes restart-recovery telemetry for stale orders/positions.
22. Backtest reports/comparisons now carry dataset provenance and block exports when provenance is incomplete.
23. Backend compilation now runs with `-Xlint:deprecation`, and the audited deprecated API set has been removed.
24. Backtests now persist repeatable experiment names/keys and expose grouped experiment summaries in the API/UI.
25. Paper-trading state now includes incident summaries plus in-app operator alerts derived from recovery telemetry.
26. Strategy configuration modal now surfaces typed strategy presets and recommended timeframe/risk ergonomics.
27. Repair selection now recognizes port-conflict and orphan/network failure signatures and routes to dedicated playbooks.
28. Historical market-data downloader/import workflows are implemented for free stock/crypto providers and feed completed datasets into backtest storage.
29. Admin-managed encrypted provider credential storage with note support is implemented for keyed market-data providers.
30. Free high-value Docker MCP tooling is persisted for this repository (`context7`, `database-server`, `openapi-schema`, `playwright`).
31. Documentation now uses a slim core plus optional task guides so implementation context stays more targeted.
32. Java 25 migration is implemented across Gradle, Docker, CI, local scripts, and fresh PostgreSQL schema bootstrap.

## Current Work (Now)

1. Documentation discipline
   - keep the slim core docs current
   - keep optional task guides current only when their workflow actually changes
2. Research data acquisition
   - completed: provider-backed historical market-data downloader with retry-aware import jobs and direct backtest dataset ingestion
   - completed: encrypted PostgreSQL storage for keyed-provider credentials with frontend note capture and env-var fallback
   - next: expand provider coverage only when a concrete data gap remains after the current free-source set
3. Operational hardening
   - completed: operator alert delivery on top of paper-trading recovery signals
   - completed: extend repair playbooks for additional runtime failure signatures
4. Developer efficiency
  - completed: persistent free Docker MCP toolchain for docs, database inspection, contracts, and UI verification
  - completed: deterministic local Docker project naming and reusable runtime volumes
  - completed: shared PowerShell runtime helpers, untracked runtime logs, reclaim-friendly local memory defaults, and optional Semgrep/Hoverfly tooling
  - completed: Java 25 toolchain/runtime alignment plus JDWP-aware local and Docker debug entrypoints

## Near Future

1. Data reproducibility
   - completed: repeatable experiment structure and naming conventions
   - completed: stronger research report packaging on top of current provenance checks
2. Paper-trading hardening
   - completed: operator alert routing and incident summaries
   - completed: audit-event UX refinements with filterable summaries and dashboard/settings review surfaces
3. Strategy lifecycle improvements
   - completed: typed per-strategy parameter editing ergonomics
   - completed: higher-level experiment/change review flows
4. Security hardening migration
  - strict-by-default auth posture and explicit local override runbook are implemented
  - keep rollout/rollback guidance current as auth workflows evolve
5. Java platform posture
   - completed: Java 25 runtime baseline with Liquibase-first PostgreSQL bootstrap and runtime schema validation
   - deferred by design: preview-only JDK 25 features such as structured concurrency

## Optional Future (Only After Hardening)

1. Production-readiness track
   - container validation automation
   - resource/stability checks
   - failure recovery and repair playbooks
2. Live-readiness evaluation
   - only after reproducible paper evidence and guardrail verification
   - no default live execution enablement

## Non-Negotiable Gates

1. Guardrails are never weakened.
2. Profitability is never claimed without reproducible evidence.
3. Test/paper defaults remain the system default.
4. Any live-readiness work stays explicitly opt-in and heavily audited.
5. Critical operator actions remain auditable and reproducible.
