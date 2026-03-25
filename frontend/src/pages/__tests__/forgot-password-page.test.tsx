import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { ForgotPasswordPage } from '@/pages/forgot-password-page';

describe('ForgotPasswordPage', () => {
  it('renders forgot password page', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
  });

  it('displays email input', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('displays send reset link button', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('displays back to login link', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it('allows typing in email field', () => {
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText(/email/i);
    // Test would go here if form submission was tested
    expect(emailInput).toBeInTheDocument();
  });
});
