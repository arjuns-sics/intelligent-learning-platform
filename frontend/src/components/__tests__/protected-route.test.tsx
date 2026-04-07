import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { ProtectedRoute } from '../protected-route';

vi.mock('@/hooks', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { _id: '1', name: 'Test', email: 'test@test.com', role: 'Student' },
    role: 'Student',
    isLoading: false,
  }),
}));

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('shows loading when checking auth', () => {
    vi.mocked(require('@/hooks').useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      role: null,
      isLoading: true,
    });

    render(
      <ProtectedRoute>
        <div>Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
