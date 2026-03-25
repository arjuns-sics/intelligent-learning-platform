import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { DashboardPage } from '@/pages/dashboard-page';

vi.mock('@/hooks', () => ({
  useAuth: () => ({
    user: {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Student',
      profile_image: null,
      preferredMedia: null,
      masteryScore: 75.5,
      weaknessTags: ['Math', 'Science'],
      createdAt: new Date().toISOString(),
    },
    role: 'Student',
    logout: vi.fn(),
  }),
}));

describe('DashboardPage', () => {
  it('renders dashboard', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Welcome back, Test User/i)).toBeInTheDocument();
  });

  it('displays user role badge', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('displays mastery score', () => {
    render(<DashboardPage />);
    expect(screen.getByText('75.5')).toBeInTheDocument();
  });

  it('displays stats cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Mastery Score')).toBeInTheDocument();
    expect(screen.getByText('Courses Enrolled')).toBeInTheDocument();
    expect(screen.getByText('Weakness Tags')).toBeInTheDocument();
    expect(screen.getByText('Learning Streak')).toBeInTheDocument();
  });

  it('displays profile section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('displays quick actions', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Browse Courses')).toBeInTheDocument();
    expect(screen.getByText('Take Assessment')).toBeInTheDocument();
    expect(screen.getByText('View Progress')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  it('displays settings button', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays logout button', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
