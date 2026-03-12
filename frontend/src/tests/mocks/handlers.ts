import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8080';

/**
 * MSW request handlers for mocking backend API responses
 *
 * These handlers are used in integration tests to simulate
 * backend responses without making actual network requests.
 */
export const handlers = [
  // Login endpoint - success
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
      rememberMe?: boolean;
    };

    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token-12345',
        refreshToken: body.rememberMe ? 'mock-refresh-token-67890' : undefined,
        user: {
          id: 'user-123',
          username: 'testuser',
          role: 'trader',
        },
        expiresIn: 3600,
      });
    }

    return HttpResponse.json(
      {
        message: 'Invalid username or password',
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }),

  // Logout endpoint
  http.post(`${API_BASE_URL}/api/auth/logout`, () =>
    HttpResponse.json({ message: 'Logged out successfully' })
  ),

  // Token refresh endpoint - success
  http.post(`${API_BASE_URL}/api/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };

    if (body.refreshToken === 'mock-refresh-token-67890') {
      return HttpResponse.json({
        token: 'mock-jwt-token-refreshed',
        expiresIn: 3600,
      });
    }

    return HttpResponse.json(
      {
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }),

  // Get current user endpoint
  http.get(`${API_BASE_URL}/api/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (
      authHeader === 'Bearer mock-jwt-token-12345' ||
      authHeader === 'Bearer mock-jwt-token-refreshed'
    ) {
      return HttpResponse.json({
        id: 'user-123',
        username: 'testuser',
        role: 'trader',
      });
    }

    return HttpResponse.json(
      {
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }),

  // Protected endpoint that returns 401 to test token refresh
  http.get(`${API_BASE_URL}/api/protected`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader === 'Bearer mock-jwt-token-expired') {
      return HttpResponse.json(
        {
          message: 'Token expired',
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    if (
      authHeader === 'Bearer mock-jwt-token-12345' ||
      authHeader === 'Bearer mock-jwt-token-refreshed'
    ) {
      return HttpResponse.json({
        message: 'Access granted',
        data: 'Protected data',
      });
    }

    return HttpResponse.json(
      {
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }),

  // Account balance endpoint
  http.get(`${API_BASE_URL}/api/account/balance`, () =>
    HttpResponse.json({
      total: '10000.00',
      available: '8500.00',
      locked: '1500.00',
      assets: [
        {
          symbol: 'USD',
          amount: '8500.00',
          valueUSD: '8500.00',
        },
        {
          symbol: 'BTC',
          amount: '0.025',
          valueUSD: '1500.00',
        },
      ],
      lastSync: '2026-03-09T12:00:00Z',
    })
  ),

  http.get(`${API_BASE_URL}/api/exchange/connections`, () =>
    HttpResponse.json({
      activeConnectionId: 'binance-paper',
      connections: [
        {
          id: 'binance-paper',
          name: 'Binance Paper',
          exchange: 'binance',
          apiKey: '',
          apiSecret: '',
          testnet: true,
          active: true,
          updatedAt: '2026-03-12T12:00:00',
        },
      ],
    })
  ),
  http.post(`${API_BASE_URL}/api/exchange/connections`, async ({ request }) =>
    {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: 'saved-connection',
        active: false,
        updatedAt: '2026-03-12T12:00:00',
        ...body,
      });
    }
  ),
  http.put(`${API_BASE_URL}/api/exchange/connections/:connectionId`, async ({ request, params }) =>
    {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: String(params.connectionId),
        active: false,
        updatedAt: '2026-03-12T12:00:00',
        ...body,
      });
    }
  ),
  http.post(`${API_BASE_URL}/api/exchange/connections/:connectionId/activate`, ({ params }) =>
    HttpResponse.json({
      id: String(params.connectionId),
      name: 'Activated Connection',
      exchange: 'binance',
      apiKey: '',
      apiSecret: '',
      testnet: true,
      active: true,
      updatedAt: '2026-03-12T12:00:00',
    })
  ),
  http.delete(`${API_BASE_URL}/api/exchange/connections/:connectionId`, () =>
    new HttpResponse(null, { status: 204 })
  ),

  // Account performance endpoint
  http.get(`${API_BASE_URL}/api/account/performance`, ({ request }) => {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') ?? 'today';

    return HttpResponse.json({
      totalProfitLoss: timeframe === 'all' ? '1250.00' : '125.00',
      profitLossPercentage: timeframe === 'all' ? '12.50' : '1.25',
      winRate: '58.3',
      tradeCount: timeframe === 'all' ? 48 : 6,
      cashRatio: '85.0',
    });
  }),

  // Strategy management endpoints
  http.get(`${API_BASE_URL}/api/strategies`, () =>
    HttpResponse.json([
      {
        id: 1,
        name: 'Bollinger BTC Mean Reversion',
        type: 'bollinger-bands',
        status: 'STOPPED',
        symbol: 'BTC/USDT',
        timeframe: '1h',
        riskPerTrade: 0.02,
        minPositionSize: 10,
        maxPositionSize: 100,
        profitLoss: 0,
        tradeCount: 0,
        currentDrawdown: 0,
        paperMode: true,
        shortSellingEnabled: true,
        configVersion: 1,
        lastConfigChangedAt: '2026-03-10T10:00:00',
      },
    ])
  ),
  http.post(`${API_BASE_URL}/api/strategies/:strategyId/start`, ({ params }) =>
    HttpResponse.json({
      strategyId: Number(params.strategyId),
      status: 'RUNNING',
      message: 'Strategy started in paper mode',
    })
  ),
  http.post(`${API_BASE_URL}/api/strategies/:strategyId/stop`, ({ params }) =>
    HttpResponse.json({
      strategyId: Number(params.strategyId),
      status: 'STOPPED',
      message: 'Strategy stopped',
    })
  ),
  http.put(`${API_BASE_URL}/api/strategies/:strategyId/config`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: Number(params.strategyId),
      name: 'Bollinger BTC Mean Reversion',
      type: 'bollinger-bands',
      status: 'STOPPED',
      ...body,
      profitLoss: 0,
      tradeCount: 0,
      currentDrawdown: 0,
      paperMode: true,
      shortSellingEnabled: true,
      configVersion: 2,
      lastConfigChangedAt: '2026-03-10T10:05:00',
    });
  }),
  http.get(`${API_BASE_URL}/api/strategies/:strategyId/config-history`, ({ params }) =>
    HttpResponse.json([
      {
        id: 20,
        versionNumber: 2,
        changeReason: 'Updated symbol, timeframe',
        symbol: 'ETH/USDT',
        timeframe: '4h',
        riskPerTrade: 0.03,
        minPositionSize: 20,
        maxPositionSize: 120,
        status: 'STOPPED',
        paperMode: true,
        shortSellingEnabled: true,
        changedAt: '2026-03-10T10:05:00',
      },
      {
        id: 10,
        versionNumber: 1,
        changeReason: `Seeded configuration for strategy ${String(params.strategyId ?? 'unknown')}`,
        symbol: 'BTC/USDT',
        timeframe: '1h',
        riskPerTrade: 0.02,
        minPositionSize: 10,
        maxPositionSize: 100,
        status: 'STOPPED',
        paperMode: true,
        shortSellingEnabled: true,
        changedAt: '2026-03-10T10:00:00',
      },
    ])
  ),

  // Backtest endpoints
  http.get(`${API_BASE_URL}/api/backtests/algorithms`, () =>
    HttpResponse.json([
      {
        id: 'BOLLINGER_BANDS',
        label: 'Bollinger Bands',
        description: 'Mean-reversion bands strategy',
        selectionMode: 'SINGLE_SYMBOL',
      },
      {
        id: 'SMA_CROSSOVER',
        label: 'SMA Crossover',
        description: 'Fast/slow moving average crossover',
        selectionMode: 'SINGLE_SYMBOL',
      },
      {
        id: 'BUY_AND_HOLD',
        label: 'Buy and Hold',
        description: 'Baseline hold from first to last candle',
        selectionMode: 'SINGLE_SYMBOL',
      },
    ])
  ),
  http.get(`${API_BASE_URL}/api/backtests/datasets`, () =>
    HttpResponse.json([
      {
        id: 7,
        name: 'BTC 1h 2025',
        originalFilename: 'btc_2025.csv',
        rowCount: 1000,
        symbolsCsv: 'BTC/USDT,ETH/USDT',
        dataStart: '2025-01-01T00:00:00',
        dataEnd: '2025-12-31T23:00:00',
        uploadedAt: '2026-03-10T10:00:00',
        checksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        schemaVersion: 'ohlcv-v1',
        archived: false,
        archivedAt: null,
        archiveReason: null,
        usageCount: 1,
        lastUsedAt: '2026-03-10T10:00:00',
        usedByBacktests: true,
        duplicateCount: 1,
        retentionStatus: 'ACTIVE',
      },
    ])
  ),
  http.get(`${API_BASE_URL}/api/backtests/datasets/retention-report`, () =>
    HttpResponse.json({
      totalDatasets: 1,
      activeDatasets: 1,
      archivedDatasets: 0,
      archiveCandidateDatasets: 0,
      duplicateDatasetCount: 0,
      referencedDatasetCount: 1,
      oldestActiveUploadedAt: '2026-03-10T10:00:00',
      newestUploadedAt: '2026-03-10T10:00:00',
    })
  ),
  http.post(`${API_BASE_URL}/api/backtests/datasets/upload`, () =>
    HttpResponse.json({
      id: 8,
      name: 'Uploaded dataset',
      originalFilename: 'upload.csv',
      rowCount: 240,
      symbolsCsv: 'BTC/USDT',
      dataStart: '2025-01-01T00:00:00',
      dataEnd: '2025-01-10T23:00:00',
      uploadedAt: '2026-03-10T10:01:00',
      checksumSha256: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      schemaVersion: 'ohlcv-v1',
      archived: false,
      archivedAt: null,
      archiveReason: null,
      usageCount: 0,
      lastUsedAt: null,
      usedByBacktests: false,
      duplicateCount: 1,
      retentionStatus: 'ACTIVE',
    })
  ),
  http.post(`${API_BASE_URL}/api/backtests/datasets/:datasetId/archive`, ({ params }) =>
    HttpResponse.json({
      id: Number(params.datasetId),
      name: 'BTC 1h 2025',
      originalFilename: 'btc_2025.csv',
      rowCount: 1000,
      symbolsCsv: 'BTC/USDT,ETH/USDT',
      dataStart: '2025-01-01T00:00:00',
      dataEnd: '2025-12-31T23:00:00',
      uploadedAt: '2026-03-10T10:00:00',
      checksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      schemaVersion: 'ohlcv-v1',
      archived: true,
      archivedAt: '2026-03-12T10:00:00',
      archiveReason: 'Archived from active inventory after lifecycle review.',
      usageCount: 1,
      lastUsedAt: '2026-03-10T10:00:00',
      usedByBacktests: true,
      duplicateCount: 1,
      retentionStatus: 'ARCHIVED',
    })
  ),
  http.post(`${API_BASE_URL}/api/backtests/datasets/:datasetId/restore`, ({ params }) =>
    HttpResponse.json({
      id: Number(params.datasetId),
      name: 'BTC 1h 2025',
      originalFilename: 'btc_2025.csv',
      rowCount: 1000,
      symbolsCsv: 'BTC/USDT,ETH/USDT',
      dataStart: '2025-01-01T00:00:00',
      dataEnd: '2025-12-31T23:00:00',
      uploadedAt: '2026-03-10T10:00:00',
      checksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      schemaVersion: 'ohlcv-v1',
      archived: false,
      archivedAt: null,
      archiveReason: null,
      usageCount: 1,
      lastUsedAt: '2026-03-10T10:00:00',
      usedByBacktests: true,
      duplicateCount: 1,
      retentionStatus: 'ACTIVE',
    })
  ),
  http.get(`${API_BASE_URL}/api/backtests`, () =>
    HttpResponse.json([
      {
        id: 42,
        strategyId: 'BOLLINGER_BANDS',
        datasetName: 'BTC 1h 2025',
        symbol: 'BTC/USDT',
        timeframe: '1h',
        executionStatus: 'COMPLETED',
        validationStatus: 'PASSED',
        feesBps: 10,
        slippageBps: 3,
        timestamp: '2026-03-10T10:00:00',
        initialBalance: 1000,
        finalBalance: 1080,
      },
    ])
  ),
  http.get(`${API_BASE_URL}/api/backtests/:id`, ({ params }) =>
    HttpResponse.json({
      id: Number(params.id),
      strategyId: 'BOLLINGER_BANDS',
      datasetId: 7,
      datasetName: 'BTC 1h 2025',
      datasetChecksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      datasetSchemaVersion: 'ohlcv-v1',
      datasetUploadedAt: '2026-03-10T10:00:00',
      datasetArchived: false,
      symbol: 'BTC/USDT',
      timeframe: '1h',
      executionStatus: 'COMPLETED',
      validationStatus: 'PASSED',
      feesBps: 10,
      slippageBps: 3,
      timestamp: '2026-03-10T10:00:00',
      initialBalance: 1000,
      finalBalance: 1080,
      sharpeRatio: 1.2,
      profitFactor: 1.6,
      winRate: 52.0,
      maxDrawdown: 18.0,
      totalTrades: 80,
      startDate: '2025-01-01T00:00:00',
      endDate: '2025-12-31T00:00:00',
      errorMessage: null,
      equityCurve: [
        { timestamp: '2025-01-01T00:00:00', equity: 1000, drawdownPct: 0 },
        { timestamp: '2025-01-02T00:00:00', equity: 1080, drawdownPct: 0 },
      ],
      tradeSeries: [
        {
          symbol: 'BTC/USDT',
          side: 'LONG',
          entryTime: '2025-01-01T00:00:00',
          exitTime: '2025-01-02T00:00:00',
          entryPrice: 100,
          exitPrice: 108,
          quantity: 9.5,
          entryValue: 950,
          exitValue: 1026,
          returnPct: 8,
        },
      ],
    })
  ),
  http.get(`${API_BASE_URL}/api/backtests/compare`, ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.getAll('ids').map((value) => Number(value));

    return HttpResponse.json({
      baselineBacktestId: ids[0] ?? 42,
      items: [
        {
          id: ids[0] ?? 42,
          strategyId: 'BOLLINGER_BANDS',
          datasetName: 'BTC 1h 2025',
          datasetChecksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          datasetSchemaVersion: 'ohlcv-v1',
          datasetUploadedAt: '2026-03-10T10:00:00',
          datasetArchived: false,
          symbol: 'BTC/USDT',
          timeframe: '1h',
          executionStatus: 'COMPLETED',
          validationStatus: 'PASSED',
          feesBps: 10,
          slippageBps: 3,
          timestamp: '2026-03-10T10:00:00',
          initialBalance: 1000,
          finalBalance: 1080,
          totalReturnPercent: 8,
          sharpeRatio: 1.2,
          profitFactor: 1.6,
          winRate: 52,
          maxDrawdown: 18,
          totalTrades: 80,
          finalBalanceDelta: 0,
          totalReturnDeltaPercent: 0,
        },
        {
          id: ids[1] ?? 43,
          strategyId: 'SMA_CROSSOVER',
          datasetName: 'BTC 1h 2025',
          datasetChecksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          datasetSchemaVersion: 'ohlcv-v1',
          datasetUploadedAt: '2026-03-10T10:00:00',
          datasetArchived: false,
          symbol: 'BTC/USDT',
          timeframe: '1h',
          executionStatus: 'COMPLETED',
          validationStatus: 'FAILED',
          feesBps: 10,
          slippageBps: 3,
          timestamp: '2026-03-11T10:00:00',
          initialBalance: 1000,
          finalBalance: 950,
          totalReturnPercent: -5,
          sharpeRatio: 0.8,
          profitFactor: 1.1,
          winRate: 45,
          maxDrawdown: 22,
          totalTrades: 48,
          finalBalanceDelta: -130,
          totalReturnDeltaPercent: -13,
        },
      ],
    });
  }),
  http.post(`${API_BASE_URL}/api/backtests/run`, () =>
    HttpResponse.json({
      id: 43,
      status: 'PENDING',
      submittedAt: '2026-03-10T10:01:00',
    })
  ),

  // Risk endpoints
  http.get(`${API_BASE_URL}/api/risk/status`, () =>
    HttpResponse.json({
      currentDrawdown: 10,
      maxDrawdownLimit: 25,
      dailyLoss: 2,
      dailyLossLimit: 5,
      openRiskExposure: 20,
      positionCorrelation: 35,
      circuitBreakerActive: false,
      circuitBreakerReason: '',
    })
  ),
  http.get(`${API_BASE_URL}/api/risk/config`, () =>
    HttpResponse.json({
      maxRiskPerTrade: 0.02,
      maxDailyLossLimit: 0.05,
      maxDrawdownLimit: 0.25,
      maxOpenPositions: 5,
      correlationLimit: 0.75,
      circuitBreakerActive: false,
      circuitBreakerReason: '',
    })
  ),
  http.put(`${API_BASE_URL}/api/risk/config`, async ({ request }) =>
    HttpResponse.json(await request.json())
  ),
  http.post(`${API_BASE_URL}/api/risk/circuit-breaker/override`, async ({ request }) =>
    HttpResponse.json(await request.json())
  ),
  http.get(`${API_BASE_URL}/api/risk/alerts`, () =>
    HttpResponse.json([])
  ),

  // Paper state endpoint
  http.get(`${API_BASE_URL}/api/paper/state`, () =>
    HttpResponse.json({
      paperMode: true,
      cashBalance: 10000,
      positionCount: 2,
      totalOrders: 12,
      openOrders: 1,
      filledOrders: 10,
      cancelledOrders: 1,
      lastOrderAt: '2026-03-10T10:00:00',
      lastPositionUpdateAt: '2026-03-10T10:05:00',
      staleOpenOrderCount: 0,
      stalePositionCount: 0,
      recoveryStatus: 'HEALTHY',
      recoveryMessage: 'No stale paper-trading state detected after the latest activity.',
    })
  ),
];
