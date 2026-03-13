# Market Data and Research Guide

Read this guide when the task touches the downloader, dataset imports, provider credentials, or strategy research workflow.

## Current Provider Coverage

Built-in public providers with no API key:

- `Binance`
- `Kraken`

Built-in free-tier providers with API keys:

- `Twelve Data`
- `Finnhub`
- `Alpha Vantage`

Supported download/import timeframes:

- `1m`
- `5m`
- `15m`
- `30m`
- `1h`
- `4h`
- `1d`

## Operator Flow

1. Set `ALGOTRADING_MARKET_DATA_CREDENTIALS_MASTER_KEY` if operators should save keyed-provider credentials from the UI.
2. Start the app.
3. Open `Settings` -> `API Config` to save a provider key plus note, or rely on backend environment variables.
4. Open the `Market Data` tab, create an import job, and monitor status there.
5. Completed jobs import directly into the backtest dataset catalog.

## Import Job Model

Import jobs are persistent and observable:

- `QUEUED`
- `RUNNING`
- `WAITING_RETRY`
- `COMPLETED`
- `FAILED`
- `CANCELLED`

Provider wait windows move a job to `WAITING_RETRY`; the scheduler resumes automatically.

## Credential Storage Rules

- Frontend-saved provider secrets are stored encrypted in PostgreSQL.
- Operators can attach notes to saved provider credentials.
- Runtime resolution can fall back to environment variables when present.

Relevant environment variables:

- `ALGOTRADING_MARKET_DATA_CREDENTIALS_MASTER_KEY`
- `ALGOTRADING_MARKET_DATA_TWELVEDATA_API_KEY`
- `ALGOTRADING_MARKET_DATA_FINNHUB_API_KEY`
- `ALGOTRADING_MARKET_DATA_ALPHAVANTAGE_API_KEY`

## Research Guardrails

- Backtests and paper results remain research artifacts, not proof of profitability.
- Fees, slippage, and out-of-sample thinking stay mandatory in research claims.
- Paper/backtest short exposure is optional and explicit.
- Live direct shorting, leverage, and margin remain out of scope in the default path.
