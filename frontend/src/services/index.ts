/**
 * Services Module
 * 
 * Exports all API clients and utilities for external service integration
 */

// RTK Query base configuration (preferred for standard CRUD operations)
export { baseQueryWithEnvironment, baseQueryWithRetry, baseQueryWithErrorHandling } from './api';

// Axios client (for file uploads, downloads, and non-standard API calls)
export { default as axiosClient, getErrorMessage, retryWithBackoff } from './axiosClient';

// Future exports:
// - WebSocket service (task 2.6)
// - Export service for CSV/PDF (task 4.9, 5.11)
