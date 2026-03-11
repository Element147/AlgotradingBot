import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsPage from './SettingsPage';

const mockDispatch = vi.fn();
let writeTextMock: ReturnType<typeof vi.fn>;

const mockState = {
  settings: {
    theme: 'light' as const,
    currency: 'USD' as const,
    timezone: 'UTC',
  },
  environment: {
    mode: 'test' as const,
  },
};

vi.mock('@/app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  it('renders settings sections and local commands', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('User Preferences')).toBeInTheDocument();
    expect(screen.getByText('Environment Safety')).toBeInTheDocument();
    expect(screen.getByText('Research Defaults')).toBeInTheDocument();
    expect(screen.getByText('Local Commands (CMD)')).toBeInTheDocument();
    expect(screen.getByText('Backtest Data Workflow')).toBeInTheDocument();
    expect(screen.getByText(/docker compose -f compose.yaml up -d postgres/)).toBeInTheDocument();
  });

  it('copies command to clipboard', async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Command copied to clipboard.')).toBeInTheDocument();
    });
  });
});
