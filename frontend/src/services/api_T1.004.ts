// api_T1.004.ts
// API service for frontend - Sprint 1 Task T1.004

import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getAccessToken: () => Cookies.get('accessToken') || localStorage.getItem('accessToken'),
  getRefreshToken: () => Cookies.get('refreshToken') || localStorage.getItem('refreshToken'),
  
  setTokens: (accessToken: string, refreshToken: string) => {
    // Store in both cookie and localStorage for now
    // In production, use HttpOnly cookies
    Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
    Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  clearTokens: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await authApi.refresh(refreshToken);
          tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response;
  },
  
  refresh: async (refreshToken: string) => {
    const response = await api.post('/api/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return response;
  },
  
  logout: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    await api.post('/api/auth/logout', { refreshToken });
    tokenManager.clearTokens();
  },
  
  me: async () => {
    const response = await api.get('/api/auth/me');
    return response;
  },
  
  registerByInvite: async (data: {
    token: string;
    name: string;
    password: string;
    phone?: string;
    position?: string;
  }) => {
    const response = await api.post('/api/auth/register-by-invite', data);
    return response;
  },
};

// Invites API endpoints
export const invitesApi = {
  validateToken: async (token: string) => {
    const response = await api.get(`/api/invites/validate?token=${token}`);
    return response;
  },
  
  getByToken: async (token: string) => {
    const response = await api.get(`/api/invites/${token}`);
    return response;
  },
};

// Users API endpoints
export const usersApi = {
  list: async () => {
    const response = await api.get('/api/users');
    return response;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/users/${id}`, data);
    return response;
  },
  
  deactivate: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response;
  },
};

export default api;
