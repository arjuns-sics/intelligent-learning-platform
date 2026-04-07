import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { CourseEditPage } from '@/pages/course-edit-page';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '1' }),
  };
});

vi.mock('@/services/course.service', () => ({
  getCourse: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      _id: '1',
      title: 'Test Course',
      description: 'Test Description',
    },
  })),
  updateCourse: vi.fn(() => Promise.resolve({ success: true })),
}));

describe('CourseEditPage', () => {
  it('renders course edit page', async () => {
    render(<CourseEditPage />);
    expect(await screen.findByText(/Edit Course/i)).toBeInTheDocument();
  });

  it('displays edit form', async () => {
    render(<CourseEditPage />);
    expect(await screen.findByText(/Course Details/i)).toBeInTheDocument();
  });

  it('displays save button', async () => {
    render(<CourseEditPage />);
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument();
  });
});
