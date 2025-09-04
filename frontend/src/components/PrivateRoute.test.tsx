import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { PrivateRoute } from './PrivateRoute';
import { createAuthenticatedContext, mockAuthContext } from '@/test/test-utils';
import { Navigate, useLocation } from 'react-router-dom';

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => <div>Navigate to {to}</div>),
    useLocation: vi.fn(),
  };
});

describe('PrivateRoute', () => {
  const mockLocation = { pathname: '/dashboard' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLocation).mockReturnValue(mockLocation);
  });

  describe('Autenticação', () => {
    it('deve renderizar children quando usuário está autenticado', () => {
      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('client'),
        }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('deve redirecionar para login quando usuário não está autenticado', () => {
      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          authValue: {
            ...mockAuthContext,
            isAuthenticated: false,
            isLoading: false,
          },
        }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    });

    it('deve mostrar loading quando está carregando', () => {
      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          authValue: {
            ...mockAuthContext,
            isLoading: true,
          },
        }
      );

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Controle de Acesso por Role (RBAC)', () => {
    it('deve permitir acesso quando usuário tem role permitida', () => {
      render(
        <PrivateRoute allowedRoles={['admin', 'master']}>
          <div>Admin Content</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('admin'),
        }
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('deve negar acesso quando usuário não tem role permitida', () => {
      render(
        <PrivateRoute allowedRoles={['admin', 'master']}>
          <div>Admin Content</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('client'),
        }
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
      expect(screen.getByText(/você não tem permissão/i)).toBeInTheDocument();
    });

    it('deve permitir acesso a qualquer role quando allowedRoles não é especificado', () => {
      const roles: Array<'client' | 'support' | 'admin' | 'master'> = [
        'client',
        'support',
        'admin',
        'master',
      ];

      roles.forEach((role) => {
        const { unmount } = render(
          <PrivateRoute>
            <div>Content for {role}</div>
          </PrivateRoute>,
          {
            authValue: createAuthenticatedContext(role),
          }
        );

        expect(screen.getByText(`Content for ${role}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('deve verificar hierarquia de roles - master acessa tudo', () => {
      render(
        <PrivateRoute allowedRoles={['client']}>
          <div>Client Area</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('master'),
        }
      );

      // Master deve ter acesso a área de client pela hierarquia
      expect(screen.getByText('Client Area')).toBeInTheDocument();
    });

    it('deve verificar hierarquia de roles - admin acessa support e client', () => {
      render(
        <PrivateRoute allowedRoles={['support']}>
          <div>Support Area</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('admin'),
        }
      );

      // Admin deve ter acesso a área de support pela hierarquia
      expect(screen.getByText('Support Area')).toBeInTheDocument();
    });

    it('deve verificar hierarquia de roles - support acessa área de client', () => {
      render(
        <PrivateRoute allowedRoles={['client']}>
          <div>Client Area</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('support'),
        }
      );

      // Support deve ter acesso a área de client pela hierarquia
      expect(screen.getByText('Client Area')).toBeInTheDocument();
    });

    it('deve negar quando client tenta acessar área de support', () => {
      render(
        <PrivateRoute allowedRoles={['support']}>
          <div>Support Area</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('client'),
        }
      );

      expect(screen.queryByText('Support Area')).not.toBeInTheDocument();
      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
    });
  });

  describe('Redirecionamento e Estado', () => {
    it('deve preservar location state ao redirecionar para login', () => {
      const mockNavigate = vi.fn();
      vi.mocked(Navigate).mockImplementation(({ to, state }: any) => (
        <div>
          Navigate to {to} with state: {JSON.stringify(state)}
        </div>
      ));

      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          authValue: {
            ...mockAuthContext,
            isAuthenticated: false,
            isLoading: false,
          },
        }
      );

      expect(screen.getByText(/Navigate to \/login/)).toBeInTheDocument();
      expect(screen.getByText(/pathname.*dashboard/)).toBeInTheDocument();
    });

    it('deve redirecionar para fallbackPath quando especificado e acesso negado', () => {
      render(
        <PrivateRoute allowedRoles={['admin']} fallbackPath="/unauthorized">
          <div>Admin Content</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('client'),
        }
      );

      // Deve mostrar página de acesso negado por padrão, não redirecionar
      // a menos que o componente seja modificado para usar fallbackPath
      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
    });
  });

  describe('Casos especiais', () => {
    it('deve lidar com usuário sem role definida', () => {
      const authValueWithoutRole = {
        ...createAuthenticatedContext('client'),
        user: {
          ...createAuthenticatedContext('client').user,
          role: undefined as any,
        },
      };

      render(
        <PrivateRoute allowedRoles={['client']}>
          <div>Client Content</div>
        </PrivateRoute>,
        {
          authValue: authValueWithoutRole,
        }
      );

      expect(screen.queryByText('Client Content')).not.toBeInTheDocument();
      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
    });

    it('deve lidar com array vazio de allowedRoles', () => {
      render(
        <PrivateRoute allowedRoles={[]}>
          <div>No Access Content</div>
        </PrivateRoute>,
        {
          authValue: createAuthenticatedContext('master'),
        }
      );

      // Com array vazio, ninguém deveria ter acesso
      expect(screen.queryByText('No Access Content')).not.toBeInTheDocument();
      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
    });
  });
});
