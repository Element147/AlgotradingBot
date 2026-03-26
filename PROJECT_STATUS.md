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
- Strategy-management templates now normalize to the same canonical algorithm IDs used by the backtest registry, and missing paper-mode templates are seeded from that catalog.
- Backtests support `SINGLE_SYMBOL` and `DATASET_UNIVERSE` execution modes.
- Backtest run requests are now selection-mode aware: single-symbol strategies still require a symbol, while dataset-universe strategies omit `symbol` and evaluate the whole dataset without a fake anchor value.
- Backtest orchestration is now split across dedicated command, query, execution-lifecycle, and progress services so read mapping, async runtime work, and transactional persistence no longer live in one oversized service.
- Fresh backtest submissions now dispatch only after the queueing transaction commits, so new runs start immediately instead of relying on startup recovery to pick up stranded `QUEUED` rows.
- Requested backtest timeframes are now honored by explicit candle resampling before simulation; a run labeled `4h` or `1d` no longer silently executes on the raw imported granularity.
- The active simulation engine now queues signal decisions for next-bar-open fills instead of executing on the same bar close, which removes a look-ahead path from every strategy.
- Experiment summaries no longer depend on loading the full backtest table into memory; they now come from a repository aggregation query backed by explicit Liquibase-managed indexes.
- Runs persist history, details, equity series, trade series, validation state, and experiment labels.
- Backtest details now expose on-demand per-bar telemetry reconstructed from stored datasets and trade series, including price-action markers, exposure, regime classification, and strategy-specific indicator overlays.
- Active-run detail payloads now skip heavy telemetry until execution is complete so progress polling stays lightweight and completed runs remain the only source of full per-bar review data.
- The legacy `BOLLINGER_BANDS` strategy is now trend-filtered and exits on mean reversion, trend breaks, or ATR or time-stop failures; it remains research-only because the March 20 audit still rejected it under realistic costs.
- Operators can replay a prior run, compare runs side by side, and delete finished results.
- Dataset provenance includes checksum, schema version, retention status, archive or restore controls, and download support.
- Export flows fail closed when dataset provenance is incomplete.

### Strategy Audit Snapshot

Verified on March 20, 2026 against dataset `#12` (`Binance BTC/USDT +2 15m 2024-03-12 to 2026-03-12`, checksum `b93c95da97c05f4edf4d706b80d33fcfab752f4f4d6f11f003fa3aca2fe2d326`, schema `ohlcv-v1`, symbols `BTC/USDT,ETH/USDT,SOL/USDT`):

- The first full `15m` audit exposed a realism bug: slower strategies were still being simulated on raw `15m` bars, which produced extreme overtrading under the configured `10` bps fees plus `3` bps slippage. Examples: `SMA_CROSSOVER` fell to `40.23` final balance after `1417` trades, and `TREND_FIRST_ADAPTIVE_ENSEMBLE` fell to `1.00` after `6654` trades.
- After the execution-timing and timeframe-resampling fixes, the corrected audit used strategy-appropriate `4h` and `1d` runs. `BUY_AND_HOLD` returned `+1.02%`, `SMA_CROSSOVER` returned `+1.85%`, `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT` returned `+28.56%` with `16.09%` max drawdown and was the only run that passed the current validator, `DUAL_MOMENTUM_ROTATION` returned `+28.30%`, `TREND_FIRST_ADAPTIVE_ENSEMBLE` returned `+7.91%`, and the new `ICHIMOKU_TREND` returned `+7.64%` with a look-ahead-safe cloud implementation.
- The weaker catalog paths remained weak under the corrected model: `TREND_PULLBACK_CONTINUATION` returned `-21.26%`, `REGIME_FILTERED_MEAN_REVERSION` returned `-1.64%`, and `BOLLINGER_BANDS` returned `-16.95%` before hardening.
- The hardened Bollinger rerun cut churn and drawdown materially (`79` to `30` trades, `40.19%` to `17.90%` max drawdown) but still finished at `-17.90%` with failed validation, so it stays in the catalog only as a constrained research baseline, not as a promoted candidate.
- The first frozen holdout split at `2025-09-12` was rejected for the daily `200`-bar strategies because the out-of-sample window was too short and produced explicit insufficient-candle failures. That failed attempt is retained as evidence that split discipline must respect each strategy's warm-up requirements.
- The valid holdout split now freezes `2024-03-12` to `2025-07-01` as in-sample and `2025-07-01` to `2026-03-13` as out-of-sample. On that split, `SMA_CROSSOVER` stayed positive out of sample at `+7.08%`, `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`, `DUAL_MOMENTUM_ROTATION`, and `TREND_FIRST_ADAPTIVE_ENSEMBLE` produced no out-of-sample trades in the observed window, `ICHIMOKU_TREND` finished at `-1.49%` on one trade, and the passive benchmark lost `-40.06%`.
- Current paper-follow-up posture stays conservative: `SMA_CROSSOVER` is the clearest immediate paper-watch candidate because it stayed positive on the valid holdout, while `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`, `DUAL_MOMENTUM_ROTATION`, and `ICHIMOKU_TREND` remain research-only and should only move to shadow paper monitoring with explicit caveats about sparse or mixed out-of-sample evidence.

### Market Data

- Operators can import stock and crypto history from supported providers directly into the backtest dataset catalog.
- Import jobs are persistent, retry-aware, and visible in the UI.
- Import progress is streamed through WebSocket events with polling fallback.
- Provider credentials can be stored encrypted in PostgreSQL or supplied through environment variables.
- Liquibase migration `0017` now provisions the normalized `market_data_series`, `market_data_candle_segments`, and `market_data_candles` tables plus repository-tested range and overlap query seams, and the runtime now queries that relational store directly for backtest execution and telemetry windows when normalized candles are present.
- The relational query path now supports explicit exact-timeframe, best-available, and deterministic finer-to-coarser rollup reads, so `1h` execution windows can prefer imported `1h` candles or derive them from complete `15m` coverage without silently fabricating partial bars.
- Unmigrated datasets still have an explicit legacy CSV compatibility fallback for execution and telemetry reads so the current catalog remains runnable before the later migration and import cutover tasks finish.
- When normalized coverage exists but leaves holes, the query layer now reports explicit bucket gaps instead of silently falling back to legacy CSV data for the same window, which keeps provenance and overlap behavior auditable during the migration period.
- Market-data ownership is now split so provider and job commands stay in `MarketDataImportService`, async download execution stays in `MarketDataImportExecutionService`, and import WebSocket publication stays in `MarketDataImportProgressService`.
- Dataset catalog management is now split between `BacktestDatasetStorageService` for CSV persistence/downloads and `BacktestDatasetLifecycleService` for inventory, retention, archive, and restore behavior.
- Liquibase now adds targeted query-shape indexes for dataset listing, backtest experiment and status scans, and market-data ready-job scheduling.

### Paper Trading And Operations

- Strategy configuration, version history, and typed preset guidance are available through backend and UI flows.
- A dedicated paper-trading desk now exposes paper order placement, list, fill, and cancel workflows with explicit paper-only messaging and route-level navigation.
- Risk UI now shows circuit-breaker inventory alongside override controls so operators can see the active breaker context before attempting an audited override.
- Strategy-management tables now lean on canonical strategy profile metadata instead of only raw type IDs, and backtest configuration now explains whether the selected algorithm uses one symbol or the full dataset universe.
- The frontend shell now uses a centralized research-workstation theme with grouped navigation, route-aware operator context in the header, and stronger loading and error states so safety and environment cues stay legible on desktop and mobile.
- The shell polish pass now keeps route context in one place: the header provides the page title plus explicit mode, exchange-profile, telemetry, risk, and role chips, while route surfaces avoid duplicating hero chrome and instead use shared intro, metric-strip, and section-header primitives.
- Dashboard, Paper Trading, Strategies, Trades, Backtest, Market Data, Risk, and Settings now share the same spacing, max-width, card density, and responsive stacking rules so dense workflows stay readable without overlapping or clipped UI.
- Backtest research views now include price-action, exposure, regime, indicator, equity, drawdown, and comparison visuals so operators can inspect what a strategy actually did instead of relying only on summary metrics.
- The Backtest route is now the reference research workspace: a sticky action bar, `lightweight-charts` price-action surface, linked marker and trade inspection, and secondary analytics below the chart define the interaction pattern reused by the rest of the SPA.
- Dense review routes now keep shareable context in the URL. Backtest persists run, compare selection, symbol, marker filter, overlay, pane, and selected trade state, while Trades persists filters, pagination, sorting, and the selected trade ID.
- Mobile research review now uses a bottom-sheet inspector for Backtest so the chart stack stays readable on smaller screens without dropping linked detail inspection.
- New/default strategy configurations are long-only unless short exposure is explicitly enabled; existing explicit short settings are preserved for operator review.
- Paper-trading state includes recovery-aware telemetry, stale-order and stale-position visibility, and in-app incident alerts.
- JWT access tokens now fail fast at startup unless a non-placeholder secret of at least 32 bytes is configured.
- Token revocation is now durable across restarts through the `auth_token_revocations` table instead of an in-memory blacklist.
- The auth boundary is narrower: only `login` and `refresh` are public, while `me` and `logout` require authenticated requests and reject revoked tokens.
- HTTP CORS with credentials now uses an explicit local-origin allowlist rather than permissive wildcard patterns.
- Browser WebSocket telemetry is now authenticated end to end: valid `/ws?token=...&env=test` subscriptions receive `ack` control messages for accepted channels, and invalid tokens are rejected during the handshake.
- Risk controls include environment-aware status, configurable limits, and circuit-breaker overrides with auditability.
- Exchange connection profiles are persisted per authenticated user in PostgreSQL.
- Critical system actions are recorded in durable operator audit events.
- System backup produces real database-native backup artifacts.

### Platform And Developer Workflow

- Local fast mode runs PostgreSQL in Docker with backend and frontend locally.
- Full-stack mode runs app, PostgreSQL, and Kafka in Docker with the frontend locally.
- `.\run.ps1` and `.\run-all.ps1` now wait for both backend and frontend readiness and roll back partial startup if a later stage fails.
- `.\run-all.ps1` now checks for leftover fast-mode backend processes and port conflicts before Docker startup.
- `.\run.ps1` now auto-sizes the local backend JVM heap from detected host RAM and accepts explicit heap overrides for larger developer machines.
- Compose identity is fixed to `algotradingbot`, with reusable named volumes for PostgreSQL, Kafka, and Kafka secrets.
- Script-driven backend logs go to `.runtime/logs`.
- Local PowerShell helpers now provision a stable repo-local JWT secret in `.runtime/local-jwt-secret.txt`; direct Compose usage must provide `JWT_SECRET` explicitly.
- Project-local Codex agents under `.codex/agents/` cover quant, Java/Spring, frontend, risk, security, and local ops workflows for this repository.
- CI checks backend build and tests, frontend lint and tests, and OpenAPI contract drift.
- MCP support is documented for `context7`, `database-server`, `openapi-schema`, `playwright`, `semgrep`, and `hoverfly-mcp-server`.
- The frontend contract boundary now uses generated OpenAPI transport types plus feature-owned adapters where transport needs normalization. Backtest, auth, and account flows use this pattern directly, and explicit live-environment overrides now go through one shared helper instead of hand-written `X-Environment` headers in slices.
- Oversized frontend route files are being retired in favor of orchestration-first containers plus feature-local panels and page-state helpers. `BacktestPage`, `MarketDataPage`, `SettingsPage`, and `TradesPage` now delegate most UI sections into feature modules instead of keeping 600-1000 line routes.
- Shared visual-system ownership is now explicit: `theme.ts` drives design tokens and dense-data component overrides, while `AppLayout`, `Header`, `Sidebar`, `LoadingFallback`, and `ErrorFallback` own the shell presentation instead of route files improvising their own chrome.
- The retired `BacktestEngine` plus `strategy/*` seam has been fully removed, so the registry-backed `BacktestSimulationEngine` path is now the only backtest execution seam in the repo.
- Dataset upload/import catalog behavior now lives behind `BacktestDatasetCatalogService`, while runtime backtest services read `BacktestDatasetStorageService` and `BacktestDatasetLifecycleService` directly instead of routing through a generic passthrough wrapper.

## Verified Baseline

The repository runbooks and verification flow assume the following baseline:

- `.\run.ps1` and `.\stop.ps1` manage the fast local stack cleanly.
- `.\run-all.ps1` and `.\stop-all.ps1` manage the Docker-backed full stack cleanly.
- `.\run.ps1` is the most reliable runtime smoke for current backend source changes because it runs the backend locally; `.\run-all.ps1` exercises the compose-managed backend image unless that image is rebuilt.
- `.\gradlew.bat javaMigrationAudit --no-daemon` is the Java 25 audit entrypoint.
- OpenAPI artifacts are tracked in `contracts/openapi.json` and `frontend/src/generated/openapi.d.ts`.
- `.\security-scan.ps1 -FailOnFindings` is the local zero-findings gate for security-sensitive changes.

Use `TECH.md` and `docs/guides/TESTING_AND_CONTRACTS.md` for exact command sequences.

## Baseline Verification Snapshot

Verified on March 19, 2026:

- `.\gradlew.bat javaMigrationAudit --no-daemon`: passed. Gradle still discards the configuration cache for the custom `jdeprscanMain` and `jdepsMain` `Exec` tasks, but the audit completed successfully.
- `.\gradlew.bat test`: passed.
- `npm run contract:check`: passed.
- `npm run lint`: passed.
- `npm run test -- --watch=false`: passed.
- `npm run build`: passed.
- `.\security-scan.ps1 -FailOnFindings`: passed with zero findings.
- Targeted auth hardening checks: `JwtTokenProviderTest`, `AuthServiceTest`, and `AuthControllerIntegrationTest` passed after the durable revocation and request-boundary changes.
- `.\run-all.ps1`, seeded admin login (`admin` / `dogbert`), logout, revoked-token `/api/auth/me` re-check, CORS preflight allow and deny checks, and `.\stop-all.ps1`: stack started and stopped cleanly, backend health reported `UP`, revoked access tokens were blocked, and the explicit CORS allowlist behaved as documented.

Non-gating warnings observed during the same baseline:

- Frontend runtime logs a browser-console warning because `X-Frame-Options` is being set through a `<meta>` tag instead of an HTTP header.
- Frontend tests emit repeated Node warnings about `--localstorage-file` lacking a valid path.
- Chart tests emit container-size warnings under jsdom while still passing.

## Final Regression Snapshot

Verified on March 20, 2026:

- `.\gradlew.bat javaMigrationAudit --no-daemon`, `.\gradlew.bat test`, and `.\gradlew.bat build`: passed. The Java audit still reports the existing Gradle configuration-cache discard warnings for `jdeprscanMain` and `jdepsMain`, but the audit itself succeeds.
- `npm run contract:check`, `npm run lint`, `npm run test -- --watch=false`, and `npm run build`: passed.
- `.\security-scan.ps1 -FailOnFindings`: passed with zero findings.
- `.\run.ps1` backend smoke: passed. Backend health returned `UP`, seeded admin login (`admin` / `dogbert`) succeeded, and the authenticated backtest-algorithm catalog returned the current nine-strategy set from local source.
- `.\run-all.ps1` full-stack smoke: passed after rebuilding the compose image for service `algotrading-app` with the repo-local `JWT_SECRET`. Frontend login succeeded, the WebSocket transport connected, the Backtest Lab loaded current data, and smoke backtest `#361` completed on dataset `#11` (`Runtime Verification Dataset`) with the detail charts and recorded trade series rendered in the UI.
- The compose-backed smoke run completed too quickly to show a pushed progress event, so the detail view still reported `Last pushed event: No live progress event received yet` even though the page stayed on the live WebSocket transport path and the run finished successfully.
- A parallel-only tooling caveat remains: launching `.\gradlew.bat test` and `.\gradlew.bat build` at the same time can race on Gradle's `build/test-results` temp files. Sequential reruns pass and remain the documented gate.
- Additional non-gating browser warnings remain during runtime smoke: the `X-Frame-Options` meta-tag warning, a React warning about spreading a `key` prop into the dataset picker, and Recharts width or height warnings while charts mount inside initially hidden containers.

## Contradiction Register

No current contradictions are recorded after the March 20 cleanup pass aligned the backtest and dataset-ownership docs with the verified codebase.

## Active Priorities

- Keep canonical docs aligned with the actual system and avoid reintroducing progress-log style documentation.
- Preserve the March 20 verified posture without reintroducing claims that exceed the current single-dataset research evidence.
- Carry the March 20 strategy audit and valid-holdout results into paper follow-up without overstating the single-dataset evidence.
- Extend alerting and review workflows around paper-trading incidents and experiment governance.
- Add market-data providers only when they close a concrete coverage gap not served by the current free-provider set.
- Continue hardening runtime and verification flows without weakening safety defaults.

## Current Constraints

- Backtests and paper trading remain simulation workflows.
- Direct short exposure is available only in research and paper flows when explicitly enabled per strategy.
- Live direct shorting, leverage, and margin remain out of scope in the default path.
- Strict auth is the normal posture; relaxed auth is a local debugging override only.
- Java 25 preview features such as structured concurrency are intentionally not enabled in default runtime paths.
