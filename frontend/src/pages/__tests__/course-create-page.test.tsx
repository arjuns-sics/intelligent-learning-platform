import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { CourseCreatePage } from '@/pages/course-create-page';

vi.mock('@/services/course.service', () => ({
  createCourse: vi.fn(() => Promise.resolve({ success: true })),
}));

describe('CourseCreatePage', () => {
  it('renders course create page', () => {
    render(<CourseCreatePage />);
    expect(screen.getByText(/Create New Course/i)).toBeInTheDocument();
  });

  it('displays course creation form', () => {
    render(<CourseCreatePage />);
    expect(screen.getByText(/Course Details/i)).toBeInTheDocument();
  });

  it('displays next step button', () => {
    render(<CourseCreatePage />);
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });
});
