import { describe, expect, it } from 'vitest';

import { resolveApiBaseUrl, resolveWebSocketBaseUrl } from './runtimeUrls';

describe('runtimeUrls', () => {
  it('keeps localhost API URLs for local pages', () => {
    expect(
      resolveApiBaseUrl('http://localhost:8080', {
        production: false,
        pageUrl: 'http://localhost:5173/dashboard',
      })
    ).toBe('http://localhost:8080');
  });

  it('rewrites loopback API URLs to the current page host in dev', () => {
    expect(
      resolveApiBaseUrl('http://localhost:8080', {
        production: false,
        pageUrl: 'http://host.docker.internal:5173/dashboard',
      })
    ).toBe('http://host.docker.internal:8080');
  });

  it('rewrites default WebSocket URLs to the current page host in dev', () => {
    expect(
      resolveWebSocketBaseUrl('', {
        production: false,
        pageUrl: 'http://host.docker.internal:5173/dashboard',
      })
    ).toBe('ws://host.docker.internal:8080/ws');
  });

  it('keeps explicit secure production API URLs', () => {
    expect(
      resolveApiBaseUrl('https://api.example.com', {
        production: true,
        pageUrl: 'https://app.example.com/dashboard',
      })
    ).toBe('https://api.example.com');
  });
});
