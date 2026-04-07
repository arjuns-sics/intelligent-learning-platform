import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { InstructorDashboardPage } from '@/pages/instructor-dashboard-page';

vi.mock('@/hooks', () => ({
  useAuth: () => ({
    user: {
      _id: '1',
      name: 'Instructor User',
      email: 'instructor@example.com',
      role: 'Instructor',
      profile_image: null,
      preferredMedia: null,
      masteryScore: 0,
      weaknessTags: [],
      createdAt: new Date().toISOString(),
    },
    role: 'Instructor',
    logout: vi.fn(),
  }),
}));

describe('InstructorDashboardPage', () => {
  it('renders instructor dashboard', () => {
    render(<InstructorDashboardPage />);
    expect(screen.getByText(/Instructor Dashboard/i)).toBeInTheDocument();
  });

  it('displays welcome message', () => {
    render(<InstructorDashboardPage />);
    expect(screen.getByText(/Welcome back, Instructor User/i)).toBeInTheDocument();
  });

  it('displays instructor stats', () => {
    render(<InstructorDashboardPage />);
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
  });

  it('displays my courses section', () => {
    render(<InstructorDashboardPage />);
    expect(screen.getByText('My Courses')).toBeInTheDocument();
  });

  it('displays create course button', () => {
    render(<InstructorDashboardPage />);
    expect(screen.getByRole('button', { name: /create course/i })).toBeInTheDocument();
  });
});
