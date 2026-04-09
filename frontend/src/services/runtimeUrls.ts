const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const DEFAULT_API_URL = 'http://localhost:8080';
const DEFAULT_WS_PATH = '/ws';

const getDefaultPageUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }

  return 'http://localhost:5173/';
};

const isLoopbackHost = (hostname: string): boolean => LOOPBACK_HOSTS.has(hostname);

const rewriteLoopbackHostForDev = (targetUrl: URL, pageUrl: URL, production: boolean): URL => {
  if (production || isLoopbackHost(pageUrl.hostname) || !isLoopbackHost(targetUrl.hostname)) {
    return targetUrl;
  }

  targetUrl.hostname = pageUrl.hostname;
  return targetUrl;
};

interface RuntimeUrlOptions {
  pageUrl?: string;
  production?: boolean;
}

export const resolveApiBaseUrl = (
  configuredUrl?: string,
  options: RuntimeUrlOptions = {}
): string => {
  const production = options.production ?? import.meta.env.PROD;
  const pageUrl = new URL(options.pageUrl ?? getDefaultPageUrl());
  const resolvedUrl = new URL(configuredUrl?.trim() || DEFAULT_API_URL, pageUrl);

  rewriteLoopbackHostForDev(resolvedUrl, pageUrl, production);

  if (production && resolvedUrl.protocol === 'http:') {
    resolvedUrl.protocol = 'https:';
  }

  return resolvedUrl.toString().replace(/\/$/, '');
};

export const resolveWebSocketBaseUrl = (
  configuredUrl?: string,
  options: RuntimeUrlOptions = {}
): string => {
  const production = options.production ?? import.meta.env.PROD;
  const pageUrl = new URL(options.pageUrl ?? getDefaultPageUrl());

  if (!configuredUrl || configuredUrl.trim() === '') {
    const defaultUrl = new URL(DEFAULT_API_URL + DEFAULT_WS_PATH);
    rewriteLoopbackHostForDev(defaultUrl, pageUrl, production);
    defaultUrl.protocol = defaultUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return defaultUrl.toString();
  }

  const resolvedUrl = new URL(configuredUrl, pageUrl);
  rewriteLoopbackHostForDev(resolvedUrl, pageUrl, production);
  return resolvedUrl.toString();
};
