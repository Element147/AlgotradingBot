# Master Plan

## Mission And Planning Principles
- Mission: turn this repository into a reliable local-first trading research platform with clear backend/frontend boundaries, realistic backtests, strong operator controls, and conservative paper-first execution.
- Keep `test` and `paper` as the default posture across backend behavior, frontend defaults, scripts, and docs.
- Treat every strategy as a research hypothesis. Do not market or imply profitability without reproducible evidence, realistic costs, and paper-trading follow-up.
- Prefer phased, reversible improvements over a big-bang rewrite. Each phase must leave the repo in a shippable, understandable state.
- Preserve Spring layering, DTO boundaries, `BigDecimal` handling for money/risk, and the React/Vite SPA architecture.
- Use PostgreSQL datasets first for research and reruns. Fetch additional crypto data only when existing coverage is insufficient for a clearly defined validation need.
- Do not weaken environment separation, risk controls, auditability, circuit breakers, or operator override paths.
- When docs and code disagree, verify reality in code/runtime first, then update docs and record the contradiction in `PROJECT_STATUS.md`.
- Optimize for durable structure, honest reporting, and maintainable ownership over cleverness.

## Verification Gate Legend
- `FE-contract`: in `frontend/`, run `npm run contract:check`.
- `FE-lint`: in `frontend/`, run `npm run lint`.
- `FE-test`: in `frontend/`, run `npm run test -- --watch=false`.
- `FE-build`: in `frontend/`, run `npm run build`.
- `BE-migration-audit`: in `AlgotradingBot/`, run `.\gradlew.bat javaMigrationAudit --no-daemon`.
- `BE-test`: in `AlgotradingBot/`, run `.\gradlew.bat test`.
- `BE-build`: in `AlgotradingBot/`, run `.\gradlew.bat build`.
- `Security-scan`: at repo root, run `.\security-scan.ps1 -FailOnFindings`.
- `Runtime-backend-smoke`: at repo root, run `.\run.ps1`, verify backend health plus one authenticated workflow, then run `.\stop.ps1`.
- `Runtime-full-smoke`: at repo root, run `.\run-all.ps1`, verify frontend/backend/auth/websocket/backtest flow, then run `.\stop-all.ps1`.

## Current-State Diagnosis
- The active backtest path is registry-based and centered on `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestSimulationEngine.java` plus `backtest/strategy/*`, but the legacy `backtest/BacktestEngine.java` and `strategy/*` package still exist with their own tests and overlapping indicator/signal concepts.
- Backend orchestration is too concentrated in large services, especially `BacktestManagementService`, `BacktestExecutionService`, `BacktestDatasetService`, `MarketDataImportService`, `PaperTradingService`, and `StrategyManagementService`.
- Frontend route files are oversized and mix orchestration, forms, visual layout, and query logic. The largest hotspots are `frontend/src/features/backtest/BacktestPage.tsx`, `frontend/src/features/settings/SettingsPage.tsx`, `frontend/src/features/marketData/MarketDataPage.tsx`, and `frontend/src/features/trades/TradesPage.tsx`.
- Strategy metadata is inconsistent across runtime surfaces. Backtest catalog enums expose eight algorithms, the strategy profile UI describes the same set, but strategy-management seeding still creates only two paper strategies and uses a different lowercase ID scheme.
- Guardrails and code disagree on bearish defaults. `TRADING_GUARDRAILS.md` says long/cash should be the default and direct short exposure must be explicitly enabled, while `StrategyConfig`, `UpdateStrategyConfigRequest`, and Liquibase short-support defaults still enable short selling by default.
- Live environment messaging is only partially aligned with reality. `ExchangeIntegrationService` only supports connectivity testing, yet some UI flows still attempt live account reads and depend on graceful failure.
- Contract drift risk is high because `frontend/src/generated/openapi.d.ts` exists but is not materially used by frontend feature slices, which continue to define manual interfaces.
- Existing charting is useful but basic. The repo already shows equity, drawdown, monthly returns, and trade distribution, but it lacks price charts with BUY/SELL/SHORT/COVER markers, indicator overlays, regime/exposure series, and comparison-first research visuals.
- The backend already exposes more capability than the frontend currently uses, especially paper orders (`/api/paper/orders*`) and risk circuit-breaker lists (`/api/risk/circuit-breakers`).
- WebSocket posture is weak for a safety-critical app. `WebSocketConfig` allows all origins and `WebSocketHandler` manages subscriptions without token validation or channel authorization.
- Security posture needs hardening. `JwtTokenProvider` still has a hardcoded fallback secret, `SecurityConfig` uses permissive CORS with credentials, and logout revocation is in-memory only.
- Dataset and import workflows rely on PostgreSQL `BYTEA` storage for staged/imported CSV payloads, which is workable for local-first operation but needs a storage, indexing, retention, and query-cost review.
- Some repository paths group or scan data in memory, such as experiment summary aggregation, which will age poorly as backtest volume grows.
- The UI theme and interaction language are still generic. The app is functional, but it does not yet look like an intentional research workstation with strong operator cues.
- Documentation is behind verified reality in several places, especially strategy inventory, short-selling defaults, live-read limitations, and research appendices that describe a smaller implemented algorithm set than the current backtest catalog.

## Cross-Agent Synthesis
- `api-designer`: align request/response shapes with actual strategy modes, remove symbol-contract workarounds for dataset-universe strategies, and enforce backward-compatible DTO evolution.
- `architect-reviewer`: isolate active vs legacy seams first, then refactor by boundary and ownership rather than by file size alone.
- `docker-expert`: preserve the current non-root Docker posture, health checks, and local compose usability while tightening configuration clarity.
- `docs-researcher`: verify version-sensitive framework behavior before changing Spring Boot 4, React 19, MUI 7, or library-specific charting/auth patterns.
- `fintech-engineer`: keep money, fees, slippage, PnL, and risk math exact with `BigDecimal`, explicit action models, and auditable transitions.
- `java-architect`: split orchestration-heavy services into focused command/query/runtime components and make async job state transitions explicit.
- `postgres-pro`: reduce full-table scans, index dataset/job/backtest access patterns, and treat `BYTEA` retention and query shape as first-class design concerns.
- `powershell-5.1-expert`: keep Windows scripts idempotent, port-aware, and operator-friendly; do not regress local orchestration safety.
- `quant-analyst`: prioritize leakage checks, robustness, realistic cost modeling, and honest failure-regime reporting over strategy proliferation.
- `quant-trader`: favor low-turnover, liquid, long/cash research paths that fit a small account and local-first operating model.
- `react-specialist`: preserve the feature-first frontend structure while extracting route containers, hooks, and presentational components.
- `reviewer`: treat dead-code retirement, contract changes, auth boundaries, and missing tests as correctness risks, not cleanup nice-to-haves.
- `risk-manager`: correct the short-selling default, surface circuit-breakers better, and keep override flows explicit, audited, and non-silent.
- `security-auditor`: harden JWT secrets, token revocation, CORS, websocket auth, and request-boundary behavior.
- `spring-boot-engineer`: keep controller/service/repository layering clean, transaction boundaries deliberate, and environment-profile behavior explicit.
- `typescript-pro`: either adopt generated OpenAPI types directly or enforce a single adapter boundary so contract drift cannot spread.
- `websocket-engineer`: authenticate subscriptions, make reconnect/resubscribe behavior deterministic, and improve long-running job progress semantics.
- Global skills not used: `openai-docs`, `skill-creator`, and `skill-installer` are not materially useful for this repository-planning run.

## Major Workstreams
1. Repo-wide refactoring and deduplication of active vs legacy code paths, shared metadata, and repeated UI/backend patterns.
2. Backend architecture cleanup, service decomposition, async job clarity, and performance/query improvements.
3. Frontend architecture cleanup while preserving the React/Vite SPA and feature-first organization.
4. Frontend feature completion wherever backend capability already exists, especially paper trading, risk, and operator workflows.
5. UI/UX redesign that upgrades the dashboard from generic CRUD styling to an intentional trading-research workstation.
6. Trading chart and analytics expansion beyond equity-only views.
7. Signal visualization for BUY, SELL, SHORT, COVER, exposure, regime, drawdown, and equity curves.
8. Strategy code review and quant-quality upgrades for every existing algorithm.
9. Backtest-engine realism review covering costs, dataset identity, action models, and validation rigor.
10. Design and implementation plan for at least one new strategy that is plausible under realistic costs and still framed as research.
11. Market-data and dataset coverage review, using PostgreSQL data first and fetching new crypto data only when coverage is insufficient.
12. Database, Liquibase, query, indexing, caching, and runtime improvements.
13. WebSocket, long-running job, and operator-feedback improvements.
14. Security, risk, and audit hardening.
15. Test coverage expansion, frontend/backend verification discipline, and contract validation.
16. Documentation alignment so durable docs reflect verified current state and planned next steps.

## Ordered Phases

### Phase 0. Baseline Truth And Drift Register
- Objective: establish the verified current state before any refactor or feature completion work starts.
- Why it matters: later phases depend on knowing which paths are active, which failures are pre-existing, and where docs are already wrong.
- Concrete scope: run baseline gates, record failures, map active runtime flows, and capture contradictions between docs, APIs, UI, and code defaults.
- Likely files/modules/areas affected: `README.md`, `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `TRADING_GUARDRAILS.md`, `PLAN.md`, `frontend/src/App.tsx`, `AlgotradingBot/src/main/java/com/algotrader/bot/**/*`.
- Dependencies: none.
- Primary Codex agent(s) to use: `architect-reviewer`, `reviewer`, `docs-researcher`.
- Risks or failure modes: missing hidden runtime paths, treating stale docs as truth, and normalizing current bugs as intended behavior.
- Verification commands/tests: `BE-migration-audit`, `BE-test`, `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, `Security-scan`, `Runtime-full-smoke`.
- Contract/doc updates required: create a contradiction register in `PROJECT_STATUS.md` and update `ARCHITECTURE.md` where verified runtime flow already differs from docs.
- Acceptance criteria: a baseline report exists, active/legacy seams are known, and every later phase can reference the verified baseline instead of assumptions.

### Phase 1. Safety-Critical Contract Alignment
- Objective: resolve the highest-risk contract and posture mismatches before deeper refactoring.
- Why it matters: strategy IDs, short defaults, environment behavior, and DTO contracts are safety-critical and should not drift while code is being reorganized.
- Concrete scope: standardize strategy metadata, correct long/cash defaults, align live-read messaging, and define the generated-type or adapter boundary for the frontend.
- Likely files/modules/areas affected: `BacktestAlgorithmType`, strategy definitions, strategy-management DTOs/services, `TRADING_GUARDRAILS.md`, `PRODUCT.md`, frontend API slices, strategy profile metadata, OpenAPI generation.
- Dependencies: Phase 0 baseline and contradiction register.
- Primary Codex agent(s) to use: `api-designer`, `risk-manager`, `spring-boot-engineer`, `typescript-pro`.
- Risks or failure modes: breaking existing data, silently changing operator behavior, or keeping manual frontend contracts that continue to drift.
- Verification commands/tests: `BE-test`, `BE-migration-audit`, `FE-contract`, `FE-test`, `FE-build`, `Runtime-backend-smoke`.
- Contract/doc updates required: update strategy inventory, request/response docs, short-selling posture, and live-read limitation wording across core docs.
- Acceptance criteria: one canonical strategy catalog exists, safe defaults match guardrails, and frontend/backend contract ownership is explicit.

### Phase 2. Structural Refactor And Runtime Hardening
- Objective: reduce core technical debt in the active backend path while tightening runtime and security-sensitive infrastructure.
- Why it matters: large orchestrators, weak websocket/auth boundaries, and expensive query patterns will make every future feature riskier.
- Concrete scope: isolate legacy seams, decompose large services, improve repository/index design, harden docker/powershell runtime paths, secure websocket/auth boundaries, and clarify async job architecture.
- Likely files/modules/areas affected: `service/*`, `backtest/*`, `repository/*`, Liquibase changelogs, websocket config/handler/publisher, auth/security config, `run*.ps1`, `stop*.ps1`, Dockerfile, compose.
- Dependencies: Phase 1 contract alignment.
- Primary Codex agent(s) to use: `java-architect`, `postgres-pro`, `security-auditor`, `docker-expert`, `powershell-5.1-expert`, `websocket-engineer`.
- Risks or failure modes: regressions in backtest execution, migration/locking issues, broken local runtime flows, or overly aggressive removal of still-used legacy code.
- Verification commands/tests: `BE-migration-audit`, `BE-test`, `BE-build`, `Security-scan`, `Runtime-backend-smoke`, `Runtime-full-smoke`.
- Contract/doc updates required: update `ARCHITECTURE.md`, `STRUCTURE.md`, local-dev/runtime guides, and security-related guide notes.
- Acceptance criteria: active backend/runtime boundaries are smaller and clearer, legacy code is isolated with an explicit disposition, and security/runtime posture is materially stronger.

### Phase 3. Frontend Architecture Cleanup And Feature Parity
- Objective: make the frontend easier to extend while exposing backend capabilities that already exist.
- Why it matters: current page-size hotspots and manual contracts slow feature work and make regressions more likely.
- Concrete scope: extract route containers/hooks/components, adopt a durable API typing pattern, add missing paper/risk/live-parity features, and improve websocket-driven operator feedback.
- Likely files/modules/areas affected: `frontend/src/features/**/*`, `frontend/src/services/api.ts`, route pages, dashboard widgets, risk/paper/backtest screens.
- Dependencies: Phase 1 contract alignment and Phase 2 backend/runtime hardening for any new APIs/telemetry.
- Primary Codex agent(s) to use: `react-specialist`, `typescript-pro`, `api-designer`, `spring-boot-engineer`.
- Risks or failure modes: UI regressions hidden behind refactors, duplicated adapter logic, or parity work that exposes unsupported live behavior as if it were production-ready.
- Verification commands/tests: `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, `Runtime-full-smoke`.
- Contract/doc updates required: update frontend guide docs, product workflow docs, and status notes when a backend capability becomes UI-visible.
- Acceptance criteria: giant pages are decomposed, backend-supported features are visible in the UI, and contract drift is materially reduced.

### Phase 4. Visualization And Operator Experience Expansion
- Objective: deliver a stronger visual research workflow with richer charts, better states, and clearer operator cues.
- Why it matters: strategy research quality depends on seeing signals, regimes, exposure, and drawdowns clearly, not just reading summary metrics.
- Concrete scope: redesign visual hierarchy, add strategy overlays and action markers, improve comparison views, and make empty/loading/error states operator-friendly on desktop and mobile.
- Likely files/modules/areas affected: theme system, dashboard/backtest pages, chart components, backtest DTOs for telemetry, shared UI components, websocket/live-progress presentation.
- Dependencies: Phase 3 frontend cleanup and any Phase 2 telemetry/auth changes.
- Primary Codex agent(s) to use: `react-specialist`, `websocket-engineer`, `quant-analyst`, `typescript-pro`.
- Risks or failure modes: chart payload bloat, performance problems on large datasets, or attractive visuals that overstate research confidence.
- Verification commands/tests: `FE-lint`, `FE-test`, `FE-build`, `Runtime-full-smoke`.
- Contract/doc updates required: update frontend implementation guide, product screenshots/workflow docs, and architecture notes for new telemetry.
- Acceptance criteria: the app can visually explain what a strategy did, when it did it, why it exited, and how equity/drawdown/regime evolved.

### Phase 5. Strategy, Backtest, And Data Research Roadmap
- Objective: audit all current strategies, improve realism, and add one carefully chosen new candidate strategy with a conservative research posture.
- Why it matters: adding features without validating the research engine risks making the platform look more complete while staying analytically weak.
- Concrete scope: strategy-by-strategy review, cost/slippage and action-model upgrades, dataset coverage review, reproducible rerun matrix, new strategy implementation, and paper follow-up criteria.
- Likely files/modules/areas affected: `backtest/strategy/*`, backtest simulation/request/result models, dataset services, research docs, strategy profiles, validation/reporting code.
- Dependencies: Phases 1 through 4, because contract clarity and telemetry are prerequisites for honest validation.
- Primary Codex agent(s) to use: `quant-analyst`, `quant-trader`, `risk-manager`, `fintech-engineer`, `spring-boot-engineer`.
- Risks or failure modes: look-ahead bias, under-modeled execution constraints, overfitting to limited datasets, or claiming more confidence than the evidence supports.
- Verification commands/tests: `BE-test`, `BE-build`, `FE-test`, `FE-build`, plus the strategy-validation and rerun matrix defined later in this plan.
- Contract/doc updates required: update strategy inventory, research docs, acceptance criteria, and current-state docs with honest validation outcomes.
- Acceptance criteria: every strategy has an honest validation record, the new strategy meets the same standard as the old ones, and paper trading remains the next step before any stronger claim.

### Phase 6. Documentation Closure And Release-Ready Verification
- Objective: end the program with aligned docs, passing regression gates, and a smaller list of known risks.
- Why it matters: the value of the refactor is lost if future sessions still have to rediscover structure, contradictions, and acceptance standards.
- Concrete scope: update all durable docs, rerun full verification, summarize residual gaps, and reset the plan for the next iteration.
- Likely files/modules/areas affected: core docs, guides, roadmap/acceptance docs, CI expectations, status tracking files.
- Dependencies: completion of Phases 0 through 5.
- Primary Codex agent(s) to use: `docs-researcher`, `reviewer`, `architect-reviewer`.
- Risks or failure modes: docs lagging code again, skipped full-suite verification, or unresolved known gaps being hidden instead of recorded.
- Verification commands/tests: `BE-migration-audit`, `BE-test`, `BE-build`, `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, `Security-scan`, `Runtime-backend-smoke`, `Runtime-full-smoke`.
- Contract/doc updates required: refresh all core docs, affected guides, and research appendices; record residual risks in `PROJECT_STATUS.md`.
- Acceptance criteria: docs match verified reality, regression gates are green or clearly explained, and the repo has an execution-ready current-state plan.

## Step-By-Step Execution Backlog

### Step 1. Capture Baseline And Contradiction Register
- Objective: produce a verified baseline of tests, runtime behavior, contracts, and doc drift.
- Why it matters: all later decisions should be made against measured reality instead of memory or stale docs.
- Concrete scope: run baseline gates, list existing failures, map active route/controller flows, and record every doc/code contradiction discovered during verification.
- Likely files/modules/areas affected: `PROJECT_STATUS.md`, `ARCHITECTURE.md`, core docs, CI notes, runtime notes.
- Dependencies: none.
- Primary Codex agent(s) to use: `architect-reviewer`, `reviewer`, `docs-researcher`.
- Risks or failure modes: missing a hidden flow, misclassifying a pre-existing failure, or forgetting to link contradictions back to owner docs.
- Verification commands/tests: `BE-migration-audit`, `BE-test`, `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, `Security-scan`, `Runtime-full-smoke`.
- Contract/doc updates required: add a contradiction register and baseline verification summary to `PROJECT_STATUS.md`.
- Acceptance criteria: the repo has a written baseline, known failures are labeled as existing or new, and later work can reference exact contradictions.

### Step 2. Map Active Paths, Legacy Seams, And Dead-Code Candidates
- Objective: separate active runtime code from legacy code that should be migrated, quarantined, or removed later.
- Why it matters: the repo currently contains duplicate backtest and strategy concepts that make refactoring dangerous.
- Concrete scope: trace references to `BacktestSimulationEngine` vs `BacktestEngine`, `backtest/strategy/*` vs `strategy/*`, and any duplicated indicators/signal classes; label each seam as active, compatibility-only, migrate, or retire.
- Likely files/modules/areas affected: `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/**/*`, `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/**/*`, related tests, `STRUCTURE.md`.
- Dependencies: Step 1 baseline.
- Primary Codex agent(s) to use: `architect-reviewer`, `java-architect`, `reviewer`.
- Risks or failure modes: deleting code still used by tests or scripts, or leaving duplicate logic unowned.
- Verification commands/tests: targeted backend tests for touched packages, then `BE-test`.
- Contract/doc updates required: update `ARCHITECTURE.md` and `STRUCTURE.md` with the active-path map and legacy disposition.
- Acceptance criteria: every major seam has an owner and a planned disposition, and no legacy package remains ambiguous.

### Step 3. Create A Canonical Strategy Catalog And Metadata Model
- Objective: make strategy IDs, labels, descriptions, selection modes, and runtime capabilities consistent across backend, frontend, and docs.
- Why it matters: current mismatches between enum names, lowercase config types, seeded strategies, and UI profiles create avoidable drift and operator confusion.
- Concrete scope: define one canonical strategy metadata source, align `BacktestAlgorithmType`, strategy definitions, strategy-management config types, frontend profile metadata, and docs; decide whether paper/runtime strategy configs should mirror backtest catalog or explicitly represent a smaller operator-managed subset.
- Likely files/modules/areas affected: `BacktestAlgorithmType`, `backtest/strategy/*`, `StrategyManagementService`, strategy DTOs, `frontend/src/features/strategies/*`, docs describing strategy inventory.
- Dependencies: Step 2 seam map.
- Primary Codex agent(s) to use: `api-designer`, `quant-trader`, `spring-boot-engineer`, `typescript-pro`.
- Risks or failure modes: breaking stored strategy config rows or exposing strategies in UI that cannot yet run end-to-end.
- Verification commands/tests: targeted controller/service tests, `BE-test`, `FE-contract`, `FE-test`.
- Contract/doc updates required: update `README.md`, `PRODUCT.md`, research docs, and strategy-related UI copy to reflect the canonical catalog.
- Acceptance criteria: one strategy ID model is used everywhere, strategy management and backtest UI are coherent, and docs no longer disagree on implemented algorithms.

### Step 4. Correct Safety Defaults And Environment Posture
- Objective: align code defaults with the documented long/cash, test/paper-first guardrails.
- Why it matters: defaulting to short-enabled behavior or implying live-read capability where it does not exist is a safety and trust problem.
- Concrete scope: change short-selling defaults to opt-in, review existing data migration behavior, align live-read error messaging and UI affordances, confirm paper/test defaults across settings and runtime entry points, and preserve operator override paths.
- Likely files/modules/areas affected: `StrategyConfig`, `UpdateStrategyConfigRequest`, Liquibase short-support changelog, strategy-management UI, account/live environment UI, `TRADING_GUARDRAILS.md`.
- Dependencies: Step 3 canonical strategy model.
- Primary Codex agent(s) to use: `risk-manager`, `fintech-engineer`, `spring-boot-engineer`, `react-specialist`.
- Risks or failure modes: silently changing existing persisted configs, hiding explicit short support that should remain available when intentionally enabled, or masking unsupported live flows instead of explaining them.
- Verification commands/tests: `BE-migration-audit`, targeted strategy-management tests, `BE-test`, `FE-test`, `Runtime-backend-smoke`, `Runtime-full-smoke`.
- Contract/doc updates required: update guardrails, product docs, acceptance criteria, and status notes for the corrected default posture.
- Acceptance criteria: new/default configs are long/cash unless explicitly enabled otherwise, and live limitations are surfaced honestly in both API behavior and UI messaging.

### Step 5. Adopt A Durable Contract Boundary And Remove Selection-Mode Workarounds
- Objective: make frontend/backend contracts verifiable and selection-mode aware.
- Why it matters: the frontend currently works around a required `symbol` field even for dataset-universe strategies, and generated types are not preventing drift.
- Concrete scope: decide between direct generated OpenAPI type use and a single adapter boundary, update the backtest run contract so dataset-universe strategies do not require fake symbol values, and tighten API-slice transforms around generated or validated models.
- Likely files/modules/areas affected: backtest request/response DTOs, OpenAPI generation, `frontend/src/generated/openapi.d.ts`, frontend API slices, contract-check scripts.
- Dependencies: Steps 3 and 4.
- Primary Codex agent(s) to use: `api-designer`, `typescript-pro`, `spring-boot-engineer`.
- Risks or failure modes: breaking old clients, leaking transport quirks into UI components, or adopting generated types without a stable mapping strategy.
- Verification commands/tests: `FE-contract`, `FE-test`, `FE-build`, targeted backend controller tests, `BE-test`.
- Contract/doc updates required: update API docs, backend/frontend guides, and `PROJECT_STATUS.md` with the new contract ownership model.
- Acceptance criteria: selection-mode semantics are honest in the API, generated contracts are materially enforced, and frontend workarounds for invalid transport requirements are removed.

### Step 6. Refactor Backtest Orchestration Into Smaller Backend Components
- Objective: break large backtest services into focused command, query, mapping, and runtime services.
- Why it matters: `BacktestManagementService` and `BacktestExecutionService` currently mix validation, persistence, experiment grouping, progress publishing, and transport mapping.
- Concrete scope: separate run-command logic, experiment-summary query logic, detail/history mapping, execution lifecycle management, and result persistence; keep DTO boundaries clean and tests close to the new seams.
- Likely files/modules/areas affected: `BacktestManagementService`, `BacktestExecutionService`, related repositories/controllers/mappers, backtest tests.
- Dependencies: Step 5 contract boundary.
- Primary Codex agent(s) to use: `java-architect`, `spring-boot-engineer`, `reviewer`.
- Risks or failure modes: execution regressions, duplicated logic during extraction, or introducing inconsistent transaction boundaries.
- Verification commands/tests: targeted backtest service/controller tests, `BE-test`, `BE-build`.
- Contract/doc updates required: update `ARCHITECTURE.md`, backend implementation guide, and `STRUCTURE.md` with the new service boundaries.
- Acceptance criteria: backtest orchestration responsibilities are clearly separated, file sizes and cognitive load are reduced, and behavior remains verified.

### Step 7. Refactor Market-Data Import And Dataset Lifecycle Boundaries
- Objective: separate provider import, dataset cataloging, retention, archiving, staging, and telemetry concerns.
- Why it matters: the current dataset/import services are large and combine operator workflows, storage behavior, and long-running import execution.
- Concrete scope: split provider credential/testing concerns from import-job execution, dataset parsing/storage, retention reporting, archive/restore flows, and websocket progress publishing; keep PostgreSQL-first data management intact.
- Likely files/modules/areas affected: `MarketDataImportService`, `BacktestDatasetService`, `service/marketdata/*`, import/dataset entities and controllers, market-data tests.
- Dependencies: Step 6 service refactor patterns.
- Primary Codex agent(s) to use: `spring-boot-engineer`, `postgres-pro`, `quant-trader`, `reviewer`.
- Risks or failure modes: broken import jobs, dataset corruption, or retention rules that archive datasets still needed for reproducible research.
- Verification commands/tests: targeted market-data/dataset tests, `BE-migration-audit` if schema changes, `BE-test`, `Runtime-backend-smoke`.
- Contract/doc updates required: update market-data guide, architecture docs, and dataset lifecycle docs.
- Acceptance criteria: import jobs, dataset storage, retention, and archive flows each have clear ownership and test coverage.

### Step 8. Improve Database Design, Queries, Liquibase Discipline, And Caching
- Objective: reduce query cost and make dataset/backtest growth sustainable.
- Why it matters: in-memory grouping and full-table scans will become fragile as experiment history and dataset volume increase.
- Concrete scope: audit repository queries, add pagination where missing, introduce targeted indexes for dataset/job/result queries, review cache boundaries, and make Liquibase changes small and auditable.
- Likely files/modules/areas affected: repositories, entities, Liquibase changelogs, `BacktestDatasetCandleCache`, experiment summary logic.
- Dependencies: Steps 6 and 7.
- Primary Codex agent(s) to use: `postgres-pro`, `java-architect`, `spring-boot-engineer`.
- Risks or failure modes: migration lock contention, incorrect index selection, or over-caching stale data.
- Verification commands/tests: `BE-migration-audit`, targeted repository/service tests, `BE-test`, `BE-build`, `Runtime-backend-smoke`.
- Contract/doc updates required: update `ARCHITECTURE.md`, `TECH.md` if needed, and local-dev docs where schema/runtime expectations change.
- Acceptance criteria: key queries are indexed and paginated, Liquibase changes are auditable, and dataset/backtest history operations no longer depend on broad in-memory aggregation.

### Step 9. Harden Runtime Orchestration, Docker, And PowerShell Operator Flows
- Objective: keep local orchestration safe and predictable while improving diagnostics and script/runtime clarity.
- Why it matters: the repo is local-first, and run/stop automation is part of the operator surface, not just developer convenience.
- Concrete scope: review `run.ps1`, `stop.ps1`, `run-all.ps1`, `stop-all.ps1`, Dockerfile, and compose usage; tighten health-check expectations, cleanup behavior, environment messaging, and operator diagnostics without regressing existing safety checks.
- Likely files/modules/areas affected: repo-root PowerShell scripts, Dockerfile, `AlgotradingBot/compose.yaml`, runtime docs.
- Dependencies: Step 1 baseline and any backend/runtime assumptions discovered in Steps 6 through 8.
- Primary Codex agent(s) to use: `powershell-5.1-expert`, `docker-expert`, `architect-reviewer`.
- Risks or failure modes: breaking the Windows-first local workflow, hiding startup failures, or making shutdown cleanup unreliable.
- Verification commands/tests: `Runtime-backend-smoke`, `Runtime-full-smoke`, plus any script-specific dry-run or validation commands added during implementation.
- Contract/doc updates required: update `docs/guides/LOCAL_DEV_DOCKER_MCP.md`, `README.md`, and status notes for verified runtime behavior.
- Acceptance criteria: local start/stop flows remain safe, deterministic, and well-documented, with clearer health/error reporting.

### Step 10. Secure And Improve WebSocket And Long-Running Job Telemetry
- Objective: turn websocket and job-progress behavior into an authenticated, operator-trustworthy subsystem.
- Why it matters: unauthenticated subscriptions and weak progress semantics are not acceptable for operator-facing state changes.
- Concrete scope: authenticate websocket connections, authorize channels, define reconnect/resubscribe rules, improve job event payloads, and make frontend websocket state handling more robust.
- Likely files/modules/areas affected: `WebSocketConfig`, `WebSocketHandler`, `WebSocketEventPublisher`, websocket middleware/hooks, backtest progress UI, paper/risk live updates.
- Dependencies: Steps 5 and 9.
- Primary Codex agent(s) to use: `websocket-engineer`, `security-auditor`, `react-specialist`.
- Risks or failure modes: breaking live updates, introducing auth race conditions, or overloading clients with noisy events.
- Verification commands/tests: targeted websocket/backend tests, `BE-test`, relevant frontend tests, `FE-test`, `Runtime-full-smoke`.
- Contract/doc updates required: update architecture docs, websocket/frontend guides, and status notes about subscription/auth behavior.
- Acceptance criteria: websocket channels are authenticated and purposeful, reconnects are predictable, and long-running jobs report useful operator feedback.

### Step 11. Harden Auth, Secrets, CORS, Token Revocation, And Request Boundaries
- Objective: remove insecure defaults and improve durability of authentication behavior.
- Why it matters: fallback JWT secrets, permissive CORS with credentials, and in-memory revocation are avoidable security liabilities.
- Concrete scope: require non-placeholder secrets for non-dev profiles, tighten CORS origin handling, review `relaxed-auth` profile usage, replace or clearly scope in-memory revocation, and audit request-boundary behavior around auth filters and privileged endpoints.
- Likely files/modules/areas affected: `SecurityConfig`, `JwtTokenProvider`, auth services/controllers/tests, config files, deployment/runtime docs.
- Dependencies: Step 10 websocket auth direction.
- Primary Codex agent(s) to use: `security-auditor`, `spring-boot-engineer`, `docker-expert`, `reviewer`.
- Risks or failure modes: locking out local developers, breaking test profiles, or implementing stronger auth without clear local-development guidance.
- Verification commands/tests: `Security-scan`, targeted auth/security tests, `BE-test`, `BE-build`, `Runtime-full-smoke`.
- Contract/doc updates required: update security posture in `ARCHITECTURE.md`, local runtime docs, and `PROJECT_STATUS.md`.
- Acceptance criteria: insecure defaults are removed or strictly dev-only, auth behavior is documented, and request-boundary tests cover the hardened posture.

### Step 12. Refactor Frontend API Slices Around The Contract Boundary
- Objective: make API typing, transforms, and environment headers consistent across the frontend.
- Why it matters: manual interfaces and scattered transforms are a major source of drift and duplicate logic.
- Concrete scope: adopt generated types or typed adapters in feature APIs, centralize error normalization and environment header logic, and remove repeated manual payload definitions where practical.
- Likely files/modules/areas affected: `frontend/src/features/*Api.ts`, `frontend/src/services/api.ts`, generated type references, shared adapters/selectors.
- Dependencies: Step 5 contract strategy and any endpoint changes from Steps 6 through 11.
- Primary Codex agent(s) to use: `typescript-pro`, `api-designer`, `react-specialist`.
- Risks or failure modes: type churn without ergonomic benefit, circular frontend dependencies, or mismatched runtime transforms.
- Verification commands/tests: `FE-contract`, `FE-lint`, `FE-test`, `FE-build`.
- Contract/doc updates required: update frontend implementation guide and status notes describing the chosen contract pattern.
- Acceptance criteria: API slices share one contract approach, transport transforms are centralized, and manual duplicate interface drift is reduced.

### Step 13. Split Giant Frontend Pages Into Feature Containers, Hooks, And View Components
- Objective: reduce route-level complexity without breaking the feature-first structure.
- Why it matters: giant page components are the frontend equivalent of god services and slow safe iteration.
- Concrete scope: extract orchestration hooks, form sections, result panels, and reusable feature components from `BacktestPage`, `SettingsPage`, `MarketDataPage`, `TradesPage`, and any other oversized screens.
- Likely files/modules/areas affected: `frontend/src/features/backtest/*`, `frontend/src/features/settings/*`, `frontend/src/features/marketData/*`, `frontend/src/features/trades/*`, shared UI helpers.
- Dependencies: Step 12 API cleanup.
- Primary Codex agent(s) to use: `react-specialist`, `typescript-pro`, `reviewer`.
- Risks or failure modes: introducing prop-drilling, duplicating feature state, or refactoring visuals without preserving behavior.
- Verification commands/tests: `FE-lint`, targeted component/integration tests, `FE-test`, `FE-build`.
- Contract/doc updates required: update frontend guide and `STRUCTURE.md` if feature file layout meaningfully changes.
- Acceptance criteria: route files are materially smaller, behavior remains tested, and new work can land at the feature/component level instead of in 1000-line pages.

### Step 14. Fill Frontend Gaps Where Backend Support Already Exists
- Objective: close the most obvious backend/frontend parity gaps before inventing new surfaces.
- Why it matters: existing backend capability is underused, which makes the product feel less complete than it already is.
- Concrete scope: add paper order placement/list/fill/cancel UI, expose risk circuit-breaker lists and override context, align strategy-management screens with canonical strategy metadata, improve live-environment unsupported-state messaging, and clean up selection-mode UX in backtests.
- Likely files/modules/areas affected: paper features, risk features, strategy features, backtest config/results flows, dashboard cards, API slices.
- Dependencies: Steps 3 through 13.
- Primary Codex agent(s) to use: `react-specialist`, `spring-boot-engineer`, `api-designer`, `risk-manager`.
- Risks or failure modes: surfacing backend features without enough UX guardrails, implying live capability where none exists, or increasing operator complexity without guidance.
- Verification commands/tests: `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, `Runtime-full-smoke`.
- Contract/doc updates required: update `PRODUCT.md`, acceptance docs, frontend guide, and status notes for each newly surfaced capability.
- Acceptance criteria: the UI exposes key backend-supported workflows, gaps are intentionally documented where they remain, and the operator experience is clearer.

### Step 15. Redesign The UI System And Operator Experience
- Objective: replace generic styling with a clearer, more intentional research-workstation visual system.
- Why it matters: trading-research tools need strong hierarchy, readable dense data presentation, and trustworthy operator cues.
- Concrete scope: define design tokens, upgrade typography and palette within MUI, strengthen dashboard layout and state presentation, remove placeholder-feeling elements, fix weak empty/loading/error states, and preserve mobile responsiveness.
- Likely files/modules/areas affected: `frontend/src/theme/*`, dashboard/backtest/risk/settings surfaces, shared UI components, error-state components.
- Dependencies: Step 13 decomposition and Step 14 parity work.
- Primary Codex agent(s) to use: `react-specialist`, `reviewer`.
- Risks or failure modes: visual change without usability gain, accessibility regressions, or overly decorative styling that obscures safety-critical state.
- Verification commands/tests: `FE-lint`, `FE-test`, `FE-build`, `Runtime-full-smoke`.
- Contract/doc updates required: update frontend guide and product docs where workflow visuals materially change.
- Acceptance criteria: the UI looks intentional, remains responsive, and makes operational state easier to understand at a glance.

### Step 16. Deliver Advanced Charting, Signal Telemetry, And Research Visuals
- Objective: make the app visually explain strategy behavior, not just summarize outcomes.
- Why it matters: current backtest visual coverage stops short of the signal, exposure, and regime detail needed for serious research.
- Concrete scope: add price charts with BUY/SELL/SHORT/COVER markers, overlay indicators used by each strategy, add exposure/regime/equity/drawdown charts, build comparison views across strategies/runs, and extend backend telemetry with per-bar action, indicator, exposure, and regime series where missing.
- Likely files/modules/areas affected: backtest DTOs/entities/services, chart components, backtest result views, comparison screens, telemetry mappers.
- Dependencies: Steps 6, 10, 12, 13, and 15.
- Primary Codex agent(s) to use: `quant-analyst`, `react-specialist`, `typescript-pro`, `websocket-engineer`.
- Risks or failure modes: large payloads, slow rendering on big datasets, or charts that imply certainty without enough validation context.
- Verification commands/tests: targeted backend telemetry tests, `BE-test`, targeted frontend chart tests, `FE-test`, `FE-build`, `Runtime-full-smoke`.
- Contract/doc updates required: update architecture/frontend docs, product docs, and status notes with the new telemetry model and chart coverage.
- Acceptance criteria: every backtest can show price plus action markers plus relevant overlays, and comparison/equity/drawdown views are usable on desktop and mobile.

### Step 17. Audit Every Existing Strategy And Improve Backtest Realism
- Objective: review all implemented strategies and the legacy backtest seam for unrealistic assumptions, duplication, and weak validation.
- Why it matters: the platform should not expand strategy count faster than it improves strategy honesty.
- Concrete scope: audit `BUY_AND_HOLD`, `SMA_CROSSOVER`, `BOLLINGER_BANDS`, `DUAL_MOMENTUM_ROTATION`, `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`, `TREND_PULLBACK_CONTINUATION`, `REGIME_FILTERED_MEAN_REVERSION`, `TREND_FIRST_ADAPTIVE_ENSEMBLE`, plus the legacy Bollinger/old-engine path; review fee/slippage handling, signal timing, position-sizing realism, minimum-order assumptions, short behavior, and dataset-universe logic.
- Likely files/modules/areas affected: `backtest/strategy/*`, backtest simulation engine, validation/reporting code, research docs, strategy tests.
- Dependencies: Steps 2 through 16.
- Primary Codex agent(s) to use: `quant-analyst`, `quant-trader`, `risk-manager`, `reviewer`.
- Risks or failure modes: discovering that current results are weaker than existing UI/docs imply, or leaving known realism gaps undocumented.
- Verification commands/tests: targeted strategy tests, `BE-test`, `BE-build`, rerun baseline strategy matrix from the strategy-validation section.
- Contract/doc updates required: update research docs, product docs, and `PROJECT_STATUS.md` with honest findings and strategy dispositions.
- Acceptance criteria: each strategy has a documented design note, known weaknesses, validation status, and clear next action: keep, improve, quarantine, or retire.

### Step 18. Implement One New Conservative Strategy Candidate
- Objective: add one new strategy only after the existing catalog and validation process are credible.
- Why it matters: the repo needs disciplined extension, not more unaudited strategy sprawl.
- Concrete scope: implement `ICHIMOKU_TREND` as the first new candidate if it passes pre-implementation design review; ensure long/cash default behavior, correct shifted-cloud handling, indicator overlays, telemetry, tests, and docs; if look-ahead-safe implementation cannot be made clear quickly, postpone rather than force it.
- Likely files/modules/areas affected: `backtest/strategy/*`, indicator calculators, strategy registry/catalog, frontend strategy profiles, chart overlays, research docs.
- Dependencies: Step 17 strategy audit and the full telemetry/UI groundwork from Steps 15 and 16.
- Primary Codex agent(s) to use: `quant-trader`, `quant-analyst`, `spring-boot-engineer`, `typescript-pro`.
- Risks or failure modes: look-ahead bias in Ichimoku span handling, adding a new strategy before current ones are validated, or implying higher confidence than justified.
- Verification commands/tests: new strategy unit/integration tests, `BE-test`, `BE-build`, `FE-test`, rerun the required strategy-validation matrix, then paper-follow-up planning.
- Contract/doc updates required: update strategy catalog docs, research appendices, product copy, and status notes with honest implementation status and validation results.
- Acceptance criteria: the new strategy is implemented only if it is honest, tested, documented, and evaluated under the same standards as the existing catalog.

### Step 19. Execute Dataset Coverage Review, Reruns, Walk-Forward Checks, And Paper Follow-Up
- Objective: turn the refactored platform into a reproducible research engine with an honest rerun discipline.
- Why it matters: code quality alone does not validate strategy quality; the project needs repeatable evidence tied to real dataset identity.
- Concrete scope: inventory PostgreSQL datasets, define coverage gaps, rerun all strategies on existing crypto datasets first, fetch new crypto data only when a named gap exists, freeze in-sample/out-of-sample windows, run walk-forward or robustness checks where appropriate, and define paper-trading follow-up for shortlisted candidates.
- Likely files/modules/areas affected: dataset catalog/reporting, backtest run configs, experiment summaries, research docs, any result-export/reporting artifacts added during execution.
- Dependencies: Steps 7, 8, 16, 17, and 18.
- Primary Codex agent(s) to use: `quant-analyst`, `quant-trader`, `postgres-pro`, `risk-manager`.
- Risks or failure modes: overfitting to a narrow dataset, inconsistent experiment naming, insufficient out-of-sample coverage, or fetching new data before exhausting existing catalog value.
- Verification commands/tests: baseline strategy matrix reruns, targeted backtest tests, `BE-test`, and selective `FE-build`/`Runtime-full-smoke` for any research-UI/reporting changes.
- Contract/doc updates required: record dataset manifests, experiment protocol, and results interpretation rules in `PROJECT_STATUS.md`, research docs, and acceptance docs.
- Acceptance criteria: all strategies have reproducible dataset-backed results, coverage gaps are explicit, and any shortlisted candidate has a defined paper-trading next step.

### Step 20. Close Documentation Drift And Run Final Regression Gates
- Objective: finish with durable docs and a verified current state.
- Why it matters: future Codex sessions should be able to continue without re-deriving architecture, guardrails, or validation standards.
- Concrete scope: update all core docs and relevant guides, reconcile research appendices with implemented reality, summarize residual risks, and run the full regression matrix.
- Likely files/modules/areas affected: all core docs, affected guides, roadmap/acceptance docs, `PROJECT_STATUS.md`, `STRUCTURE.md`.
- Dependencies: Steps 1 through 19.
- Primary Codex agent(s) to use: `docs-researcher`, `reviewer`, `architect-reviewer`.
- Risks or failure modes: shipping code with stale docs, omitting unresolved gaps, or skipping expensive but necessary final verification.
- Verification commands/tests: `BE-migration-audit`, `BE-test`, `BE-build`, `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, `Security-scan`, `Runtime-backend-smoke`, `Runtime-full-smoke`.
- Contract/doc updates required: refresh `README.md`, `PLAN.md`, `PRODUCT.md`, `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `TRADING_GUARDRAILS.md`, relevant guides, roadmap/acceptance docs, and research appendices.
- Acceptance criteria: docs and code align, full verification is green or plainly documented, and the repository has a trustworthy current-state narrative.

## Strategy Research And Validation Roadmap
- Review order for current catalog: `BUY_AND_HOLD`, `SMA_CROSSOVER`, `BOLLINGER_BANDS`, `DUAL_MOMENTUM_ROTATION`, `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`, `TREND_PULLBACK_CONTINUATION`, `REGIME_FILTERED_MEAN_REVERSION`, `TREND_FIRST_ADAPTIVE_ENSEMBLE`, then the legacy Bollinger/old-engine path for migration or retirement.
- Required realism for every strategy: explicit fees, explicit slippage, reproducible dataset identity, honest action model, minimum-order feasibility, and no silent short exposure in the default long/cash mode.
- Required dataset identity for every evaluation: dataset ID, dataset name, checksum, schema version, symbol set, timeframe, row count, coverage window, and upload timestamp.
- Required split policy: define in-sample and out-of-sample windows before comparison; use walk-forward or robustness checks for adaptive, multi-symbol, or parameter-sensitive strategies.
- Required metrics for every report: trade count, final balance, total return, max drawdown, Sharpe ratio, profit factor, win rate, fees, slippage, and known failure regimes.
- Required interpretation discipline: include failure regimes, sample-size caveats, and data-quality caveats in the same summary as any positive result.
- Required promotion rule: no strategy moves beyond research status without passing reproducible reruns and then a paper-trading follow-up period.
- Selected first new strategy candidate: `ICHIMOKU_TREND`.
- Why `ICHIMOKU_TREND` is the best next new candidate under this repo's constraints: the strongest standalone evidence-based styles already present in the catalog are `DUAL_MOMENTUM_ROTATION` and `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`, so the best next addition is an unimplemented, low-turnover, long/cash-compatible trend filter that uses the same OHLCV pipeline, fits daily or 4h bars, and adds a new regime-discrimination lens without requiring new infrastructure.
- Constraint on `ICHIMOKU_TREND`: implement it only if shifted-span handling is provably free of look-ahead bias and its behavior can be explained clearly in tests, docs, and visual overlays.
- Fallback if `ICHIMOKU_TREND` fails the honesty test: do not force a new strategy; instead, deepen validation of the current trend catalog and revisit a later candidate such as a small-basket rotation extension only when dataset coverage is clearly adequate.
- Existing-strategy upgrade priorities after audit: tighten mean-reversion regime filters, validate volatility targeting and allocation floors, review breakout exit/stop semantics, and verify that dataset-universe rotation logic handles missing candles and calendar alignment correctly.

## Frontend Feature Parity Roadmap
- Expose full paper-trading workflow already supported by the backend: order placement, order list, fill/cancel actions, and paper-state detail.
- Surface risk circuit-breaker inventory and override context instead of only the summary/status panels.
- Align the strategy-management UI with the canonical strategy catalog so seeded/default runtime strategies do not appear disconnected from backtest strategy options.
- Remove UI workarounds that invent symbols for dataset-universe strategies once the transport contract is fixed.
- Show explicit unsupported-state messaging for live reads until live balance/position/trade reads truly exist.
- Improve backtest progress and websocket recovery messaging so operators can distinguish polling fallback, stale live streams, and actual job failure.
- Keep the feature-first layout intact by placing each parity enhancement inside the relevant feature module rather than centralizing into a generic pages folder.

## UI And Visualization Roadmap
- Visual direction: retain MUI and React/Vite, but introduce a clearer research-workstation identity with stronger hierarchy, denser information handling, and less generic default styling.
- Dashboard upgrades: richer status cards, clearer risk and environment cues, and more intentional use of whitespace, surfaces, and typography.
- Chart upgrades: price candles or line/ohlc views with BUY/SELL/SHORT/COVER markers, overlays for the strategy's own indicators, and side panels for regime, exposure, and execution context.
- Analytics upgrades: equity curve, drawdown curve, monthly returns, trade distribution, and strategy-comparison views should be visually related and cross-readable.
- Comparison upgrades: compare multiple runs by strategy, dataset, cost assumptions, return, drawdown, and validation status in one research view.
- Operator states: every new screen must have deliberate empty, loading, stale, error, and unsupported states.
- Responsiveness: desktop remains the primary research view, but mobile must keep core dashboards, run status, and operator controls readable and safe.
- Telemetry requirement: if the backend does not yet provide per-bar action, indicator, regime, or exposure series, add those DTOs before attempting the full charting experience.

## Verification And Regression Matrix
- Docs-only changes: review affected docs for contradictions; if docs reflect code changes in the same session, run the matching code-area gates too.
- Frontend-only UI or component changes: `FE-lint`, `FE-test`, `FE-build`.
- Frontend contract or API-slice changes: `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, plus targeted backend tests for touched endpoints.
- Backend service/controller/repository changes: targeted backend tests, then `BE-test`; add `BE-build` when the change crosses multiple modules or packaging boundaries.
- Liquibase or persistence changes: `BE-migration-audit`, targeted repository/service tests, `BE-test`, `BE-build`, `Runtime-backend-smoke`.
- Security, auth, or request-boundary changes: `Security-scan`, targeted auth/security tests, `BE-test`, `FE-test` if UI is affected, `Runtime-full-smoke`.
- WebSocket or long-running job changes: targeted websocket/job tests, `BE-test`, relevant `FE-test`, `Runtime-full-smoke`.
- Strategy or backtest-engine changes: targeted strategy/backtest tests, `BE-test`, `BE-build`, and the strategy rerun subset required by the validation roadmap.
- Phase exit gates for Phases 1 through 5: run every gate relevant to areas touched during that phase.
- Final program gate: `BE-migration-audit`, `BE-test`, `BE-build`, `FE-contract`, `FE-lint`, `FE-test`, `FE-build`, `Security-scan`, `Runtime-backend-smoke`, `Runtime-full-smoke`.

## Data Rerun And Experiment Plan
- Start with PostgreSQL-backed datasets already in the catalog. Do not fetch new data until the current catalog has been inventoried and deemed insufficient for a named strategy-validation need.
- Produce a dataset manifest before reruns: dataset ID, name, checksum, schema version, symbols, timeframe, date range, row count, archived status, and usage notes.
- Define a baseline crypto rerun set using current PostgreSQL coverage first, prioritizing `BTC/USDT`, `ETH/USDT`, and any existing multi-symbol datasets needed for rotation strategies.
- Use explicit cost assumptions in every run and keep them visible in experiment names or metadata: fees in basis points, slippage in basis points, and action-model assumptions.
- Freeze in-sample and out-of-sample windows before comparing strategies. Use walk-forward or rolling evaluation for adaptive or multi-symbol strategies.
- Run every implemented strategy on the same comparable datasets where possible so the benchmark set is consistent.
- Store or export experiment results in a way that preserves dataset identity, strategy version, code version if available, and run timestamp.
- Fetch new crypto data only if current PostgreSQL coverage cannot support one of these needs: baseline BTC/ETH comparison, daily and 4h evaluation windows, multi-symbol universe testing, or out-of-sample holdout windows.
- Use paper trading as the next evidence step for any strategy that survives reruns with acceptable realism and stability.

## Documentation Update Plan
- `README.md`: refresh current architecture, strategy inventory, runtime expectations, and safe usage posture.
- `PROJECT_STATUS.md`: maintain the contradiction register, baseline verification results, current phase status, known risks, and residual blockers.
- `ARCHITECTURE.md`: document the active backend engine, service boundaries, websocket/auth model, dataset lifecycle, and frontend contract boundary.
- `TRADING_GUARDRAILS.md`: align bearish defaults, short-enable rules, paper-first promotion rules, and honest strategy-claim language.
- `PRODUCT.md`: reflect real feature parity, operator workflows, live-read limitations, and visualization capabilities.
- `STRUCTURE.md`: update module ownership and boundary expectations after backend/frontend refactors.
- `docs/guides/BACKEND_IMPLEMENTATION.md`: reflect new service boundaries, DTO ownership, transaction expectations, and strategy/runtime architecture.
- `docs/guides/FRONTEND_IMPLEMENTATION.md`: reflect feature-container structure, API typing approach, visualization standards, and operator-state expectations.
- `docs/guides/TESTING_AND_CONTRACTS.md`: reflect the contract boundary, rerun discipline, and required verification gates.
- `docs/guides/MARKET_DATA_RESEARCH.md`: reflect dataset manifest expectations, PostgreSQL-first usage, and import/retention workflow.
- `docs/guides/LOCAL_DEV_DOCKER_MCP.md`: reflect verified run/stop behavior, compose/runtime expectations, and any script or health-check changes.
- `docs/ROADMAP.md` and `docs/ACCEPTANCE_CRITERIA.md`: align feature and verification acceptance with the executed plan.
- `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md` and `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`: clearly separate implemented, validated, and still-proposed strategies so research guidance does not overstate current capability.

## Risks, Assumptions, And Blockers
- Assumption: React/Vite remains the frontend baseline and no migration away from the SPA architecture is attempted during this plan.
- Assumption: current PostgreSQL datasets are available and sufficient to begin strategy reruns before any new market-data import is needed.
- Assumption: conservative defaults and operator control take precedence over feature speed.
- Risk: the legacy backtest engine or legacy strategy package may still support tests or workflows that are not obvious from a quick code search.
- Risk: correcting short-selling defaults can change operator expectations or persisted config behavior if the migration path is not explicit.
- Risk: generated-type adoption may expose latent backend/frontend contract mismatches and create short-term churn.
- Risk: richer telemetry and charting can increase payload size, database volume, and frontend rendering cost if not designed carefully.
- Risk: security hardening may break current local-development convenience unless profile boundaries and docs are handled carefully.
- Risk: honest strategy review may reveal that some current strategies or UI descriptions are weaker than existing docs imply.
- Blocker: missing exchange credentials can limit runtime verification of connection-test flows.
- Blocker: insufficient out-of-sample dataset coverage can delay meaningful validation of multi-symbol or slower strategies.
- Blocker: pre-existing failing tests or environment drift can slow structural refactors until baseline issues are categorized.

## Exit Criteria And Definition Of Done
- The repo has one clearly documented active backtest architecture, and legacy seams are either retired or explicitly quarantined with a defined reason.
- Strategy identifiers, labels, modes, and operator-facing metadata are canonical across backend, frontend, and docs.
- Default safety posture is aligned with `test` and `paper`, long/cash is the default bearish behavior, and explicit short support is opt-in and documented.
- Backend orchestration is decomposed into smaller, testable services with improved query and runtime behavior.
- Frontend route complexity is reduced and contract handling is centralized through generated types or a single adapter boundary.
- Frontend parity gaps for existing backend capability are closed or intentionally documented.
- The UI delivers advanced visuals for price/action/indicator/regime/exposure/equity/drawdown/comparison workflows.
- Every existing strategy has been reviewed with realistic validation criteria, and at least one new strategy candidate has been implemented only if it meets the same honesty standard.
- Dataset usage and experiment reruns are reproducible, PostgreSQL-first, and tied to explicit dataset identity.
- Security, websocket, audit, and runtime boundaries are materially stronger than the current state.
- Full verification gates pass, or any residual failures are clearly documented as pre-existing or deferred with owner and reason.
- Core docs and relevant guides match verified current reality.

## Numbered Execution Checklist
1. Run the full baseline verification suite and record every failure and contradiction.
2. Build the active-path and legacy-seam map for backend engines, strategy packages, and related tests.
3. Standardize strategy catalog metadata and decide the relationship between backtest strategies and operator-managed paper strategies.
4. Align safety defaults with guardrails, especially short-selling behavior and live-read messaging.
5. Fix the contract boundary, remove dataset-universe symbol workarounds, and enforce generated or adapted API typing.
6. Split backtest orchestration into smaller backend command/query/runtime components.
7. Split market-data import and dataset lifecycle logic into focused services with clear ownership.
8. Optimize repositories, indexes, pagination, Liquibase changes, and cache boundaries.
9. Review and harden Docker and PowerShell local runtime flows without regressing safety checks.
10. Secure websocket auth and improve long-running job telemetry and reconnect behavior.
11. Harden JWT secrets, token revocation, CORS, and request-boundary security behavior.
12. Refactor frontend API slices around the chosen contract boundary.
13. Break giant frontend pages into feature containers, hooks, and view components.
14. Deliver missing frontend parity for paper orders, circuit-breakers, strategy coherence, and honest live limitations.
15. Redesign the visual system and operator states for a stronger research-workstation UX.
16. Add advanced price, signal, indicator, exposure, regime, equity, drawdown, and comparison charts.
17. Audit every existing strategy and improve backtest realism before adding anything new.
18. Implement `ICHIMOKU_TREND` only if it passes a look-ahead-safe design review and full validation discipline.
19. Run the PostgreSQL-first dataset manifest, rerun matrix, out-of-sample checks, and paper-trading follow-up plan.
20. Update all durable docs, rerun final regression gates, and record residual risks in `PROJECT_STATUS.md`.
