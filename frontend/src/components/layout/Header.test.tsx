import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Header } from './Header';
import authReducer from '../../features/auth/authSlice';
import settingsReducer from '../../features/settings/settingsSlice';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockStore = (user = { id: '1', username: 'testuser', email: 'test@example.com', role: 'trader' as const }) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      auth: {
        token: 'mock-token',
        refreshToken: null,
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
        sessionExpiry: null,
        lastActivity: null,
      },
      settings: {
        theme: 'light',
        currency: 'USD',
        timezone: 'UTC',
      },
    },
  });
};

describe('Header', () => {
  const defaultProps = {
    onMenuClick: vi.fn(),
  };

  const renderHeader = (props = defaultProps, store = createMockStore()) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Header {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    defaultProps.onMenuClick.mockClear();
  });

  it('renders menu button', () => {
    renderHeader();

    const menuButton = screen.getByLabelText('menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('calls onMenuClick when menu button is clicked', () => {
    const onMenuClick = vi.fn();
    renderHeader({ onMenuClick });

    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);

    expect(onMenuClick).toHaveBeenCalled();
  });

  it('renders notifications button with badge', () => {
    renderHeader();

    const notificationsButton = screen.getByLabelText('notifications');
    expect(notificationsButton).toBeInTheDocument();
  });

  it('renders user avatar with first letter of username', () => {
    renderHeader();

    const avatar = screen.getByText('T'); // First letter of 'testuser'
    expect(avatar).toBeInTheDocument();
  });

  it('opens user menu when avatar is clicked', async () => {
    renderHeader();

    const accountButton = screen.getByLabelText('account');
    fireEvent.click(accountButton);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('displays settings and logout options in user menu', async () => {
    renderHeader();

    const accountButton = screen.getByLabelText('account');
    fireEvent.click(accountButton);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('navigates to settings when settings menu item is clicked', async () => {
    renderHeader();

    const accountButton = screen.getByLabelText('account');
    fireEvent.click(accountButton);

    await waitFor(() => {
      const settingsMenuItem = screen.getByText('Settings');
      fireEvent.click(settingsMenuItem);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('dispatches logout and navigates to login when logout is clicked', async () => {
    const store = createMockStore();
    renderHeader(defaultProps, store);

    const accountButton = screen.getByLabelText('account');
    fireEvent.click(accountButton);

    await waitFor(() => {
      const logoutMenuItem = screen.getByText('Logout');
      fireEvent.click(logoutMenuItem);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    
    // Check that user is logged out
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.token).toBeNull();
  });

  it('opens notifications menu when notifications button is clicked', async () => {
    renderHeader();

    const notificationsButton = screen.getByLabelText('notifications');
    fireEvent.click(notificationsButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('No new notifications')).toBeInTheDocument();
    });
  });

  it('displays default avatar when user has no username', () => {
    const store = createMockStore({ id: '1', username: '', email: 'test@example.com', role: 'trader' });
    renderHeader(defaultProps, store);

    const avatar = screen.getByText('U'); // Default 'U'
    expect(avatar).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderHeader();

    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeToggle).toBeInTheDocument();
  });

  it('toggles theme when theme toggle is clicked', async () => {
    const store = createMockStore();
    renderHeader(defaultProps, store);

    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(themeToggle);

    await waitFor(() => {
      const state = store.getState();
      expect(state.settings.theme).toBe('dark');
    });
  });
});
