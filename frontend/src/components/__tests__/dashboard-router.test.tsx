import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { DashboardRouter } from '../dashboard-router';

describe('DashboardRouter', () => {
  it('shows loading state', () => {
    vi.mock('@/hooks', () => ({
      useAuth: () => ({
        role: null,
        isLoading: true,
      }),
    }));

    render(<DashboardRouter />);
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });
});
