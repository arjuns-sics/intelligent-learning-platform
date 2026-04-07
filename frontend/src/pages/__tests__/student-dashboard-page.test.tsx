import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { StudentDashboardPage } from '@/pages/student-dashboard-page';

vi.mock('@/hooks', () => ({
  useAuth: () => ({
    user: {
      _id: '1',
      name: 'Student User',
      email: 'student@example.com',
      role: 'Student',
      profile_image: null,
      preferredMedia: null,
      masteryScore: 80,
      weaknessTags: [],
      createdAt: new Date().toISOString(),
    },
    role: 'Student',
    logout: vi.fn(),
  }),
}));

describe('StudentDashboardPage', () => {
  it('renders student dashboard', () => {
    render(<StudentDashboardPage />);
    expect(screen.getByText(/My Courses/i)).toBeInTheDocument();
  });

  it('displays welcome message', () => {
    render(<StudentDashboardPage />);
    expect(screen.getByText(/Hello, Student User/i)).toBeInTheDocument();
  });

  it('displays stats overview', () => {
    render(<StudentDashboardPage />);
    expect(screen.getByText('Courses in Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed Courses')).toBeInTheDocument();
    expect(screen.getByText('Total Learning Time')).toBeInTheDocument();
  });

  it('displays continue learning section', () => {
    render(<StudentDashboardPage />);
    expect(screen.getByText('Continue Learning')).toBeInTheDocument();
  });

  it('displays recommended courses section', () => {
    render(<StudentDashboardPage />);
    expect(screen.getByText('Recommended Courses')).toBeInTheDocument();
  });
});
