import axios, { AxiosHeaders } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { Session } from 'next-auth';
import { getSession, signOut } from 'next-auth/react';
import { getWebApiBaseUrl } from './env';
import { logDevError } from './logger';
import { isTokenExpiringSoon } from './auth/jwt';
import { readActiveBranchCookie } from './branch-context';
import { useBranchStore } from '@/store/useBranchStore';

export const API_BASE_URL = getWebApiBaseUrl();
const AUTH_REDIRECT_DEBOUNCE_MS = 5000;
const SESSION_CACHE_TTL_MS = 1000;
let refreshSessionPromise: Promise<string | null> | null = null;
let cachedSession: Session | null = null;
let cachedSessionAt = 0;
let pendingSessionRequest: Promise<Session | null> | null = null;
const retriedRequestConfigs = new WeakSet<object>();
const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

type ApiToastConfig = {
  successMessage?: string;
  errorMessage?: string;
  suppressSuccess?: boolean;
  suppressError?: boolean;
};

declare module 'axios' {
  export interface InternalAxiosRequestConfig<D = any> {
    tbmsToast?: ApiToastConfig;
  }
}

function isWriteMethod(method?: string): boolean {
  if (!method) {
    return false;
  }
  return WRITE_METHODS.has(method.toLowerCase());
}

function getDefaultSuccessMessage(method?: string): string {
  switch (method?.toLowerCase()) {
    case 'post':
      return 'Created successfully';
    case 'delete':
      return 'Deleted successfully';
    case 'put':
    case 'patch':
      return 'Updated successfully';
    default:
      return 'Action completed successfully';
  }
}

function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Request failed. Please try again.';
  }

  const payload = error.response?.data;
  if (typeof payload === 'object' && payload !== null) {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
    if (Array.isArray(maybeMessage) && maybeMessage.length > 0) {
      const firstMessage = maybeMessage.find(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      );
      if (firstMessage) {
        return firstMessage;
      }
    }
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Request failed. Please try again.';
}

function emitToast(
  input:
    | {
        title: string;
        description?: string;
        variant?: 'success' | 'destructive';
      }
    | undefined,
): void {
  if (!input || typeof window === 'undefined') {
    return;
  }

  void import('@/hooks/use-toast').then(({ toast }) => {
    toast(input);
  });
}

function isSessionPayload(value: unknown): value is Session {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (!('user' in value)) {
    return true;
  }

  return value.user === undefined || typeof value.user === 'object';
}

function setAuthorizationHeader(
  headers: NonNullable<AxiosRequestConfig['headers']>,
  token: string,
) {
  const authorization = `Bearer ${token}`;
  if (headers instanceof AxiosHeaders) {
    headers.set('Authorization', authorization);
    return;
  }

  if (typeof headers === 'object' && headers !== null) {
    Object.assign(headers, { Authorization: authorization });
  }
}

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

    const payload: unknown = await response.json();
    const session = isSessionPayload(payload) ? payload : null;
    cachedSession = session;
    cachedSessionAt = Date.now();

    if (typeof session?.error === 'string' && session.error.length > 0) {
      return null;
    }

    return typeof session?.accessToken === 'string' && session.accessToken.length > 0
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
      session && typeof session.error === 'string' ? session.error : null;
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
      config.headers = config.headers ?? {};
      setAuthorizationHeader(config.headers, token);
    }
    
    // Auth role/branch info is now in session.
    // For cross-branch admin flows, prefer the branch explicitly selected in the UI.
    const selectedBranchId =
      useBranchStore.getState().activeBranchId ?? readActiveBranchCookie();
    const activeBranchId = selectedBranchId || session?.user?.branchId;
    
    if (activeBranchId) {
      config.headers['x-branch-id'] = activeBranchId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);



api.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined' && isWriteMethod(response.config.method)) {
      const toastConfig = response.config.tbmsToast;
      if (!toastConfig?.suppressSuccess) {
        emitToast({
          title:
            toastConfig?.successMessage ??
            getDefaultSuccessMessage(response.config.method),
          variant: 'success',
        });
      }
    }

    return response;
  },
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
      const requestConfig = error.config;
      const requestUrl = requestConfig?.url ?? '';
      const isAuthCall =
        requestUrl.includes('/auth/') ||
        requestUrl.includes('/api/auth/') ||
        requestUrl.includes('session');
      const alreadyRetried = retriedRequestConfigs.has(requestConfig);

      if (!isAuthCall && !alreadyRetried) {
        retriedRequestConfigs.add(requestConfig);
        const refreshedToken = await refreshAccessTokenWithLock();
        if (refreshedToken) {
          requestConfig.headers = requestConfig.headers ?? {};
          setAuthorizationHeader(requestConfig.headers, refreshedToken);
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
    
    if (!axios.isCancel(error)) {
      const requestConfig = axios.isAxiosError(error) ? error.config : undefined;
      const shouldShowWriteErrorToast =
        typeof window !== 'undefined' &&
        isWriteMethod(requestConfig?.method) &&
        !requestConfig?.tbmsToast?.suppressError;

      if (shouldShowWriteErrorToast) {
        emitToast({
          title: requestConfig?.tbmsToast?.errorMessage ?? 'Action failed',
          description: getErrorMessage(error),
          variant: 'destructive',
        });
      }
    }

    return Promise.reject(error);
  }
);
