# Feature Development Plan

Central tracking document for the next major delivery wave of the local-first algorithmic trading research platform.

This plan is intentionally aligned with the current repository reality documented in `README.md`, `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `TRADING_GUARDRAILS.md`, `PLAN.md`, `PRODUCT.md`, `docs/ROADMAP.md`, `docs/ACCEPTANCE_CRITERIA.md`, `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md`, and `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`.

## Status

- [ ] Phase 1: Data Architecture and Backend Performance
- [ ] Phase 2: Frontend Performance and UI or UX Redesign
- [ ] Phase 3: Quantitative Research and Strategy Development
- [ ] Phase 4: Future Proofing
- [ ] Final completion trigger executed

## Current Baseline To Respect

- The current backtest dataset catalog persists raw CSV bytes in `backtest_datasets.csv_data`, stages import CSV bytes in `market_data_import_jobs.staged_csv_data`, parses them through `HistoricalDataCsvParser`, and reuses parsed candles through `BacktestDatasetCandleCache`.
- The backend already has meaningful async seams: `BacktestManagementService`, `BacktestExecutionService`, `BacktestExecutionLifecycleService`, `BacktestProgressService`, `MarketDataImportExecutionService`, and authenticated WebSocket progress with polling fallback.
- The current SPA redesign recorded in `PLAN.md` is already implemented. Phase 2 of this document extends that workstation model; it does not restart the shell from scratch.
- The current frontend still carries a global `test` or `live` environment slice, while paper trading is exposed as a separate route and workflow.
- Existing strategy evidence is conservative. No strategy may be labeled profitable or production-ready without reproducible evidence that survives realistic fees, slippage, out-of-sample validation, and paper follow-up.

## Working Assumptions

- "Forward Testing" in this plan means a paper-safe signal observation and investigation workspace that can track live market data, model decisions, and operator notes without silently becoming a live execution path.
- "Day trading" in this plan means strategies designed to flatten by session close or a defined daily cutoff.
- "Intraday" in this plan means lower-turnover multi-hour strategies using `15m`, `1h`, or `4h` bars that do not depend on low-latency execution.
- If a requested live behavior conflicts with current repo guardrails, the first deliverable is monitor-only or paper-safe capability with explicit fail-closed messaging.

## Non-Negotiable Delivery Rules

- Default to `test` or `paper` behavior at every layer unless explicit live capability has been approved and implemented safely.
- Do not weaken environment separation, risk controls, circuit breakers, audit trails, or operator overrides.
- Preserve DTO boundaries, BigDecimal money handling, and the current controller or service or repository split on the backend.
- Preserve the React or Vite SPA and feature-first frontend structure.
- Do not use placeholders in later implementation work.
- Update canonical docs when verified behavior, architecture ownership, or workflow expectations materially change.

## Mandatory Step Completion Protocol

Every checkbox in this file is only allowed to be marked complete after the full verification bundle below passes and the result is logged honestly.

Backend verification, run sequentially:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

Frontend verification:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

Additional required checks when applicable:

```powershell
cd frontend
npm run contract:check

cd AlgotradingBot
.\gradlew.bat javaMigrationAudit --no-daemon

cd C:\Git\algotradingbot
.\security-scan.ps1 -FailOnFindings
```

Runtime smoke checks when orchestration, long-running async flows, or environment routing change:

```powershell
cd C:\Git\algotradingbot
.\run.ps1
.\stop.ps1
.\run-all.ps1
.\stop-all.ps1
```

Implementation notes for later execution:

- Backend `test` and `build` must remain sequential because the repo documents a Gradle temp-file race when they run in parallel.
- If the repo later introduces dedicated integration test tasks, those tasks become mandatory additions to this bundle immediately.
- No server may be started until existing instances have been checked and stopped first, and any server started for verification must be stopped before the work session ends.

## Phase 1: Data Architecture And Backend Performance

Goal: replace the CSV-in-cell bottleneck with a relational market-data store, migrate existing datasets safely, and make heavy backend workflows genuinely async and UI-safe.

### 1A. Backtest Data Storage Overhaul

#### 1A.1 Audit the current data flow and bottlenecks
- [x] Document every read or write path that touches `backtest_datasets.csv_data`, `market_data_import_jobs.staged_csv_data`, `HistoricalDataCsvParser`, `BacktestDatasetCandleCache`, `BacktestExecutionService`, `BacktestTelemetryService`, dataset download, and dataset upload/import endpoints.
Acceptance Criteria
- The current source of truth for historical candles is documented end to end from upload/import to backtest execution and telemetry reconstruction.
- Baseline metrics exist for parse time, memory footprint, dataset download size, backtest warm-up time, and slow API endpoints on small, medium, and large datasets.
- Current pain points are classified into storage, query, serialization, caching, and UI impact categories.
- The mandatory step completion protocol passes.

#### 1A.2 Define the new relational market-data model
- [x] Produce an architecture decision record for a relational candle store that keeps `backtest_datasets` as provenance catalog metadata while moving candle execution reads to new normalized tables.
Target model
- `market_data_series`: one logical instrument or venue stream per broker or exchange or provider or symbol or asset class.
- `market_data_candle_segments`: provenance and coverage metadata for every imported batch and timeframe range.
- `market_data_candles`: authoritative OHLCV rows keyed by `series_id`, `timeframe`, and `bucket_start`.
- Optional `market_data_aggregates` or materialized views for common rollups if benchmarking proves they are necessary.
Acceptance Criteria
- The model supports querying by broker, exchange, provider, asset class, symbol, base asset, quote asset, timeframe, and date range.
- The design explicitly supports stocks, ETFs, crypto spot pairs, and future broker-specific metadata without schema rewrites.
- The design documents partitioning, indexes, uniqueness rules, archival strategy, and expected query shapes.
- The mandatory step completion protocol passes.

#### 1A.3 Define overlap merge, deduplication, and compression policy
- [x] Specify how overlapping `1h` and `15m` imports are merged without losing exact-timeframe queryability.
Required policy decisions
- Exact timeframe queries must remain possible.
- Backtest execution must have a deterministic "best available" path.
- Duplicate rows and overlapping segments must be deduplicated or superseded without silent data loss.
- Compression or retention must reduce cold-storage cost without corrupting provenance.
Acceptance Criteria
- A deterministic precedence policy exists, such as `EXACT_RAW > FINER_CANONICAL_ROLLUP > COARSER_FALLBACK`, and it is documented.
- Segment metadata can explain which import batch produced every candle returned to the simulator.
- Archived or duplicate data can be compressed or retired without breaking replay reproducibility.
- The mandatory step completion protocol passes.

#### 1A.4 Implement Liquibase schema changes and repositories
- [x] Add the new tables, indexes, constraints, and repository interfaces behind Liquibase-managed migrations.
Acceptance Criteria
- The schema migrates cleanly on PostgreSQL and remains compatible with the H2 `test` profile used by backend tests.
- Hot-path indexes cover `series_id + timeframe + bucket_start`, coverage-range scans, and venue or asset filters.
- Repository tests verify inserts, range reads, overlap detection, and duplicate prevention.
- The mandatory step completion protocol passes.

#### 1A.5 Build the new market-data query service
- [x] Introduce backend services that query the relational candle store directly instead of reparsing CSV blobs for execution and telemetry.
Acceptance Criteria
- Backtest execution can load candles by series or timeframe or date range without touching `HistoricalDataCsvParser`.
- Telemetry reconstruction can query only the window it needs instead of hydrating the entire dataset into memory.
- API DTOs keep provenance visible while entities remain backend-private.
- The mandatory step completion protocol passes.

#### 1A.6 Add resampling and best-available query behavior
- [x] Refactor resampling so the engine can request `exact timeframe`, `best available timeframe`, or `finer-to-coarser rollup` explicitly from the new store.
Acceptance Criteria
- A request for `15m` returns exact `15m` rows when present.
- A request for `1h` can choose exact imported `1h` rows or deterministic rollup from finer data based on the documented policy.
- Tests cover overlapping imports, partial coverage windows, gaps, and mixed asset classes.
- The mandatory step completion protocol passes.

#### 1A.7 Add observability and performance guardrails around the new store
- [x] Add metrics and structured logs for storage growth, query latency, gap counts, overlap resolution, and cache hit behavior.
Acceptance Criteria
- Metrics expose enough detail to compare pre-migration and post-migration behavior.
- The backtest engine and telemetry services no longer require whole-dataset CSV parse logs on normal hot paths.
- Alerts or dashboards can identify slow scans, missing partitions, or overlap anomalies.
- The mandatory step completion protocol passes.

### 1B. Data Migration Plan

#### 1B.1 Build an idempotent migration utility
- [x] Implement a migration command, preferably as a Gradle task plus optional PowerShell wrapper, that reads legacy dataset rows and writes normalized candles and segments into the new relational store.
Acceptance Criteria
- The migration can run in dry-run mode and produce a summary before writing anything.
- The migration is idempotent and can resume safely after interruption.
- The migration logs dataset ID, checksum, row count, symbols, migrated series count, and any rejected rows.
- The mandatory step completion protocol passes.

#### 1B.2 Reconcile migrated data against legacy datasets
- [x] Build automated reconciliation checks comparing legacy CSV-derived counts and time ranges with the new relational representation.
Acceptance Criteria
- For every migrated dataset, row counts, symbols, min timestamp, max timestamp, and checksums or derived hash summaries match expected values.
- Any gap or duplicate discrepancy is reported with actionable detail rather than a silent pass or fail.
- A clear rollback rule exists for datasets that fail reconciliation.
- The mandatory step completion protocol passes.

#### 1B.3 Dual-write or write-cutover the import pipeline
- [x] Change all future dataset uploads and provider imports so candle writes go only to the new relational store, while legacy byte storage stays optional and temporary only if needed for download compatibility.
Acceptance Criteria
- `BacktestDatasetStorageService`, market-data imports, and any future ingestion path route through the new store.
- No newly imported candle set depends on `csv_data` or `staged_csv_data` to become queryable.
- Download and export behavior remains explicit: if legacy CSV download is preserved, it is generated from the new store or retained only behind a documented temporary compatibility path.
- The mandatory step completion protocol passes.

#### 1B.4 Backfill existing datasets and validate runtime cutover
- [x] Migrate all existing backtest datasets, update the runtime read path, and validate backtests and telemetry against the new source.
Acceptance Criteria
- Existing datasets in the catalog are visible, queryable, and runnable after cutover.
- Representative backtest reruns produce materially equivalent results once the same fees, slippage, and timeframe policy are applied.
- The old parser or cache path is no longer on the execution critical path.
- The mandatory step completion protocol passes.

#### 1B.5 Retire or quarantine legacy storage
- [x] Move legacy CSV blob fields to a clearly temporary compatibility state, then plan their removal once replay, download, and audit needs are fully covered.
Acceptance Criteria
- Legacy columns are no longer treated as authoritative.
- The repo contains a documented removal sequence and rollback plan before destructive cleanup begins.
- Canonical docs and contradiction tracking are updated if runtime ownership changes.
- The mandatory step completion protocol passes.

### 1C. Backend Optimization And Async Communications

#### 1C.1 Profile slow backend endpoints and long-running workflows
- [x] Capture flame graphs or structured timing for backtest list, backtest detail, telemetry reconstruction, dataset listing, import progress, and execution startup.
Acceptance Criteria
- The top backend bottlenecks are ranked by latency, memory, lock contention, serialization cost, or over-fetching.
- At least one representative slow backtest page load is decomposed into backend time, network time, and frontend render time.
- The profiling output is attached to this plan or linked from the implementation record.
- The mandatory step completion protocol passes.
Implementation record
- Backend profiling report: `AlgotradingBot/build/reports/backend-workflow-profile/report.md`
- Frontend page profile: `frontend/build/reports/backtest-page-profile/report.md`

#### 1C.2 Split heavy command and query paths more aggressively
- [x] Refactor remaining synchronous or oversized endpoints into explicit command submission plus asynchronous progress plus query retrieval patterns.
Acceptance Criteria
- Long-running actions return immediately with a command or job reference instead of blocking until work completes.
- The backend exposes lightweight summary reads separately from heavy telemetry or export reads.
- Transactional state changes, async execution, and DTO mapping stay in distinct services.
- The mandatory step completion protocol passes.

#### 1C.3 Make UI-facing communication strictly asynchronous for heavy workflows
- [x] Standardize heavy API behavior so the UI never waits on synchronous backtest execution, dataset import processing, large export generation, or active algorithm state derivation.
Acceptance Criteria
- Heavy workflows use one of the approved async patterns: `202 Accepted + job id`, WebSocket event stream, polling fallback, or background export retrieval.
- The UI can show optimistic command acceptance immediately and then follow progress asynchronously.
- There is no route where a large backtest or import request blocks the main workstation interaction loop.
- The mandatory step completion protocol passes.

#### 1C.4 Slim high-churn DTOs and split oversized backtest details
- [x] Rework DTO contracts so summary views, chart telemetry, trades, comparison payloads, and export payloads can be loaded independently.
Acceptance Criteria
- The history page does not fetch chart-heavy payloads just to display list items.
- The backtest detail workspace can lazy-load heavy panes or symbol-specific telemetry on demand.
- Frontend contract generation remains aligned through `contracts/openapi.json` and `frontend/src/generated/openapi.d.ts`.
- The mandatory step completion protocol passes.

#### 1C.5 Add async monitoring, retry, and failure visibility
- [x] Harden async execution with queue visibility, retry boundaries, timeout handling, and operator-facing failure explanations.
Acceptance Criteria
- Backtest and import jobs expose queued, running, retry, failed, and completed states consistently.
- Failure messages are user-legible and stored durably enough for audit and troubleshooting.
- WebSocket push and polling fallback behavior remain consistent and explicitly visible.
- The mandatory step completion protocol passes.

## Phase 2: Frontend Performance And UI Or UX Redesign

Goal: keep the current workstation shell, remove the remaining dense workflow pain, fix the slow backtest experience, and replace the global execution switch with tab-owned contexts.

### 2A. UI Or UX Research And Simplification

#### 2A.1 Audit the current workstation experience
- [x] Review the current route surfaces, especially `BacktestPage`, `BacktestResults`, `PaperTradingPage`, `Header`, `Sidebar`, and the shared workstation primitives.
Acceptance Criteria
- A route-by-route responsibility map exists showing what belongs in Dashboard, Backtest, Paper, Strategies, Market Data, Risk, Settings, and the proposed execution workspace.
- The audit identifies which current pain points come from information architecture, payload size, component render cost, or visual density.
- The completed redesign recorded in `PLAN.md` is treated as the baseline, not as something to undo.
- The mandatory step completion protocol passes.
Implementation record
- Workstation audit: `docs/WORKSTATION_EXPERIENCE_AUDIT.md`

#### 2A.2 Define the new execution information architecture
- [x] Design an `Execution Workspace` that introduces dedicated `Forward Testing`, `Paper`, and `Live` tabs or child routes while preserving the current shell and safe defaults.
Acceptance Criteria
- The IA clearly separates research, forward testing, paper execution, and live monitoring or live execution capability.
- A backward-compatible navigation approach is defined, such as redirecting `/paper` into the new execution workspace without breaking the SPA.
- The new structure removes the "wall of text" feeling by giving each tab one dominant job and one dominant layout.
- The mandatory step completion protocol passes.
Implementation record
- Execution-workspace IA: `docs/EXECUTION_WORKSPACE_INFORMATION_ARCHITECTURE.md`

#### 2A.3 Produce wireframes and state diagrams for the new tabs
- [x] Create detailed desktop and mobile wireframes for `Forward Testing`, `Paper`, and `Live`, plus route-state diagrams for selection, drill-down, and failure modes.
Acceptance Criteria
- Each tab documents primary panels, secondary panels, chart behavior, log views, and danger-zone behavior.
- Selection state, filters, and active algorithm drill-down are defined before implementation starts.
- The design keeps environment, risk, connection, and capability cues visible without duplicating shell chrome.
- The mandatory step completion protocol passes.
Implementation record
- Execution-workspace wireframes and state diagrams: `docs/EXECUTION_WORKSPACE_WIREFRAMES_AND_STATE_DIAGRAMS.md`

#### 2A.4 Extend the design system only where the new workflow needs it
- [x] Add or refine shared UI primitives for strategy status rails, execution cards, investigation logs, live metric strips, and active-algo detail drawers.
Acceptance Criteria
- New components live in shared workstation or feature-owned modules, not in oversized route files.
- Accessibility, keyboard behavior, loading states, and empty states are specified for every new primitive.
- The visual language remains consistent with the current workstation theme rather than becoming a disconnected mini-app.
- The mandatory step completion protocol passes.
Implementation record
- Shared primitive spec: `docs/EXECUTION_WORKSPACE_SHARED_PRIMITIVES.md`
- Shared components: `frontend/src/components/workspace/ExecutionWorkspacePrimitives.tsx`
- Shared component tests: `frontend/src/components/workspace/ExecutionWorkspacePrimitives.test.tsx`

### 2B. Frontend Performance Fixes

#### 2B.1 Profile the slow backtest page end to end
- [x] Capture React Profiler traces, network traces, chart timing, and large-payload analysis for the current backtest route.
Acceptance Criteria
- The slowest user flows are identified with real numbers, including first meaningful paint, detail load time, chart mount time, and trade-table interaction time.
- The trace explicitly shows whether the bottleneck is backend payload size, client-side transformation cost, re-renders, or chart library work.
- The mandatory step completion protocol passes.
Implementation record
- Backtest page profile report: `frontend/build/reports/backtest-page-profile/report.md`
- Companion backend workflow report: `AlgotradingBot/build/reports/backend-workflow-profile/report.md`

#### 2B.2 Split heavy backtest payloads and lazy-load expensive panels
- [x] Refactor the route so summary metrics, chart workspace, trades, analytics, and export data are loaded independently and only when needed.
Acceptance Criteria
- The initial run-selection experience no longer waits for every chart and analytics component to finish work.
- Heavy symbol telemetry or comparison views load lazily and show intentional skeleton or pending states.
- `BacktestPage` and `BacktestResults` become orchestration-first surfaces with expensive logic pushed into smaller feature modules.
- The mandatory step completion protocol passes.
Implementation record
- Lazy section controller: `frontend/src/features/backtest/BacktestResults.tsx`
- Section modules: `frontend/src/features/backtest/BacktestOverviewPanel.tsx`, `frontend/src/features/backtest/BacktestWorkspacePanel.tsx`, `frontend/src/features/backtest/BacktestTradeReviewPanel.tsx`, `frontend/src/features/backtest/BacktestAnalyticsPanel.tsx`

#### 2B.3 Reduce render churn and large in-browser transformations
- [x] Move expensive derived calculations out of hot render paths and introduce virtualization or progressive rendering where the dataset size justifies it.
Acceptance Criteria
- Large trade tables and investigation logs are virtualized or windowed when needed.
- Expensive calculations such as workspace trade building, chart marker derivation, and distribution generation are memoized or moved server-side based on profiling evidence.
- Search and filter interactions remain responsive under large datasets.
- The mandatory step completion protocol passes.
Implementation record
- Workspace derivation and marker lookup optimization: `frontend/src/features/backtest/backtestWorkspace.ts`
- Memoized workspace selection pipeline: `frontend/src/features/backtest/BacktestWorkspacePanel.tsx`
- Virtualized trade review table with jsdom-safe fallback: `frontend/src/features/backtest/BacktestVirtualizedTradeTable.tsx`, `frontend/src/features/backtest/BacktestTradeReviewPanel.tsx`
- Updated repeatable profile harness: `frontend/src/features/backtest/BacktestPerformanceProfile.test.tsx`

#### 2B.4 Harden chart performance for large telemetry windows
- [x] Optimize the primary chart workspace and supporting analytics for long time ranges, dense markers, and multi-symbol views.
Acceptance Criteria
- The chart remains responsive while switching symbols, overlays, or marker filters on representative large runs.
- Marker density is handled without freezing the browser.
- Mobile and tablet behavior stay usable without hiding essential evidence.
- The mandatory step completion protocol passes.
Implementation record
- Dense marker condensation with selected-marker and forced-evidence preservation: `frontend/src/features/backtest/backtestWorkspace.ts`
- Workspace chart normalization now scopes work to the active symbol and visible overlays, with O(1) focus lookups for crosshair inspection: `frontend/src/features/backtest/BacktestWorkspaceChart.tsx`
- The workspace panel now feeds a condensed marker set to the chart while preserving the full review dataset for linked inspection and mobile/tablet evidence flows: `frontend/src/features/backtest/BacktestWorkspacePanel.tsx`
- Chart-density regression coverage: `frontend/src/features/backtest/backtestWorkspace.test.ts`

#### 2B.5 Add frontend observability and regression budgets
- [x] Introduce measurable performance budgets for route load time, chart mount time, and large-query render time.
Acceptance Criteria
- Performance budgets are documented and enforced through repeatable profiling or tests where practical.
- The team can tell when a change regresses the backtest or execution workspace before users feel it.
- Residual risks or known slow cases are documented honestly.
- The mandatory step completion protocol passes.
Implementation record
- Shared repeatable frontend budget definitions for route load, chart mount, and large-query render paths: `frontend/src/features/backtest/backtestPerformanceBudget.ts`
- Backtest profile harness now enforces budgets while still publishing the markdown report and diagnostic timings: `frontend/src/features/backtest/BacktestPerformanceProfile.test.tsx`
- Verification guide now documents the enforced profiling workflow and budget ownership: `docs/guides/TESTING_AND_CONTRACTS.md`

### 2C. Decoupled Execution Environments

#### 2C.1 Remove the global Live or Paper switch and replace it with explicit execution context ownership
- [x] Refactor the frontend and backend contract model so execution context is owned by the relevant tab or route, not by a global mode toggle that affects unrelated workflows.
Acceptance Criteria
- Research routes such as Backtest and Market Data are no longer coupled to a global live or paper switch.
- The new model distinguishes at least `research`, `forward-test`, `paper`, and `live` behavior explicitly, even if some contexts remain monitor-only at first.
- Unsupported live actions fail closed with explicit capability messaging.
- The mandatory step completion protocol passes.
Implementation record
- Shared frontend execution-context model with route ownership and environment mapping: `frontend/src/features/execution/executionContext.ts`
- Research and paper routes now pin transport status and operator messaging to route-owned execution contexts instead of the global operational toggle: `frontend/src/features/backtest/BacktestPage.tsx`, `frontend/src/features/marketData/MarketDataPage.tsx`, `frontend/src/features/paper/PaperTradingPage.tsx`, `frontend/src/components/layout/Header.tsx`
- API and Axios helpers now support `X-Execution-Context` while still deriving the conservative backend environment header: `frontend/src/services/api.ts`, `frontend/src/services/axiosClient.ts`
- Backend request resolution now accepts execution-context query or header input and maps it fail-closed onto `test` or `live`: `AlgotradingBot/src/main/java/com/algotrader/bot/service/EnvironmentRequestResolver.java`, `AlgotradingBot/src/main/java/com/algotrader/bot/controller/AccountController.java`, `AlgotradingBot/src/main/java/com/algotrader/bot/controller/RiskController.java`
- Contract and regression coverage: `contracts/openapi.json`, `frontend/src/generated/openapi.d.ts`, `frontend/src/features/execution/executionContext.test.ts`, `AlgotradingBot/src/test/java/com/algotrader/bot/service/EnvironmentRequestResolverTest.java`

#### 2C.2 Implement the Forward Testing tab
- [x] Build a dedicated `Forward Testing` workspace focused on strategy observation, signal investigation, chart review, and operator notes.
Required content
- Strategy selection and configuration context.
- Live or near-live charts with signal markers.
- Deep-dive signal and indicator detail.
- Investigation logs, annotations, and operator follow-up notes.
Acceptance Criteria
- Operators can select a strategy or strategy version and inspect its current and recent signal behavior without placing live orders.
- The workspace shows chart evidence, signal metadata, and investigation history in one place.
- Forward testing remains paper-safe and auditable by default.
- The mandatory step completion protocol passes.
Implementation record
- Added the dedicated `/forward-testing` route and shell navigation entry with route-owned `forward-test` context and explicit fail-closed messaging in `frontend/src/App.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/components/layout/Header.tsx`, and `frontend/src/features/execution/executionContext.ts`.
- Built the forward-testing workspace with strategy selection, observed performance metrics, a signal timeline chart, investigation history, active-algorithm detail, and local workstation operator notes in `frontend/src/features/forwardTesting/ForwardTestingPage.tsx`, `frontend/src/features/forwardTesting/ForwardSignalTimelineChart.tsx`, `frontend/src/features/forwardTesting/forwardTestingApi.ts`, and `frontend/src/features/forwardTesting/forwardTestingNotes.ts`.
- Added route-scoped test-safe query overrides for strategies, trades, and paper-state reads so the workspace does not inherit unrelated operational mode changes in `frontend/src/features/strategies/strategiesApi.ts`, `frontend/src/features/trades/tradesApi.ts`, and `frontend/src/features/paperApi.ts`.
- Regression coverage now includes route wiring, sidebar navigation, and the forward-testing workspace note flow in `frontend/src/App.test.tsx`, `frontend/src/components/layout/Sidebar.test.tsx`, and `frontend/src/features/forwardTesting/ForwardTestingPage.test.tsx`.

#### 2C.3 Implement the Paper tab
- [x] Build a dedicated `Paper` tab that supports strategy selection per exchange, custom parameters, active-state review, and paper performance tracking.
Acceptance Criteria
- Operators can assign paper strategies per exchange profile without affecting unrelated routes.
- Active paper algorithms display current status, performance, positions, incidents, and live or near-live data.
- Selecting an active paper algorithm opens a chart showing the exact signals and order events that produced current state and profitability.
- The mandatory step completion protocol passes.
Implementation record
- Reworked the paper route into an exchange-scoped workspace that layers assignment, active-algorithm review, chart evidence, and order-event context on top of the existing simulated order desk in `frontend/src/features/paper/PaperTradingPage.tsx`.
- Added explicit workstation-local paper assignment persistence for exchange-profile-to-strategy mapping in `frontend/src/features/paper/paperWorkspaceAssignments.ts` so operators can scope paper monitoring per saved exchange connection without pretending the backend already exposes a durable assignment API.
- Reused shared execution primitives plus the signal timeline chart to keep active paper algorithm posture, performance, order events, config lineage, and audit/incident context in one place, while keeping order entry and fill/cancel flows explicitly simulated.
- Expanded regression coverage for the paper workspace assignment flow and order submission path in `frontend/src/features/paper/PaperTradingPage.test.tsx`.

#### 2C.4 Implement the Live tab with capability gating
- [x] Build a dedicated `Live` tab for explicit live context, keeping routing fail-closed until approved capabilities exist.
Acceptance Criteria
- The tab distinguishes clearly between monitor-only live state and any future approved live execution capability.
- Strategy selection per exchange and custom parameters are visible only when the backend reports the capability as supported.
- If live execution is not yet approved, the tab still provides live monitoring, active-state review, performance, and signal charts without allowing orders.
- The mandatory step completion protocol passes.
Implementation record
- Added the dedicated `/live` route, sidebar entry, header metadata, and route-owned `live` context resolution so the workstation exposes explicit live monitoring without depending on the global operations-mode toggle in `frontend/src/App.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/components/layout/Header.tsx`, and `frontend/src/features/execution/executionContext.ts`.
- Built a capability-gated live workspace that reuses shared execution primitives for posture rails, monitored strategy review, chart evidence, config lineage, and audit context while keeping strategy assignment, parameter edits, and order actions fail-closed until a backend capability is reported in `frontend/src/features/live/LiveTradingPage.tsx`.
- Extended account RTK Query helpers with route-scoped execution-context overrides so the live route can request live-context balance, performance, positions, and recent-trade reads without mutating unrelated pages or relying on ad hoc headers in `frontend/src/features/account/accountApi.ts`.
- Added regression coverage for live route wiring, shell navigation, header route context, and the monitor-only live workspace in `frontend/src/App.test.tsx`, `frontend/src/components/layout/Sidebar.test.tsx`, `frontend/src/components/layout/Header.test.tsx`, and `frontend/src/features/live/LiveTradingPage.test.tsx`.

#### 2C.5 Build active-algorithm signal-explainer views
- [x] Add a shared active-algorithm detail surface used by Forward Testing, Paper, and Live tabs.
Required evidence on selection
- Entry and exit markers.
- Signal or decision reason.
- Current risk and PnL stats.
- Position state and exposure.
- Recent incidents or overrides.
Acceptance Criteria
- The operator can move from high-level algorithm list to exact trade-trigger evidence in one or two clicks.
- Signal charts match recorded orders and current profitability state without hidden client-side recomputation of trading logic.
- The view remains responsive on desktop and mobile.
- The mandatory step completion protocol passes.
Implementation record
- Added `frontend/src/components/workspace/ActiveAlgorithmExplainabilityPanel.tsx` as a shared explainability surface on top of the existing sticky detail drawer so Forward Testing, Paper, and Live all expose the same evidence model for entry and exit markers, signal reason, current risk and PnL, position exposure, and recent incidents or overrides.
- Refactored `frontend/src/features/forwardTesting/ForwardTestingPage.tsx`, `frontend/src/features/paper/PaperTradingPage.tsx`, and `frontend/src/features/live/LiveTradingPage.tsx` to use that shared component while preserving route-specific supplemental sections such as config lineage, paper order events, and live capability posture.
- Added regression coverage for the shared explainability component plus the three execution routes in `frontend/src/components/workspace/ActiveAlgorithmExplainabilityPanel.test.tsx`, `frontend/src/features/forwardTesting/ForwardTestingPage.test.tsx`, `frontend/src/features/paper/PaperTradingPage.test.tsx`, and `frontend/src/features/live/LiveTradingPage.test.tsx`.

#### 2C.6 Update navigation, contracts, tests, and docs for the new execution model
- [x] Finish the route wiring, API adaptation, tests, and canonical documentation updates required by the execution workspace split.
Acceptance Criteria
- Navigation, protected routes, deep links, and shared shell context all work with the new tabs.
- Backend and frontend contracts remain aligned and generated artifacts are up to date.
- Docs explain the removal of the global switch and the ownership of each execution context.
- The mandatory step completion protocol passes.
Implementation record
- Expanded route-ownership regression coverage in `frontend/src/features/execution/executionContext.test.ts` so deep links for `/forward-testing`, `/paper`, `/strategies`, `/trades`, and `/live` keep resolving to the intended execution context instead of relying on incidental shell state.
- Hardened account RTK Query coverage in `frontend/src/features/account/accountApi.test.tsx` by exercising `withExecutionContext` overrides for balance, performance, open positions, and recent trades, proving that live-context reads send explicit `X-Execution-Context` and derived `X-Environment` headers without mutating the global operations mode.
- Updated `README.md` so the canonical repo entry point now names Forward Testing and Live Monitoring explicitly and documents that route-owned execution contexts replaced the old global execution switch.

## Phase 3: Quantitative Research And Strategy Development

Goal: audit the current catalog honestly, define a disciplined small-account strategy roadmap, and implement six new research strategies with explicit validation gates.

### 3A. Current Strategy Audit

#### 3A.1 Define the audit protocol before judging any strategy
- [x] Freeze an audit methodology covering datasets, costs, holdout rules, walk-forward windows, minimum trade counts, and rejection criteria.
Acceptance Criteria
- Every strategy is evaluated with explicit fees, slippage, timeframe handling, and look-ahead-safe execution assumptions.
- The protocol defines what qualifies as `reject`, `research-only`, `watchlist`, or `paper-monitor candidate`.
- The protocol states clearly that "not profitable enough" is a valid outcome.
- The mandatory step completion protocol passes.
Implementation record
- Added `docs/STRATEGY_AUDIT_PROTOCOL.md` as the frozen methodology for current-catalog reruns, explicitly locking the audit record fields, `10` bps fee plus `3` bps slippage baseline, full-sample plus frozen-holdout plus anchored walk-forward review bundle, minimum-sample handling, and the disposition labels `reject`, `research-only`, `watchlist`, and `paper-monitor candidate`.
- Aligned canonical docs with that methodology in `README.md`, `PROJECT_STATUS.md`, and `TRADING_GUARDRAILS.md` so later strategy reruns and paper-follow-up decisions reference one durable protocol instead of ad hoc criteria.

#### 3A.2 Build a representative audit dataset pack
- [x] Assemble reproducible datasets for liquid crypto and small-account-friendly equity or ETF research with provenance, timeframe coverage, and holdout windows.
Acceptance Criteria
- Each audit dataset has checksum, schema identity, timeframe coverage, venue metadata, and realistic date windows.
- The dataset pack covers at least one crypto-major set and one equity or ETF set suitable for small-account research.
- Known limits such as pattern-day-trading restrictions, exchange minimums, and short-proxy constraints are documented in the audit notes rather than ignored.
- The mandatory step completion protocol passes.
Implementation record
- Added `docs/STRATEGY_AUDIT_DATASET_PACK.md` as the frozen pack definition, anchoring the existing crypto catalog dataset `#12` and documenting one checked-in ETF audit file plus manifest with checksum, schema identity, venue notes, timeframe coverage, and the shared holdout split.
- Added `scripts/build-strategy-audit-equity-dataset.ps1` and generated `docs/audit-datasets/us-etf-daily-small-account-pack-2024-03-12-to-2026-03-12.csv` with companion manifest JSON so the small-account equity or ETF side is reproducible from repo-owned automation instead of a one-off manual download.

#### 3A.3 Rerun the current strategy catalog under the frozen protocol
- [x] Rerun all current built-in strategies and capture full-sample, holdout, and walk-forward results.
Acceptance Criteria
- Every current strategy receives a reproducible scorecard with return, drawdown, Sharpe, profit factor, win rate, trade count, exposure time, and fee drag.
- Any strategy with sparse evidence, poor out-of-sample behavior, or unrealistic sensitivity is clearly downgraded.
- No strategy is labeled profitable unless the evidence actually supports that claim.
- The mandatory step completion protocol passes.
Implementation record
- Added `AlgotradingBot/src/test/java/com/algotrader/bot/analysis/StrategyCatalogAuditRunner.java` and the Gradle task `.\gradlew.bat strategyCatalogAudit --no-daemon`, which boot the backend in non-web mode, query dataset `#12` from the current market-data store, rerun all nine built-in strategies against the frozen full-sample and holdout windows, and emit a reproducible markdown report under `AlgotradingBot/build/reports/strategy-catalog-audit/report.md`.
- Fixed a sparse-sample bug in `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestMetrics.java` so one-trade windows no longer throw during p-value calculation.
- Published the checked-in scorecard snapshot in `docs/STRATEGY_CATALOG_AUDIT_REPORT.md` and linked it from `README.md` and `PROJECT_STATUS.md` so the audit output is durable outside the local database.

#### 3A.4 Publish the audit outcome and catalog actions
- [x] Decide which current strategies stay baseline-only, which need hardening, which should be archived, and which deserve paper shadow monitoring.
Acceptance Criteria
- The repo has an explicit disposition for every current strategy.
- Weak or misleading strategies are not left presented as equally ready candidates.
- Documentation and operator-facing labels match the verified evidence.
- The mandatory step completion protocol passes.
Implementation record
- Published explicit catalog dispositions in `docs/STRATEGY_CATALOG_AUDIT_REPORT.md`, promoted that summary into `README.md` and `PROJECT_STATUS.md`, and aligned the repo narrative around one March 27, 2026 frozen-audit outcome.
- Added audited disposition metadata to `frontend/src/features/strategies/strategyProfiles.ts` and surfaced it in `frontend/src/features/strategies/StrategiesPage.tsx` plus `frontend/src/features/backtest/BacktestConfigModal.tsx` so operators now see `baseline only`, `research only`, `archive candidate`, or `paper-monitor candidate` labels directly in the strategy desk and backtest launcher.

### 3B. New Edge Creation For Smaller Accounts

#### 3B.1 Define the small-account execution and market constraints
- [x] Translate small-account realities into explicit research rules for notional size, liquidity, turnover, risk, and bearish behavior.
Acceptance Criteria
- The plan documents minimum-notional, lot-size, fractionality, session, and short-proxy assumptions by asset class.
- High-turnover or low-latency strategies are explicitly excluded from the candidate set.
- Bearish behavior defaults to `sell to cash` or approved proxy behavior unless direct shorting is explicitly supported in research or paper mode.
- The mandatory step completion protocol passes.
Implementation record
- Added `docs/SMALL_ACCOUNT_EXECUTION_CONSTRAINTS.md` as the durable rulebook for the small-account roadmap, freezing the baseline `EUR 150` to `EUR 1,000` posture, approved asset classes, minimum-order handling, liquidity filters, session rules, turnover exclusions, risk limits, and bearish-behavior defaults before later strategy specs are written.
- Updated `README.md`, `PROJECT_STATUS.md`, and `PRODUCT.md` so the canonical docs now point at those constraints and keep the product narrative aligned with the new small-account research guardrails.

#### 3B.2 Define a reusable strategy-spec template
- [x] Standardize how every new strategy is described before code exists.
Template fields
- Hypothesis.
- Market regime.
- Universe.
- Timeframe.
- Signal stack.
- Long behavior.
- Bearish behavior.
- Risk model.
- Exit model.
- Validation plan.
Acceptance Criteria
- Every later strategy in this phase uses the same template.
- The template forces signal logic, invalidation logic, and cost assumptions to be explicit.
- Overfitting risk and minimum evidence thresholds are documented for every strategy.
- The mandatory step completion protocol passes.
Implementation record
- Added `docs/STRATEGY_SPEC_TEMPLATE.md` as the mandatory pre-code strategy template for the rest of Phase 3, covering identity, hypothesis, market regime, universe, timeframe, signal stack, long behavior, bearish behavior, risk model, exit model, telemetry, validation plan, overfitting review, and minimum evidence threshold.
- Updated `README.md`, `PROJECT_STATUS.md`, and `PRODUCT.md` so the canonical docs now point to that template and make the pre-implementation spec requirement part of the repo's durable strategy workflow.

#### 3B.3 Build a shared confirmation and risk feature library
- [x] Implement or harden the reusable indicator and confirmation components needed by the new strategy set.
Required building blocks
- Trend filters.
- VWAP or session anchors where applicable.
- Volatility filters.
- Volume confirmation.
- Regime classifiers.
- ATR or structural stop logic.
- Session or daily cutoff handling.
Acceptance Criteria
- Shared logic is implemented once and reused across strategies rather than copied into each class.
- Feature calculations are test-covered and safe against look-ahead bias.
- Strategy telemetry can expose the feature values later for chart review.
- The mandatory step completion protocol passes.
Implementation record
- Added `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/StrategyFeatureLibrary.java`, centralizing reusable trend-filter, volume-confirmation, volatility-filter, regime-classification, ATR or structural-stop, and session-anchor calculations behind one backend seam for later small-account strategies.
- Refactored `BollingerBandsBacktestStrategy`, `TrendPullbackContinuationBacktestStrategy`, `RegimeFilteredMeanReversionBacktestStrategy`, `VolatilityManagedDonchianBreakoutBacktestStrategy`, and `BacktestTelemetryService` to reuse that shared library instead of keeping duplicate regime, trend, volatility, and stop logic in each class, while telemetry now also exposes managed-allocation series for the Donchian path.
- Added `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/strategy/StrategyFeatureLibraryTest.java` and expanded `AlgotradingBot/src/test/java/com/algotrader/bot/service/BacktestTelemetryServiceTest.java` so the new feature seam is covered for look-ahead-safe trend checks, volume confirmation, volatility state, regime classification, protective stops, session anchors, and operator-facing telemetry overlays.

### 3C. Strategy Implementation

Each strategy below must be treated as a research hypothesis, not a profitability claim.

#### 3C.1 Implement Day Trading Strategy 1: Opening Range VWAP Breakout
- [x] Build a same-day breakout strategy that requires opening-range expansion plus VWAP alignment plus volume confirmation plus regime sanity checks.
Core idea
- Trade breakouts only when the session bias, VWAP, and volume all agree.
- Exit on failed breakout, ATR stop, VWAP loss, or mandatory end-of-session flattening.
Acceptance Criteria
- Entries require at least the documented breakout, VWAP, and volume confirmations.
- The strategy exits to cash by the configured session cutoff.
- Tests cover breakout validity, false-breakout rejection, stop logic, and session-close flattening.
- The mandatory step completion protocol passes.
Implementation record
- Added the pre-code strategy spec in `docs/strategy-specs/OPENING_RANGE_VWAP_BREAKOUT.md`, using the Phase `3B.2` template to freeze the hypothesis, universe, same-day flatten rule, bearish-to-cash behavior, explainability requirements, and validation plan before code was promoted into the catalog.
- Implemented `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/OpeningRangeVwapBreakoutBacktestStrategy.java`, which reuses `StrategyFeatureLibrary` for opening-range or session anchors, VWAP alignment, volume confirmation, regime sanity, ATR-cap filtering, capped volatility-managed sizing, and mandatory session-cutoff exits.
- Wired the new strategy through `BacktestAlgorithmType`, `BacktestTelemetryService`, `StrategyManagementService`, `frontend/src/features/strategies/strategyProfiles.ts`, and the registry or simulation tests so the same-day breakout path is available end to end with telemetry overlays and operator-facing metadata.
- Added `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/strategy/OpeningRangeVwapBreakoutBacktestStrategyTest.java` plus expanded registry and telemetry coverage to prove breakout validity, false-breakout rejection, protective-stop exits, session-cutoff flattening, and chart-review indicators.

#### 3C.2 Implement Day Trading Strategy 2: VWAP Pullback Continuation
- [x] Build a same-day trend-continuation strategy that requires higher-timeframe bias plus pullback-to-VWAP or EMA plus momentum re-acceleration confirmation.
Core idea
- Trade with the dominant intraday trend after controlled pullbacks, not after late chase entries.
- Use confirmation from RSI reset or fast EMA reclaim or both.
Acceptance Criteria
- The strategy refuses entries when the higher-timeframe trend filter disagrees.
- Pullback and continuation confirmation are both required before entry.
- Tests cover valid pullback entries, invalid chase entries, and same-day exit rules.
- The mandatory step completion protocol passes.
Implementation record
- Added the pre-code strategy spec in `docs/strategy-specs/VWAP_PULLBACK_CONTINUATION.md`, freezing the higher-timeframe bias requirement, VWAP or EMA support pullback hypothesis, same-day flatten rule, bearish-to-cash posture, and telemetry review expectations before the implementation entered the catalog.
- Implemented `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/VwapPullbackContinuationBacktestStrategy.java`, which reuses `StrategyFeatureLibrary` for EMA trend bias, session VWAP support, RSI reset or fast-EMA reclaim continuation confirmation, ATR-capped risk control, and mandatory end-of-session exits.
- Wired the strategy through `BacktestAlgorithmType`, `BacktestTelemetryService`, `StrategyManagementService`, `frontend/src/features/strategies/strategyProfiles.ts`, and the registry or simulation seams so the intraday pullback path is available end to end with indicator overlays and research-safe preset defaults.
- Added `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/strategy/VwapPullbackContinuationBacktestStrategyTest.java` plus expanded registry and telemetry coverage to prove valid pullback entries, higher-timeframe disagreement rejection, anti-chase enforcement, session-cutoff flattening, and chart-review indicators.

#### 3C.3 Implement Day Trading Strategy 3: Exhaustion Reversal Fade
- [x] Build a same-day reversal strategy that requires volatility expansion plus price extension plus reversal confirmation and explicit range or exhaustion filters.
Core idea
- Fade only true exhaustion conditions, not normal trend continuation.
- Require reversal candle structure plus extreme oscillator condition plus range filter or climax-volume confirmation.
Acceptance Criteria
- The strategy does not activate in strong trend conditions unless the documented exhaustion criteria are met.
- Profit-taking, time-stop, and hard-stop behavior are all explicit and tested.
- The implementation stays research-only until the audit proves it survives fee drag.
- The mandatory step completion protocol passes.
Implementation record
- Added the pre-code strategy spec in `docs/strategy-specs/EXHAUSTION_REVERSAL_FADE.md`, freezing the downside-extension hypothesis, range-versus-climactic override logic, same-day flatten rule, research-only posture, and the explicit target, time-stop, and hard-stop exit model before code entered the catalog.
- Implemented `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/ExhaustionReversalFadeBacktestStrategy.java`, which reuses `StrategyFeatureLibrary` for trend, regime, volume, volatility, and session anchors while combining Bollinger-band or VWAP stretch, volatility expansion, oversold RSI, and bullish reversal confirmation into a long-only exhaustion fade.
- Wired the strategy through `BacktestAlgorithmType`, `BacktestTelemetryService`, `StrategyManagementService`, `frontend/src/features/strategies/strategyProfiles.ts`, and the registry or simulation seams so the research-only reversal path is available end to end with explainability overlays and paper-safe preset defaults.
- Added `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/strategy/ExhaustionReversalFadeBacktestStrategyTest.java` plus expanded registry and telemetry coverage to prove range-bound entries, strong-trend blocking without the climactic override, override activation, profit-target exits, time-stop exits, and hard-stop exits.

#### 3C.4 Implement Intraday Strategy 1: Multi-Timeframe EMA or ADX Pullback
- [x] Build a multi-hour trend strategy using higher-timeframe trend alignment plus lower-timeframe pullback plus ADX or volatility confirmation.
Core idea
- Favor cleaner continuation setups in liquid instruments where turnover stays moderate.
- Use `15m` or `1h` triggers inside a slower `1h` or `4h` regime.
Acceptance Criteria
- Higher-timeframe trend alignment, pullback definition, and continuation trigger are all separate test-covered components.
- Stops and sizing respect the shared risk layer.
- Telemetry exposes the trend and pullback context for chart review.
- The mandatory step completion protocol passes.
Implementation record
- Added the pre-code strategy spec in `docs/strategy-specs/MULTI_TIMEFRAME_EMA_ADX_PULLBACK.md`, documenting the proxy higher-timeframe EMA stack, pullback zone, continuation trigger, and research-only validation posture before implementation.
- Implemented `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/MultiTimeframeEmaAdxPullbackBacktestStrategy.java`, which reuses the shared trend, volatility, and risk primitives to require separate higher-timeframe alignment, pullback definition, and continuation confirmation.
- Wired the strategy through `BacktestAlgorithmType`, `BacktestTelemetryService`, `StrategyManagementService`, `frontend/src/features/strategies/strategyProfiles.ts`, and the registry or simulation seams so the multi-hour continuation path is available end to end with telemetry overlays and seed defaults.
- Added `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/strategy/MultiTimeframeEmaAdxPullbackBacktestStrategyTest.java` plus expanded registry and telemetry coverage to prove trend alignment, pullback detection, continuation trigger confirmation, and support-failure exits as separate test-covered behaviors.

#### 3C.5 Implement Intraday Strategy 2: Squeeze Breakout Regime Confirmation
- [x] Build a volatility-contraction breakout strategy using squeeze detection plus momentum confirmation plus higher-timeframe regime filter.
Core idea
- Wait for compression, then trade expansion only when trend or momentum confirmation says the breakout is likely meaningful.
- Exit on failed expansion, volatility stop, or regime break.
Acceptance Criteria
- The strategy documents and tests the squeeze condition, breakout trigger, and confirmation stack.
- Sideways false signals are filtered more aggressively than a plain breakout system.
- Performance reporting includes breakout failure rate and average hold time.
- The mandatory step completion protocol passes.
Implementation notes
- Added the pre-code strategy spec in `docs/strategy-specs/SQUEEZE_BREAKOUT_REGIME_CONFIRMATION.md`, freezing the squeeze definition, breakout trigger, confirmation stack, bearish posture, and research-only validation plan before implementation.
- Implemented `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/SqueezeBreakoutRegimeConfirmationBacktestStrategy.java`, which combines Bollinger-style compression, twenty-bar breakout detection, momentum confirmation, higher-timeframe regime alignment, and failed-expansion or ATR-based exits.
- Extended `BacktestResultQueryService`, `BacktestDetailsResponse`, `BacktestSummaryResponse`, and the frontend backtest contract or overview surfaces so this strategy now reports breakout failure rate and average hold time as explicit operator-facing metrics.
- Wired the strategy through `BacktestAlgorithmType`, `BacktestTelemetryService`, `StrategyManagementService`, `frontend/src/features/strategies/strategyProfiles.ts`, and the registry or simulation seams so the compression-breakout path is available end to end with telemetry overlays and paper-safe seed defaults.
- Added `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/strategy/SqueezeBreakoutRegimeConfirmationBacktestStrategyTest.java` plus expanded query, telemetry, registry, and simulation coverage to verify squeeze gating, breakout confirmation, false-signal filtering, failed-expansion exits, and strategy-specific reporting.

#### 3C.6 Implement Intraday Strategy 3: Relative Strength Rotation With Intraday Entry Filter
- [ ] Build a small-universe rotation strategy that ranks leaders with absolute momentum gating, then uses an intraday timing filter for entries and exits.
Core idea
- Keep the small-account-friendly low-turnover ranking behavior, but avoid blunt daily entry timing by using a lower-timeframe confirmation layer.
- Bearish states route to cash or approved short proxy behavior rather than default direct shorts.
Acceptance Criteria
- Ranking, absolute momentum filter, entry timing filter, and fallback-to-cash logic are all explicit and test-covered.
- The strategy works on a defined small liquid universe rather than an undefined broad asset list.
- The implementation does not imply that a bearish signal always opens a direct short.
- The mandatory step completion protocol passes.

#### 3C.7 Add strategy telemetry, explainability, and operator-facing metadata
- [ ] Ensure every new strategy can expose the indicators, reason labels, and signal evidence required by the redesigned chart workspaces.
Acceptance Criteria
- Operator-facing profiles exist for all six strategies with best-use notes, risk notes, and timeframe guidance.
- Backtest and execution telemetry can show why the strategy entered, exited, or stood aside.
- Signal explanations align with later Forward Testing, Paper, and Live tab requirements.
- The mandatory step completion protocol passes.

#### 3C.8 Compare the new strategies against benchmarks and current candidates
- [ ] Run the six new strategies against the frozen audit protocol and compare them against `BUY_AND_HOLD` and the strongest current catalog paths.
Acceptance Criteria
- Each new strategy has a reproducible evidence sheet, not just a return number.
- The plan identifies which strategies are rejected, which remain research-only, and which can move to shadow paper monitoring.
- No new strategy is promoted without surviving out-of-sample and robustness checks.
- The mandatory step completion protocol passes.

## Phase 4: Future Proofing

Goal: identify the highest-value follow-on work once Phases 1 through 3 are complete and stable.

#### 4.1 Portfolio lab and capital allocation engine
- [ ] Add a follow-on roadmap item for multi-strategy portfolio simulation, capital allocation, and correlation-aware risk budgeting.
Acceptance Criteria
- The follow-on scope explains how standalone strategy evidence will roll up into portfolio-level research.
- The design includes max-allocation, correlation, and aggregate risk rules before capital allocator code exists.
- Dependencies on the Phase 1 data model and Phase 3 audit outputs are explicit.
- The mandatory step completion protocol passes.

#### 4.2 Experiment scheduler and governance automation
- [ ] Add a follow-on roadmap item for scheduled backtests, walk-forward batches, parameter sweeps, and experiment approval workflow.
Acceptance Criteria
- The follow-on scope defines experiment metadata, retention, and promotion rules.
- The design prevents silent parameter fishing by preserving reproducibility and auditability.
- Output expectations include result storage, comparison reports, and alerting hooks.
- The mandatory step completion protocol passes.

#### 4.3 Data quality and venue-constraint intelligence
- [ ] Add a follow-on roadmap item for automatic detection of bad candles, missing coverage, splits or adjustments, minimum-order violations, and venue-specific execution constraints.
Acceptance Criteria
- The follow-on scope describes anomaly detection, exchange or broker rule ingestion, and fail-closed behavior.
- The design closes the gap between theoretical signals and actually placeable orders.
- The roadmap item depends on the relational market-data architecture rather than bypassing it.
- The mandatory step completion protocol passes.

#### 4.4 Incident notifications and operator automation
- [ ] Add a follow-on roadmap item for multi-channel alerts, recurring health checks, and operator runbooks around paper and live monitoring.
Acceptance Criteria
- The follow-on scope defines which incidents require notification and which can stay informational.
- Alert routing, acknowledgement, and audit requirements are explicit.
- The design builds on the existing WebSocket and audit infrastructure instead of inventing a disconnected system.
- The mandatory step completion protocol passes.

## Final Completion Trigger

These tasks are executed only when every implementation checkbox above is complete.

#### F.1 Final regression and documentation sweep
- [ ] Run the full verification bundle one final time, update every affected canonical doc, and confirm that no contradiction remains undocumented.
Acceptance Criteria
- Backend and frontend verification pass cleanly.
- Contract artifacts, docs, and safety language match verified behavior.
- Any residual risks are documented plainly.

#### F.2 Final git commit and push
- [ ] Perform the final repository handoff by reviewing `git status`, creating the final commit, and pushing the branch.
Acceptance Criteria
- Only intentional changes are included.
- The final commit message summarizes the delivered feature set clearly.
- The remote branch contains the fully verified implementation state.

## Definition Of Done For This Plan

This feature-development program is done only when all of the following are true:

- Every checkbox above is complete.
- The relational market-data store is authoritative for future imports and backtest reads.
- The UI no longer depends on a global Live or Paper switch to express execution context.
- The backtest and execution workspaces stay responsive under representative real data loads.
- Current and new strategies have honest, reproducible evidence records.
- Safety defaults remain conservative.
- The final verification bundle passes.
- The final git commit and push are completed.
