import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { AdminDashboardPage } from '@/pages/admin-dashboard-page';
import { AdminUsersPage } from '@/pages/admin-users-page';
import { AdminCoursesPage } from '@/pages/admin-courses-page';

// Mock services
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
          title: 'Recent Course',
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
  getAllUsers: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      users: [
        {
          _id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'Student' as const,
          profile_image: null,
          preferredMedia: null,
          masteryScore: 0,
          weaknessTags: [],
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      },
    },
  })),
  getAllCourses: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      courses: [
        {
          id: '1',
          _id: '1',
          title: 'Test Course',
          description: 'Test Description',
          instructor: 'Test Instructor',
          instructorId: 'inst1',
          category: 'Development',
          level: 'Beginner',
          status: 'published' as const,
          published: true,
          enrolledStudents: 50,
          rating: 4.5,
          modules: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      },
    },
  })),
  deleteUser: vi.fn(() => Promise.resolve({ success: true })),
  updateUserRole: vi.fn(() => Promise.resolve({ success: true })),
  deleteCourse: vi.fn(() => Promise.resolve({ success: true })),
  updateCourseStatus: vi.fn(() => Promise.resolve({ success: true })),
  getUserById: vi.fn(),
  getCourseById: vi.fn(),
}));

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

describe('Admin Pages - Integration Tests', () => {
  describe('AdminDashboardPage', () => {
    it('renders without crashing', async () => {
      render(<AdminDashboardPage />);
      expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
    });

    it('has no runtime errors during render', async () => {
      const { container } = render(<AdminDashboardPage />);
      expect(container).toBeInTheDocument();
      await screen.findByText(/Admin Dashboard/i);
    });
  });

  describe('AdminUsersPage', () => {
    it('renders without crashing', async () => {
      render(<AdminUsersPage />);
      expect(await screen.findByText(/User Management/i)).toBeInTheDocument();
    });

    it('has no runtime errors during render', async () => {
      const { container } = render(<AdminUsersPage />);
      expect(container).toBeInTheDocument();
      await screen.findByText(/User Management/i);
    });
  });

  describe('AdminCoursesPage', () => {
    it('renders without crashing', async () => {
      render(<AdminCoursesPage />);
      expect(await screen.findByText(/Course Management/i)).toBeInTheDocument();
    });

    it('has no runtime errors during render', async () => {
      const { container } = render(<AdminCoursesPage />);
      expect(container).toBeInTheDocument();
      await screen.findByText(/Course Management/i);
    });
  });
});
