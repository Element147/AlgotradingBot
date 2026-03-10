import { useSelector } from 'react-redux';

import { useGetBalanceQuery } from './accountApi';

import type { RootState } from '@/app/store';

/**
 * Custom hook for fetching account balance with environment-aware polling
 * 
 * Features:
 * - Automatically polls every 60 seconds in live mode
 * - No polling in test mode
 * - Respects environment mode from Redux state
 * 
 * @returns RTK Query result with balance data
 */
export const useAccountBalance = () => {
  const environmentMode = useSelector((state: RootState) => state.environment.mode);

  // Enable polling only in live mode (60 second interval)
  const pollingInterval = environmentMode === 'live' ? 60000 : 0;

  return useGetBalanceQuery(undefined, {
    pollingInterval,
    // Skip polling when tab is not visible
    skipPollingIfUnfocused: true,
  });
};
