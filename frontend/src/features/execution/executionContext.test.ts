import { describe, expect, it } from 'vitest';

import {
  executionContextMeta,
  resolveExecutionEnvironment,
  resolveRouteExecutionContext,
} from './executionContext';

describe('executionContext', () => {
  it('maps execution contexts to backend environments', () => {
    expect(resolveExecutionEnvironment('research')).toBe('test');
    expect(resolveExecutionEnvironment('forward-test')).toBe('test');
    expect(resolveExecutionEnvironment('paper')).toBe('test');
    expect(resolveExecutionEnvironment('live')).toBe('live');
  });

  it('pins research and paper routes to explicit contexts', () => {
    expect(resolveRouteExecutionContext('/backtest')).toEqual(executionContextMeta.research);
    expect(resolveRouteExecutionContext('/market-data/jobs')).toEqual(executionContextMeta.research);
    expect(resolveRouteExecutionContext('/paper')).toEqual(executionContextMeta.paper);
    expect(resolveRouteExecutionContext('/settings')).toBeNull();
  });
});
