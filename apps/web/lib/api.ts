import axios from 'axios';
import { getSession } from 'next-auth/react';
import { getWebApiBaseUrl } from './env';
import { logDevError } from './logger';

export const API_BASE_URL = getWebApiBaseUrl();

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
    const session = await getSession();
    const token = session?.accessToken;
    
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

    // Prevent redirect loops by checking if we are already on the login page or trying to fetch session.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname.includes('/login');
      const isAuthCall = error.config?.url?.includes('/auth/') || error.config?.url?.includes('session');
      
      if (!isLoginPage && !isAuthCall) {
        // Debounce redirects using a temporary session storage flag to prevent crazy loops
        const lastRedirect = sessionStorage.getItem('last_401_redirect');
        const now = Date.now();
        if (!lastRedirect || (now - parseInt(lastRedirect, 10)) > 5000) {
          sessionStorage.setItem('last_401_redirect', now.toString());
          window.location.href = '/login?expired=1';
        }
      }
    }
    
    return Promise.reject(error);
  }
);
