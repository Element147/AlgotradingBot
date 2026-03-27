# Roadmap

## Planning Principles

- Local-first delivery over infrastructure-heavy complexity
- Safety-first defaults
- Reproducible verification before claims
- Small, reversible increments
- Current-state docs instead of progress logs

## Now

1. Keep documentation lean and canonical.
2. Deepen experiment review and governance around the backtest workflow.
3. Extend operator alerting beyond the current in-app baseline where justified.
4. Keep the market-data import workflow reliable before expanding provider coverage.

## Next

1. Multi-channel notification routing for important paper-trading and operational incidents.
2. Additional contract hardening where new backend surfaces need generated frontend coverage.
3. Runtime validation and smoke automation around the existing local and Docker entrypoints.
4. Incremental improvements to research reporting and comparison workflows.

## Later

1. Production-readiness automation for container health, startup order, and longer-running stability.
2. Optional live-readiness evaluation only after paper evidence, auditability, rollback paths, and guardrails are all strong enough.
3. Opt-in experiments with preview-only Java features behind explicit non-default profiles.
4. Portfolio lab and capital allocation engine once strategy-level audit evidence is broad enough to support portfolio-level research.
5. Experiment scheduler and governance automation once the frozen audit workflow is stable enough to batch safely.
6. Data quality and venue-constraint intelligence once normalized candle coverage and venue metadata are stable enough to support fail-closed research and paper decisions.

## Follow-On Scope

### Portfolio Lab And Capital Allocation Engine

Purpose:

- Turn standalone strategy scorecards into portfolio-level research without weakening the current strategy-audit guardrails.

Planned scope:

- Simulate multi-strategy portfolios using the normalized Phase 1 market-data model so allocation studies can pull aligned candles, venue metadata, and timeframe-consistent history across symbols without returning to CSV-in-cell shortcuts.
- Ingest Phase 3 audit outputs as portfolio inputs, meaning only strategy runs with frozen evidence sheets, explicit dispositions, and reproducible dataset identity can enter the portfolio lab as candidate sleeves.
- Keep the first version research-only: no live or paper auto-allocation, no hidden execution path, and no implied promotion from portfolio simulation alone.

Allocation and risk rules to freeze before implementation:

- Max allocation per strategy sleeve, with a configurable cash floor and a hard cap on aggregate deployed capital.
- Correlation-aware caps using rolling return relationships so highly correlated sleeves cannot quietly dominate the same market regime.
- Aggregate portfolio drawdown, open-risk, and turnover budgets that can demote the allocator back to cash instead of forcing exposure.
- Separate allowance buckets for `paper-monitor candidate`, `research-only`, and rejected/archive strategies so lower-quality evidence cannot silently absorb equal capital.

Required outputs:

- Portfolio equity, drawdown, and exposure curves.
- Per-strategy contribution, turnover, and fee-drag breakdowns.
- Correlation and concentration summaries that explain why the allocator increased, reduced, or blocked a sleeve.
- Reproducible experiment metadata tying every portfolio result back to the exact strategy evidence inputs, datasets, and allocation rules used.

Dependencies and entry gates:

- Depends on the normalized `market_data_series`, `market_data_candle_segments`, and `market_data_candles` ownership from Phase 1 so cross-strategy simulation can query aligned historical data safely.
- Depends on the frozen strategy-audit outputs from Phase 3, including disposition labels and evidence sheets, so portfolio research can distinguish baseline sleeves from candidate sleeves honestly.
- Should not start until the strategy audit pack includes enough cross-dataset coverage that portfolio weights are not built on one lucky single-dataset result.

### Experiment Scheduler And Governance Automation

Purpose:

- Batch backtests, walk-forward studies, and controlled parameter sweeps without letting automation turn into silent parameter fishing.

Planned scope:

- Add a scheduler for repeatable backtests, walk-forward batches, benchmark reruns, and explicitly bounded parameter sweeps tied to saved experiment definitions instead of ad hoc one-off commands.
- Keep the first version local-first and operator-visible: scheduled work should create explicit jobs, audit events, and comparison artifacts rather than running as an opaque background optimizer.
- Route all experiment automation through the existing backtest command/query seams, async monitoring model, and audit infrastructure instead of inventing a separate execution path.

Metadata, retention, and promotion rules to freeze before implementation:

- Every scheduled experiment must store strategy ID, parameter version, dataset identity, timeframe, cost assumptions, split definition, scheduler origin, and operator approval state.
- Sweep definitions must preserve the full tested parameter grid, not just the winning row, so later reviewers can see how much searching occurred.
- Retention rules should keep experiment definitions and summary scorecards longer than raw telemetry blobs, while still preserving enough evidence to reproduce any promoted result.
- Promotion rules must require explicit approval checkpoints before an experiment can move from exploratory batch work into a report that affects catalog disposition or paper-monitor discussion.

Anti-parameter-fishing requirements:

- Require pre-declared sweep ranges, caps on simultaneous combinations, and explicit rationale for each batch so automation cannot quietly widen the search after seeing results.
- Preserve immutable links between each result and the exact config set that produced it, including rejected combinations.
- Make comparison reports show both the selected candidates and the surrounding failed or weak runs so reviewers can detect curve-fitting pressure.

Required outputs:

- Durable experiment definitions, run manifests, and comparison summaries.
- Batch-level result storage that can feed the existing compare and export workflows without losing reproducibility.
- Alerting hooks for completed, failed, or approval-blocked experiment batches so operators do not have to poll manually.
- Approval and audit records explaining who scheduled, approved, rejected, or promoted each batch and why.

Dependencies and entry gates:

- Depends on the current async backtest execution and monitoring seams so scheduled work can reuse existing queue, retry, and failure visibility.
- Depends on the frozen strategy-audit methodology and Phase 3 evidence posture so automated batches cannot bypass the same cost, holdout, and reporting rules used for manual audits.
- Should not start until the portfolio and audit roadmap items define which outputs are promotion-relevant versus exploratory-only.

### Data Quality And Venue-Constraint Intelligence

Purpose:

- Close the realism gap between clean theoretical signals and actually placeable orders by treating bad candles, incomplete coverage, unadjusted equity history, and venue-rule mismatches as first-class failures instead of silent assumptions.

Planned scope:

- Add anomaly detection on the normalized market-data store for missing coverage windows, duplicate buckets, timestamp disorder, impossible OHLC relationships, zero or negative price or volume rows, suspicious flatline segments, abnormal return spikes, and session or timeframe mismatches.
- Add equity and ETF adjustment intelligence so split, dividend, and adjusted-versus-unadjusted lineage is explicit; mixed or stale price bases should be flagged before a backtest or comparison result is trusted.
- Ingest broker and exchange execution constraints as durable symbol metadata, including tick size, lot size, minimum notional, fractional-share support, session calendar, shortability or borrow posture, inverse-ETF eligibility, and account-mode restrictions where they affect order realism.
- Keep the first version operator-visible and fail-closed: suspicious datasets, stale venue rules, or unplaceable order assumptions should block promotion and paper-follow-up until the anomaly or constraint gap is reviewed explicitly.

Fail-closed and governance rules to freeze before implementation:

- Reject or quarantine datasets with unresolved critical anomalies instead of silently repairing them on the hot path.
- Fail closed when a strategy, paper workflow, or later live-monitor path lacks the venue metadata needed to decide whether an order is valid.
- Preserve anomaly provenance so operators can trace a rejected candle range or venue rule back to the source dataset, import batch, or metadata refresh.
- Surface skipped-trade reasons explicitly when minimum-order, lot-size, tick-size, fractional-share, or session rules prevent an otherwise valid signal from becoming a placeable order.

Required outputs:

- Dataset and series quality scorecards with severity-tagged anomaly findings and reviewed/unreviewed state.
- Venue-rule snapshots per symbol or broker or exchange context, including freshness metadata and the constraints that affected simulated or paper-safe orders.
- Operator-facing skipped-trade and blocked-order explanations so research reports can distinguish weak strategy logic from impossible execution assumptions.
- Audit-friendly reports tying anomaly outcomes and venue constraints back to the exact dataset, symbol, timeframe, and workflow that encountered them.

Dependencies and entry gates:

- Depends on the normalized `market_data_series`, `market_data_candle_segments`, and `market_data_candles` ownership from Phase 1 so anomaly scans, coverage checks, and price-basis lineage stay tied to authoritative relational provenance instead of bypassing the new store.
- Depends on the small-account execution rules in `docs/SMALL_ACCOUNT_EXECUTION_CONSTRAINTS.md` and the strategy-spec or audit posture from Phase 3 so venue checks align with the existing long-or-cash defaults, minimum-order rules, and honest reporting standards.
- Should not start by inventing a sidecar execution model; the intended design extends the current backtest, paper, import, and audit seams with richer data-quality and venue metadata rather than routing around them.

### Incident Notifications And Operator Automation

Purpose:

- Extend the current in-app incident cues into explicit operator workflows so paper and later live-monitoring incidents are routed, acknowledged, and documented consistently without creating an unsupervised execution path.

Planned scope:

- Define one incident catalog across paper-trading state, market-data imports, risk breakers, connectivity posture, auth failures, stale telemetry, failed scheduled research work, and future live-monitor capability checks so every alert has an explicit severity, owner, and default handling rule.
- Add multi-channel routing on top of the current in-app baseline, starting with operator-visible channels such as inbox or UI timeline, email, webhook, or desktop-safe notifications, while keeping environment-aware defaults conservative.
- Add recurring health checks for the local-first stack, including WebSocket degradation, stale paper orders or positions, failed imports, circuit-breaker trips, exchange-profile connectivity, dataset freshness, and other operator-visible conditions that are currently only discoverable by manually scanning the UI.
- Pair every actionable incident with a runbook entry, acknowledgement workflow, suppression or snooze rules, and explicit escalation guidance so operators know whether to investigate, retry, override, or stay fail-closed.
- Keep the first version operator-in-the-loop: notifications may open review work, but they must not trigger autonomous trading, parameter changes, or hidden environment switches.

Severity, routing, and governance rules to freeze before implementation:

- Separate informational events from actionable incidents and urgent attention-required failures so low-signal churn does not drown out real paper or live-monitor problems.
- Keep default routing conservative: research noise can stay in-app, while paper-trading incidents, risk-breaker trips, repeated import failures, or live-monitor capability regressions can escalate to additional channels only when explicitly enabled.
- Require durable acknowledgement, assignee, and resolution metadata for any incident that leaves the in-app surface, and record who suppressed or re-opened it and why.
- Deduplicate and rate-limit repeated notifications so transport reconnect loops, repeated stale-state checks, or recurring provider failures do not spam operators without adding new information.
- Preserve fail-closed behavior: if an alerting channel is unavailable, the trading or monitoring workflow must remain safe and continue showing the incident in the local UI instead of assuming someone was notified elsewhere.

Required outputs:

- An incident catalog that maps each event family to severity, environment, default route, escalation threshold, and required operator response.
- Operator-facing notification timelines and acknowledgement history tied back to the existing audit trail.
- Recurring health-check results with explicit last-run, pass or fail state, linked runbook guidance, and durable failure summaries.
- Runbook-oriented summaries that explain the context, recommended next step, and whether the incident is informational, retryable, override-gated, or blocking.

Dependencies and entry gates:

- Depends on the current WebSocket transport, async-monitor responses, and execution-workspace incident surfaces so notifications reuse the same state already visible in Backtest, Forward Testing, Paper, Live, Risk, and Market Data.
- Depends on the durable operator-audit infrastructure so acknowledgements, suppressions, escalation changes, and runbook-triggered actions remain attributable and reviewable.
- Should extend the current in-app incident baseline instead of inventing a disconnected notification subsystem or bypassing the existing paper-safe and monitor-only guardrails.

## Strategy R&D Focus Order

1. Validate the current trend-first catalog under realistic costs.
2. Improve regime handling and cross-strategy comparison.
3. Add short-proxy behavior only behind explicit safety gates.
4. Keep leverage and direct margin shorting out of the default path.

## Exit Criteria

A roadmap item is only considered complete when:

- relevant verification passes
- docs match verified behavior
- guardrails are unchanged or stronger
- open risks remain visible
