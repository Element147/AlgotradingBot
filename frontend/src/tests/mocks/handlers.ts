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
    const body = await request.json() as { username: string; password: string; rememberMe?: boolean };
    
    // Valid credentials
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
    
    // Invalid credentials
    return HttpResponse.json(
      {
        message: 'Invalid username or password',
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }),

  // Logout endpoint
  http.post(`${API_BASE_URL}/api/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Token refresh endpoint - success
  http.post(`${API_BASE_URL}/api/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refreshToken?: string };
    
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
    
    if (authHeader === 'Bearer mock-jwt-token-12345' || authHeader === 'Bearer mock-jwt-token-refreshed') {
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
    
    // Simulate expired token
    if (authHeader === 'Bearer mock-jwt-token-expired') {
      return HttpResponse.json(
        {
          message: 'Token expired',
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }
    
    if (authHeader === 'Bearer mock-jwt-token-12345' || authHeader === 'Bearer mock-jwt-token-refreshed') {
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
];
