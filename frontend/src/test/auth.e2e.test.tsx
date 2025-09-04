import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import App from '@/App';

// Mock do axios para simular API
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        post: vi.fn(),
        get: vi.fn(),
      })),
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

describe('Fluxo E2E de Autenticação', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Fluxo completo: Registro → Login → Dashboard → Logout', () => {
    it('deve completar o fluxo de autenticação com sucesso', async () => {
      // 1. REGISTRO DE NOVO USUÁRIO
      
      // Mock da resposta de listagem de organizações
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: [
          { id: 'org-1', name: 'Organização Teste' },
          { id: 'org-2', name: 'Outra Organização' },
        ],
      });

      // Mock da resposta de registro
      vi.mocked(axios.post).mockImplementation((url) => {
        if (url?.includes('/auth/register')) {
          return Promise.resolve({
            data: {
              token: 'jwt-token-novo-usuario',
              refreshToken: 'refresh-token-novo',
              user: {
                id: '123',
                email: 'novousuario@teste.com',
                name: 'Novo Usuário',
                role: 'client',
                organizationId: 'org-1',
                organization: {
                  id: 'org-1',
                  name: 'Organização Teste',
                },
              },
            },
          });
        }
        return Promise.reject(new Error('Endpoint não mockado'));
      });

      render(<App />);

      // Navegar para registro
      const registerLink = screen.getByRole('link', { name: /registre-se/i });
      await user.click(registerLink);

      // Preencher formulário de registro
      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      const nomeInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/email/i);
      const senhaInput = screen.getByLabelText(/^senha/i);
      const confirmarSenhaInput = screen.getByLabelText(/confirmar senha/i);
      const organizacaoSelect = screen.getByLabelText(/organização/i);

      await user.type(nomeInput, 'Novo Usuário');
      await user.type(emailInput, 'novousuario@teste.com');
      await user.type(senhaInput, 'SenhaForte123!');
      await user.type(confirmarSenhaInput, 'SenhaForte123!');
      await user.selectOptions(organizacaoSelect, 'org-1');

      const registerButton = screen.getByRole('button', { name: /registrar/i });
      await user.click(registerButton);

      // Verificar redirecionamento para dashboard após registro
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/novo usuário/i)).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBe('jwt-token-novo-usuario');
      });

      // 2. LOGOUT
      
      vi.mocked(axios.post).mockImplementation((url) => {
        if (url?.includes('/auth/logout')) {
          return Promise.resolve({ data: {} });
        }
        return Promise.reject(new Error('Endpoint não mockado'));
      });

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      await user.click(logoutButton);

      // Verificar redirecionamento para login após logout
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBeNull();
      });

      // 3. LOGIN COM CREDENCIAIS
      
      vi.mocked(axios.post).mockImplementation((url) => {
        if (url?.includes('/auth/login')) {
          return Promise.resolve({
            data: {
              token: 'jwt-token-login',
              refreshToken: 'refresh-token-login',
              user: {
                id: '123',
                email: 'novousuario@teste.com',
                name: 'Novo Usuário',
                role: 'client',
                organizationId: 'org-1',
                organization: {
                  id: 'org-1',
                  name: 'Organização Teste',
                },
              },
            },
          });
        }
        return Promise.reject(new Error('Endpoint não mockado'));
      });

      const loginEmailInput = screen.getByLabelText(/email/i);
      const loginSenhaInput = screen.getByLabelText(/senha/i);
      
      await user.type(loginEmailInput, 'novousuario@teste.com');
      await user.type(loginSenhaInput, 'SenhaForte123!');

      const loginButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(loginButton);

      // Verificar redirecionamento para dashboard após login
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/novo usuário/i)).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBe('jwt-token-login');
      });
    });

    it('deve manter sessão ao recarregar a página', async () => {
      // Simular usuário já logado no localStorage
      const userData = {
        id: '123',
        email: 'usuario@teste.com',
        name: 'Usuário Teste',
        role: 'support',
        organizationId: 'org-1',
      };

      localStorage.setItem('token', 'jwt-token-existente');
      localStorage.setItem('refreshToken', 'refresh-token-existente');
      localStorage.setItem('user', JSON.stringify(userData));

      // Mock para verificar token atual
      vi.mocked(axios.get).mockImplementation((url) => {
        if (url?.includes('/auth/me')) {
          return Promise.resolve({ data: userData });
        }
        return Promise.reject(new Error('Endpoint não mockado'));
      });

      render(<App />);

      // Deve carregar direto no dashboard sem pedir login
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/usuário teste/i)).toBeInTheDocument();
        expect(screen.getByText(/support/i)).toBeInTheDocument();
      });
    });

    it('deve renovar token automaticamente quando expirado', async () => {
      // Simular usuário logado
      localStorage.setItem('token', 'jwt-token-expirado');
      localStorage.setItem('refreshToken', 'refresh-token-valido');
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        email: 'usuario@teste.com',
        name: 'Usuário Teste',
        role: 'admin',
      }));

      let tentativas = 0;
      
      // Mock para simular token expirado e renovação
      vi.mocked(axios.get).mockImplementation((url) => {
        if (url?.includes('/auth/me')) {
          tentativas++;
          if (tentativas === 1) {
            // Primeira tentativa: token expirado
            return Promise.reject({
              response: { status: 401, data: { message: 'Token expired' } },
            });
          } else {
            // Segunda tentativa: após renovação
            return Promise.resolve({
              data: {
                id: '123',
                email: 'usuario@teste.com',
                name: 'Usuário Teste',
                role: 'admin',
              },
            });
          }
        }
        return Promise.reject(new Error('Endpoint não mockado'));
      });

      vi.mocked(axios.post).mockImplementation((url) => {
        if (url?.includes('/auth/refresh')) {
          return Promise.resolve({
            data: {
              token: 'jwt-token-renovado',
              refreshToken: 'refresh-token-renovado',
            },
          });
        }
        return Promise.reject(new Error('Endpoint não mockado'));
      });

      render(<App />);

      // Deve renovar token e continuar autenticado
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('jwt-token-renovado');
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });

  describe('Proteção de Rotas e RBAC', () => {
    it('deve bloquear acesso a rotas protegidas sem autenticação', async () => {
      render(<App />);

      // Tentar acessar dashboard diretamente
      window.history.pushState({}, '', '/dashboard');

      await waitFor(() => {
        // Deve redirecionar para login
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });
    });

    it('deve respeitar hierarquia de roles no acesso', async () => {
      // Mock de diferentes roles
      const testRoleAccess = async (role: string, shouldAccessAdmin: boolean) => {
        localStorage.setItem('token', `jwt-token-${role}`);
        localStorage.setItem('user', JSON.stringify({
          id: '123',
          email: `${role}@teste.com`,
          name: `Usuário ${role}`,
          role: role,
        }));

        vi.mocked(axios.get).mockImplementation((url) => {
          if (url?.includes('/auth/me')) {
            return Promise.resolve({
              data: {
                id: '123',
                email: `${role}@teste.com`,
                name: `Usuário ${role}`,
                role: role,
              },
            });
          }
          return Promise.reject(new Error('Endpoint não mockado'));
        });

        const { unmount } = render(<App />);

        // Tentar acessar área administrativa
        window.history.pushState({}, '', '/admin');

        if (shouldAccessAdmin) {
          await waitFor(() => {
            expect(screen.queryByText(/acesso negado/i)).not.toBeInTheDocument();
            expect(screen.getByText(/painel administrativo/i)).toBeInTheDocument();
          });
        } else {
          await waitFor(() => {
            expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
            expect(screen.queryByText(/painel administrativo/i)).not.toBeInTheDocument();
          });
        }

        unmount();
        localStorage.clear();
      };

      // Testar diferentes roles
      await testRoleAccess('client', false);  // Client não deve acessar admin
      await testRoleAccess('support', false); // Support não deve acessar admin
      await testRoleAccess('admin', true);    // Admin deve acessar admin
      await testRoleAccess('master', true);   // Master deve acessar tudo
    });
  });
});
