# Market Data And Research Guide

Use this guide when the task touches provider coverage, dataset imports, provider credentials, or the research data workflow.

## Current Provider Coverage

Public providers without API keys:

- `Binance`
- `Kraken`

Free-tier providers with API keys:

- `Twelve Data`
- `Finnhub`
- `Alpha Vantage`

Supported import timeframes:

- `1m`
- `5m`
- `15m`
- `30m`
- `1h`
- `4h`
- `1d`

## Current Workflow

1. Set `ALGOTRADING_MARKET_DATA_CREDENTIALS_MASTER_KEY` if operators should save keyed credentials from the UI.
2. Save provider credentials in `Settings` or rely on environment variables.
3. Create an import job from the `Market Data` page.
4. Monitor the job until it completes or retries.
5. Use the resulting dataset from the normal backtest catalog.

## Import Job Model

Import jobs are persistent and observable with these statuses:

- `QUEUED`
- `RUNNING`
- `WAITING_RETRY`
- `COMPLETED`
- `FAILED`
- `CANCELLED`

Provider-enforced wait windows move the job to `WAITING_RETRY`; the scheduler resumes it automatically.

## Credential Storage Rules

- UI-saved provider secrets are encrypted in PostgreSQL.
- Operators can attach notes to provider credentials.
- Runtime resolution can fall back to environment variables when present.

Relevant environment variables:

- `ALGOTRADING_MARKET_DATA_CREDENTIALS_MASTER_KEY`
- `ALGOTRADING_MARKET_DATA_TWELVEDATA_API_KEY`
- `ALGOTRADING_MARKET_DATA_FINNHUB_API_KEY`
- `ALGOTRADING_MARKET_DATA_ALPHAVANTAGE_API_KEY`

## Design Rules

1. Normalize provider data into the same dataset catalog used by uploads.
2. Keep provider-specific retry, wait, and pagination behavior visible through job state.
3. Add providers only when they solve a concrete data gap.
4. Keep research guardrails intact: results are simulated, fees and slippage matter, and live leverage or live direct shorting stay out of scope by default.
