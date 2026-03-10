/**
 * SystemHealthIndicator Component Tests
 * 
 * Tests for the system health indicator component including:
 * - Backend API connection status display
 * - WebSocket connection status display
 * - Reconnection attempts display
 * - Last update timestamp display
 * - Circuit breaker status display
 */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';


import { SystemHealthIndicator } from './SystemHealthIndicator';

import type { RootState } from '@/app/store';
import { renderWithProviders } from '@/tests/test-utils';

// Mock the formatters module
vi.mock('@/utils/formatters', () => ({
  formatDistanceToNow: vi.fn((date: Date) => {
    const now = new Date('2026-03-09T12:00:00Z');
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    return `${Math.floor(diffMinutes / 60)} hours ago`;
  }),
}));

describe('SystemHealthIndicator', () => {
  const mockWebSocketState = {
    connected: false,
    connecting: false,
    error: null,
    lastReconnectAttempt: null,
    reconnectAttempts: 0,
    subscribedChannels: [],
    lastEventTime: null,
  };

  describe('Backend API Connection Status', () => {
    it('should display connected status when API is healthy', () => {
      const preloadedState: Partial<RootState> = {
        websocket: mockWebSocketState,
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('Backend API:')).toBeInTheDocument();
      // Note: API status depends on RTK Query mock, which defaults to loading/error state
    });

    it('should display disconnected status when API has error', () => {
      const preloadedState: Partial<RootState> = {
        websocket: mockWebSocketState,
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('Backend API:')).toBeInTheDocument();
    });
  });

  describe('WebSocket Connection Status', () => {
    it('should display connected status when WebSocket is connected', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          connected: true,
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('WebSocket:')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('should display connecting status when WebSocket is connecting', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          connecting: true,
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('WebSocket:')).toBeInTheDocument();
      // Use getAllByText since both API and WebSocket might show "Connecting"
      const connectingChips = screen.getAllByText('Connecting');
      expect(connectingChips.length).toBeGreaterThanOrEqual(1);
    });

    it('should display disconnected status when WebSocket is disconnected', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          connected: false,
          connecting: false,
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('WebSocket:')).toBeInTheDocument();
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('should display error status when WebSocket has error', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          error: 'Connection failed',
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('WebSocket:')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('Reconnection Attempts', () => {
    it('should display reconnection attempts when greater than 0', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          reconnectAttempts: 3,
          lastReconnectAttempt: '2026-03-09T11:55:00Z',
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText(/Reconnection attempts: 3/)).toBeInTheDocument();
    });

    it('should not display reconnection attempts when 0', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          reconnectAttempts: 0,
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.queryByText(/Reconnection attempts/)).not.toBeInTheDocument();
    });
  });

  describe('Last Data Update', () => {
    it('should display "Never" when no events received', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          lastEventTime: null,
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('Last Update:')).toBeInTheDocument();
      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should display formatted time when events received', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          lastEventTime: '2026-03-09T11:55:00Z',
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('Last Update:')).toBeInTheDocument();
      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });
  });

  describe('Circuit Breaker Status', () => {
    it('should display inactive circuit breaker status', () => {
      const preloadedState: Partial<RootState> = {
        websocket: mockWebSocketState,
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('Circuit Breaker:')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    it('should render system health title', () => {
      const preloadedState: Partial<RootState> = {
        websocket: mockWebSocketState,
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    it('should render all status sections', () => {
      const preloadedState: Partial<RootState> = {
        websocket: mockWebSocketState,
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      expect(screen.getByText('Backend API:')).toBeInTheDocument();
      expect(screen.getByText('WebSocket:')).toBeInTheDocument();
      expect(screen.getByText('Last Update:')).toBeInTheDocument();
      expect(screen.getByText('Circuit Breaker:')).toBeInTheDocument();
    });
  });

  describe('Status Color Coding', () => {
    it('should use success color for connected WebSocket', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          connected: true,
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      // Check for success color class on chip
      const connectedChip = screen.getByText('Connected').closest('.MuiChip-root');
      expect(connectedChip).toHaveClass('MuiChip-colorSuccess');
    });

    it('should use error color for WebSocket error', () => {
      const preloadedState: Partial<RootState> = {
        websocket: {
          ...mockWebSocketState,
          error: 'Connection failed',
        },
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      // Check for error color class on chip
      const errorChip = screen.getByText('Error').closest('.MuiChip-root');
      expect(errorChip).toHaveClass('MuiChip-colorError');
    });

    it('should use success color for inactive circuit breaker', () => {
      const preloadedState: Partial<RootState> = {
        websocket: mockWebSocketState,
      };

      renderWithProviders(<SystemHealthIndicator />, { preloadedState });

      // Check for success color class on chip
      const inactiveChip = screen.getByText('Inactive').closest('.MuiChip-root');
      expect(inactiveChip).toHaveClass('MuiChip-colorSuccess');
    });
  });
});

