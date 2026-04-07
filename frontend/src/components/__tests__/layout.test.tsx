import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Layout } from '../layout';

vi.mock('@/hooks', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
}));

describe('Layout', () => {
  it('renders layout with header', () => {
    render(<Layout />);
    expect(screen.getByText(/Intelligent Learning Platform/i)).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    render(<Layout />);
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });

  it('displays theme toggle', () => {
    render(<Layout />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
