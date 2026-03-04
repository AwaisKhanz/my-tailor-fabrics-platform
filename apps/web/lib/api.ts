import axios from 'axios';
import type { Session } from 'next-auth';
import { getSession, signOut } from 'next-auth/react';
import { getWebApiBaseUrl } from './env';
import { logDevError } from './logger';
import { isTokenExpiringSoon } from './auth/jwt';

export const API_BASE_URL = getWebApiBaseUrl();
const AUTH_REDIRECT_DEBOUNCE_MS = 5000;
const SESSION_CACHE_TTL_MS = 1000;
let refreshSessionPromise: Promise<string | null> | null = null;
let cachedSession: Session | null = null;
let cachedSessionAt = 0;
let pendingSessionRequest: Promise<Session | null> | null = null;

async function fetchFreshSessionAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      return null;
    }

    const session = (await response.json()) as Session & {
      accessToken?: unknown;
      error?: unknown;
    };
    cachedSession = session as Session;
    cachedSessionAt = Date.now();

    if (typeof session.error === 'string' && session.error.length > 0) {
      return null;
    }

    return typeof session.accessToken === 'string' && session.accessToken.length > 0
      ? session.accessToken
      : null;
  } catch {
    return null;
  }
}

async function refreshAccessTokenWithLock(): Promise<string | null> {
  if (!refreshSessionPromise) {
    refreshSessionPromise = fetchFreshSessionAccessToken().finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
}

function clearCachedSession(): void {
  cachedSession = null;
  cachedSessionAt = 0;
  pendingSessionRequest = null;
}

async function getCachedSession(force = false): Promise<Session | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const now = Date.now();
  if (
    !force &&
    cachedSession &&
    now - cachedSessionAt < SESSION_CACHE_TTL_MS
  ) {
    return cachedSession;
  }

  if (!pendingSessionRequest || force) {
    pendingSessionRequest = getSession()
      .then((session) => {
        cachedSession = session;
        cachedSessionAt = Date.now();
        return session;
      })
      .finally(() => {
        pendingSessionRequest = null;
      });
  }

  return pendingSessionRequest;
}

function handleInvalidSession(reason: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const now = Date.now();
  const lastRedirect = sessionStorage.getItem('auth_invalid_redirect');
  if (lastRedirect && now - Number.parseInt(lastRedirect, 10) <= AUTH_REDIRECT_DEBOUNCE_MS) {
    return;
  }

  sessionStorage.setItem('auth_invalid_redirect', String(now));
  clearCachedSession();
  void signOut({ redirect: false }).finally(() => {
    if (!window.location.pathname.includes('/login')) {
      const url = `/login?expired=1&reason=${encodeURIComponent(reason)}`;
      window.location.href = url;
    }
  });
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  async (config) => {
    // getSession works on the client. For server side, we might need a different approach
    // but most API calls in this app are currently from the client components.
    const session = await getCachedSession();
    const sessionError =
      session && typeof (session as { error?: unknown }).error === 'string'
        ? ((session as { error?: string }).error ?? null)
        : null;
    const sessionAccessToken =
      session && typeof session.accessToken === 'string' && session.accessToken.length > 0
        ? session.accessToken
        : null;

    if (sessionError) {
      handleInvalidSession(sessionError);
      return Promise.reject(new axios.Cancel(`Invalid session: ${sessionError}`));
    }

    if (session && !sessionAccessToken) {
      handleInvalidSession('MissingAccessToken');
      return Promise.reject(new axios.Cancel('Invalid session: missing access token'));
    }

    let token = sessionAccessToken;

    if (token && isTokenExpiringSoon(token)) {
      const refreshedToken = await refreshAccessTokenWithLock();
      if (refreshedToken) {
        token = refreshedToken;
      } else {
        handleInvalidSession('AccessTokenRefreshFailed');
        return Promise.reject(new axios.Cancel('Invalid session: access token refresh failed'));
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Auth role/branch info is now in session
    // But for SUPER_ADMINs, we respect the globally selected branch id from cookies (Stripe-like switching)
    const getCookieValue = (name: string) => {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };
    
    // We get the selected global branch identifier if one was set by the Admin
    const selectedBranchId = getCookieValue('tbms_active_branch');
    const activeBranchId = selectedBranchId || session?.user?.branchId;
    
    if (activeBranchId) {
      config.headers['x-branch-id'] = activeBranchId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log connection diagnostics only in development.
    if (!error.response) {
      logDevError('Network/Connection Error:', {
        message: error.message,
        code: error.code,
        config: error.config?.url
      });
    }

    // Attempt one silent refresh + retry for expired/stale access tokens.
    if (error.response?.status === 401 && typeof window !== 'undefined' && error.config) {
      const requestConfig = error.config as typeof error.config & {
        _authRetry?: boolean;
      };
      const requestUrl = requestConfig?.url ?? '';
      const isAuthCall =
        requestUrl.includes('/auth/') ||
        requestUrl.includes('/api/auth/') ||
        requestUrl.includes('session');

      if (!isAuthCall && !requestConfig._authRetry) {
        requestConfig._authRetry = true;
        const refreshedToken = await refreshAccessTokenWithLock();
        if (refreshedToken) {
          requestConfig.headers = requestConfig.headers ?? {};
          (requestConfig.headers as Record<string, string>).Authorization =
            `Bearer ${refreshedToken}`;
          return api.request(requestConfig);
        }
      }
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const requestUrl = error.config?.url ?? '';
      const isAuthCall =
        requestUrl.includes('/auth/') ||
        requestUrl.includes('/api/auth/') ||
        requestUrl.includes('session');
      if (!isAuthCall) {
        handleInvalidSession('AccessTokenUnauthorized');
      }
    }
    
    return Promise.reject(error);
  }
);
