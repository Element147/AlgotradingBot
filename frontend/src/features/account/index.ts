/**
 * Account feature module
 * 
 * Provides API endpoints and hooks for account balance and performance data.
 */

export { accountApi, useGetBalanceQuery, useGetPerformanceQuery } from './accountApi';
export type { BalanceData, PerformanceMetrics, PerformanceTimeframe } from './accountApi';
export { useAccountBalance } from './useAccountBalance';
