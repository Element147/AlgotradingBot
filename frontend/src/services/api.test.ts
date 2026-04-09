import { describe, expect, it } from 'vitest';

import {
  isExpectedLiveReadCapabilityConflict,
  withEnvironmentMode,
  withExecutionContext,
} from './api';

describe('isExpectedLiveReadCapabilityConflict', () => {
  it('suppresses expected live account-read conflicts', () => {
    expect(
      isExpectedLiveReadCapabilityConflict(
        409,
        withExecutionContext('/api/account/balance', 'live')
      )
    ).toBe(true);
    expect(
      isExpectedLiveReadCapabilityConflict(
        409,
        withExecutionContext(
          { url: '/api/trades/recent', params: { limit: 8 } },
          'live'
        )
      )
    ).toBe(true);
  });

  it('keeps other conflicts visible', () => {
    expect(
      isExpectedLiveReadCapabilityConflict(
        409,
        withEnvironmentMode('/api/account/balance', 'test')
      )
    ).toBe(false);
    expect(
      isExpectedLiveReadCapabilityConflict(
        409,
        withEnvironmentMode('/api/system/info', 'live')
      )
    ).toBe(false);
    expect(isExpectedLiveReadCapabilityConflict(500, '/api/account/balance')).toBe(false);
  });
});
