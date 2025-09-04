import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { vi } from 'vitest';

// Mock do AuthContext
export const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
};

// Provider customizado para testes
interface AllTheProvidersProps {
  children: React.ReactNode;
  authValue?: typeof mockAuthContext;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ 
  children, 
  authValue = mockAuthContext 
}) => {
  return (
    <BrowserRouter>
      <AuthProvider testValue={authValue}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Função de render customizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    authValue?: typeof mockAuthContext;
  }
): RenderResult => {
  const { authValue, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock de usuários para testes
export const mockUsers = {
  client: {
    id: '1',
    name: 'Test Client',
    email: 'client@test.com',
    role: 'client' as const,
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Test Organization',
    },
  },
  support: {
    id: '2',
    name: 'Test Support',
    email: 'support@test.com',
    role: 'support' as const,
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Test Organization',
    },
  },
  admin: {
    id: '3',
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'admin' as const,
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Test Organization',
    },
  },
  master: {
    id: '4',
    name: 'Test Master',
    email: 'master@test.com',
    role: 'master' as const,
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Test Organization',
    },
  },
};

// Helper para simular autenticação
export const createAuthenticatedContext = (role: 'client' | 'support' | 'admin' | 'master') => ({
  ...mockAuthContext,
  user: mockUsers[role],
  isAuthenticated: true,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
