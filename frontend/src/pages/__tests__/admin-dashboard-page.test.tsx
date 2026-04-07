import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { AdminDashboardPage } from '@/pages/admin-dashboard-page';

// Mock the admin service
vi.mock('@/services/admin.service', () => ({
  getDashboardStats: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      overview: {
        totalUsers: 100,
        totalCourses: 50,
        publishedCourses: 40,
        draftCourses: 10,
        totalEnrollments: 200,
      },
      usersByRole: {
        students: 80,
        instructors: 15,
        admins: 5,
      },
      recentCourses: [
        {
          _id: '1',
          title: 'Test Course 1',
          status: 'published',
          enrolledStudents: 50,
          createdAt: new Date().toISOString(),
        },
      ],
      topCourses: [
        {
          _id: '2',
          title: 'Top Course',
          enrolledStudents: 100,
          rating: 4.5,
        },
      ],
    },
  })),
}));

// Mock the auth hook
vi.mock('@/hooks', () => ({
  useAuth: () => ({
    user: {
      _id: 'admin_hardcoded_id',
      name: 'System Administrator',
      email: 'admin@gmail.com',
      role: 'Admin' as const,
      profile_image: null,
      preferredMedia: null,
      masteryScore: 0,
      weaknessTags: [],
      createdAt: new Date().toISOString(),
    },
    role: 'Admin',
    logout: vi.fn(),
  }),
}));

describe('AdminDashboardPage', () => {
  it('renders without crashing', async () => {
    render(<AdminDashboardPage />);
    
    // Wait for the dashboard to load
    expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  it('displays welcome message', async () => {
    render(<AdminDashboardPage />);
    
    expect(await screen.findByText(/Welcome back, System Administrator/i)).toBeInTheDocument();
  });

  it('displays statistics cards', async () => {
    render(<AdminDashboardPage />);
    
    expect(await screen.findByText('Total Users')).toBeInTheDocument();
    expect(await screen.findByText('Total Courses')).toBeInTheDocument();
    expect(await screen.findByText('Total Enrollments')).toBeInTheDocument();
    expect(await screen.findByText('Platform Health')).toBeInTheDocument();
  });

  it('displays user management card', async () => {
    render(<AdminDashboardPage />);
    
    expect(await screen.findByText('User Management')).toBeInTheDocument();
  });

  it('displays course management card', async () => {
    render(<AdminDashboardPage />);
    
    expect(await screen.findByText('Course Management')).toBeInTheDocument();
  });

  it('displays recent courses section', async () => {
    render(<AdminDashboardPage />);
    
    expect(await screen.findByText('Recent Courses')).toBeInTheDocument();
  });

  it('displays top courses section', async () => {
    render(<AdminDashboardPage />);
    
    expect(await screen.findByText('Top Courses')).toBeInTheDocument();
  });
});
