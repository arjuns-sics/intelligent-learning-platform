import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { CourseLearnPage } from '@/pages/course-learn-page';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '1', lessonId: '1' }),
  };
});

vi.mock('@/services/enrollment.service', () => ({
  getEnrollment: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      course: {
        _id: '1',
        title: 'Test Course',
        modules: [],
      },
      enrollment: {
        progress: 0,
        completedLessons: [],
      },
    },
  })),
}));

describe('CourseLearnPage', () => {
  it('renders course learn page', async () => {
    render(<CourseLearnPage />);
    expect(await screen.findByText(/Test Course/i)).toBeInTheDocument();
  });

  it('displays course content', async () => {
    render(<CourseLearnPage />);
    expect(await screen.findByText(/Course Content/i)).toBeInTheDocument();
  });

  it('displays progress indicator', async () => {
    render(<CourseLearnPage />);
    expect(await screen.findByText(/Progress/i)).toBeInTheDocument();
  });
});
