import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { SignupPage } from '@/pages/signup-page';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('@/hooks', () => ({
  useAuth: () => ({
    register: vi.fn(() => Promise.resolve({ success: true })),
    isAuthenticated: false,
    login: vi.fn(),
    user: null,
    token: null,
    role: null,
    isLoading: false,
    logout: vi.fn(),
    fetchProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    changeUserPassword: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

describe('SignupPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders signup page', () => {
    render(<SignupPage />);
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('displays signup form', () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('displays account type selector', () => {
    render(<SignupPage />);
    expect(screen.getByText(/account type/i)).toBeInTheDocument();
  });

  it('displays sign up button', () => {
    render(<SignupPage />);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('displays login link', () => {
    render(<SignupPage />);
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('allows typing in name field', () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput).toHaveValue('John Doe');
  });

  it('allows typing in email field', () => {
    render(<SignupPage />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('allows typing in password field', () => {
    render(<SignupPage />);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput).toHaveValue('password123');
  });
});
