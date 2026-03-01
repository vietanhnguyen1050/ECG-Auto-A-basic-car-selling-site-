// ==========================================
// AXIOS INSTANCE - Central HTTP client setup
// ==========================================

import axios from 'axios';
import { clearAuthTokens, getAccessToken } from '@/lib/authTokens';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/ecg';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token ──────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 globally ─────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const hasAuthHeader = Boolean(error.config?.headers?.Authorization);
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh');

    if (status === 401 && hasAuthHeader && !isAuthEndpoint) {
      clearAuthTokens();
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
