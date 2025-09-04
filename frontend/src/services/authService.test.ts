import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import authService from './authService';

// Mock do axios
vi.mock('axios');

describe('AuthService', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockResponse = {
        data: {
          token: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'client',
            organizationId: 'org-1',
          },
        },
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token');
      expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(mockResponse.data.user);
    });

    it('deve lançar erro quando login falha', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Credenciais inválidas',
          },
        },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(mockError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('deve registrar usuário com sucesso', async () => {
      const mockResponse = {
        data: {
          token: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
          user: {
            id: '1',
            email: 'newuser@example.com',
            name: 'New User',
            role: 'client',
            organizationId: 'org-1',
          },
        },
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'StrongPass123!',
        name: 'New User',
        organizationId: 'org-1',
      });

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token');
    });

    it('deve lançar erro quando registro falha', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Email já cadastrado',
          },
        },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(mockError);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'StrongPass123!',
          name: 'Existing User',
          organizationId: 'org-1',
        })
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('deve fazer logout e limpar localStorage', async () => {
      // Setup inicial
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('refreshToken', 'fake-refresh-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));

      vi.mocked(axios.post).mockResolvedValueOnce({ data: {} });

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('deve limpar localStorage mesmo quando API falha', async () => {
      // Setup inicial
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('refreshToken', 'fake-refresh-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));

      vi.mocked(axios.post).mockRejectedValueOnce(new Error('API Error'));

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('deve renovar token com sucesso', async () => {
      localStorage.setItem('refreshToken', 'old-refresh-token');

      const mockResponse = {
        data: {
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token',
        },
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.refreshToken();

      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('new-jwt-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    });

    it('deve lançar erro quando não há refresh token', async () => {
      localStorage.removeItem('refreshToken');

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando há token', () => {
      localStorage.setItem('token', 'fake-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('deve retornar false quando não há token', () => {
      localStorage.removeItem('token');
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('deve retornar usuário armazenado', () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com', role: 'client' };
      localStorage.setItem('user', JSON.stringify(user));
      
      expect(authService.getStoredUser()).toEqual(user);
    });

    it('deve retornar null quando não há usuário', () => {
      localStorage.removeItem('user');
      expect(authService.getStoredUser()).toBeNull();
    });

    it('deve retornar null quando dados são inválidos', () => {
      localStorage.setItem('user', 'invalid-json');
      expect(authService.getStoredUser()).toBeNull();
    });
  });
});
