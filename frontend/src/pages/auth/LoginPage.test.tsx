import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

// Mock do sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginPage', () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('deve renderizar o formulário de login', () => {
    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/não tem uma conta/i)).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    // Tentar enviar sem preencher campos
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve validar formato de email', async () => {
    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    // Digitar email inválido
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve fazer login com sucesso', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    // Preencher formulário
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso!');
    });
  });

  it('deve mostrar erro quando login falha', async () => {
    const errorMessage = 'Credenciais inválidas';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    // Preencher formulário
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'WrongPassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('deve desabilitar botão durante o loading', async () => {
    // Mock de login que demora um tempo
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    // Preencher formulário
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    
    // Clicar no botão
    fireEvent.click(submitButton);

    // Verificar que o botão está desabilitado durante o loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/entrando/i)).toBeInTheDocument();
    });
  });

  it('deve navegar para registro quando link é clicado', () => {
    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    const registerLink = screen.getByRole('link', { name: /registre-se/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('deve limpar erros ao digitar novamente', async () => {
    render(<LoginPage />, {
      authValue: { login: mockLogin },
    });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    // Tentar enviar sem preencher campos
    await user.click(submitButton);

    // Verificar erros
    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });

    // Começar a digitar no campo de email
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 't');

    // Verificar que o erro sumiu
    await waitFor(() => {
      expect(screen.queryByText(/email é obrigatório/i)).not.toBeInTheDocument();
    });
  });
});
