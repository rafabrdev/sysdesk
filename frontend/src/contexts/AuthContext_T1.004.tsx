// AuthContext_T1.004.tsx
// Authentication context and provider - Sprint 1 Task T1.004

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, tokenManager } from '@/services/api_T1.004';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'MASTER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'CLIENT';
  companyId: string;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  isActive: boolean;
  isEmailVerified: boolean;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Load user from token
  const loadUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = tokenManager.getAccessToken();
      if (token) {
        const response = await authApi.me();
        setUser(response.data);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(email, password);
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken);
      
      // Set user
      setUser(user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer login';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      tokenManager.clearTokens();
      setLoading(false);
      router.push('/login');
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authApi.me();
      setUser(response.data);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
