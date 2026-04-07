import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { LoginPage } from '@/pages/login-page';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock auth hook
vi.mock('@/hooks', () => ({
  useAuth: () => ({
    login: vi.fn(() => Promise.resolve({ success: true })),
    isAuthenticated: false,
    user: null,
    token: null,
    role: null,
    isLoading: false,
    logout: vi.fn(),
    register: vi.fn(),
    fetchProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    changeUserPassword: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders login page', () => {
    render(<LoginPage />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('displays login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('displays account type selector', () => {
    render(<LoginPage />);
    expect(screen.getByText('Account Type')).toBeInTheDocument();
    expect(screen.getByText('Learner / Student')).toBeInTheDocument();
    expect(screen.getByText('Educator / Teacher')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('displays sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays sign up link', () => {
    render(<LoginPage />);
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('displays forgot password link', () => {
    render(<LoginPage />);
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
  });

  it('displays remember me checkbox', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('allows typing in email field', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('allows typing in password field', async () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput).toHaveValue('password123');
  });
});
