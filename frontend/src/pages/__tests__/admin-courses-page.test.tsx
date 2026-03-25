import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { AdminCoursesPage } from '@/pages/admin-courses-page';

// Mock the admin service
vi.mock('@/services/admin.service', () => ({
  getAllCourses: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      courses: [
        {
          id: '1',
          _id: '1',
          title: 'Introduction to Programming',
          description: 'Learn programming basics',
          instructor: 'John Instructor',
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
        {
          id: '2',
          _id: '2',
          title: 'Advanced Web Development',
          description: 'Advanced web concepts',
          instructor: 'Jane Instructor',
          instructorId: 'inst2',
          category: 'Development',
          level: 'Advanced',
          status: 'draft' as const,
          published: false,
          enrolledStudents: 30,
          rating: 4.8,
          modules: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      },
    },
  })),
  deleteCourse: vi.fn(() => Promise.resolve({ success: true })),
  updateCourseStatus: vi.fn(() => Promise.resolve({ success: true })),
}));

describe('AdminCoursesPage', () => {
  it('renders without crashing', async () => {
    render(<AdminCoursesPage />);
    
    // Wait for the page to load
    expect(await screen.findByText(/Course Management/i)).toBeInTheDocument();
  });

  it('displays page header', async () => {
    render(<AdminCoursesPage />);
    
    expect(await screen.findByText('Course Management')).toBeInTheDocument();
    expect(await screen.findByText(/Manage courses, content, and publications/i)).toBeInTheDocument();
  });

  it('displays filters section', async () => {
    render(<AdminCoursesPage />);
    
    expect(await screen.findByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/Search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
  });

  it('displays courses table header', async () => {
    render(<AdminCoursesPage />);
    
    expect(await screen.findByText('Courses')).toBeInTheDocument();
  });

  it('displays course data', async () => {
    render(<AdminCoursesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
      expect(screen.getByText('Advanced Web Development')).toBeInTheDocument();
      expect(screen.getByText('John Instructor')).toBeInTheDocument();
      expect(screen.getByText('Jane Instructor')).toBeInTheDocument();
    });
  });

  it('displays category badges', async () => {
    render(<AdminCoursesPage />);
    
    await waitFor(() => {
      const developmentBadges = screen.getAllByText('Development');
      expect(developmentBadges.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays status badges', async () => {
    render(<AdminCoursesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('published')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });
  });

  it('displays action buttons', async () => {
    render(<AdminCoursesPage />);
    
    await waitFor(() => {
      const unpublishButtons = screen.queryAllByText('Unpublish');
      const publishButtons = screen.queryAllByText('Publish');
      expect(unpublishButtons.length + publishButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays pagination info', async () => {
    render(<AdminCoursesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to/i)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of/i)).toBeInTheDocument();
    });
  });
});
