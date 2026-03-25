import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { CourseBrowsePage } from '@/pages/course-browse-page';

vi.mock('@/services/course.service', () => ({
  browseCourses: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      courses: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 9,
        pages: 0,
      },
    },
  })),
  getCategories: vi.fn(() => Promise.resolve({
    success: true,
    data: [],
  })),
}));

describe('CourseBrowsePage', () => {
  it('renders course browse page', async () => {
    render(<CourseBrowsePage />);
    expect(await screen.findByText(/Browse Courses/i)).toBeInTheDocument();
  });

  it('displays search input', async () => {
    render(<CourseBrowsePage />);
    expect(await screen.findByPlaceholderText(/search courses/i)).toBeInTheDocument();
  });

  it('displays category filter', async () => {
    render(<CourseBrowsePage />);
    expect(await screen.findByText(/All Categories/i)).toBeInTheDocument();
  });

  it('displays level filter', async () => {
    render(<CourseBrowsePage />);
    expect(await screen.findByText(/All Levels/i)).toBeInTheDocument();
  });

  it('displays sort options', async () => {
    render(<CourseBrowsePage />);
    expect(await screen.findByText(/Sort by/i)).toBeInTheDocument();
  });
});
