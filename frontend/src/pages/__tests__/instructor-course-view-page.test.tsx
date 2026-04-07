import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { InstructorCourseViewPage } from '@/pages/instructor-course-view-page';

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
      title: 'Instructor Course',
      description: 'Test',
    },
  })),
}));

describe('InstructorCourseViewPage', () => {
  it('renders instructor course view', async () => {
    render(<InstructorCourseViewPage />);
    expect(await screen.findByText(/Instructor Course/i)).toBeInTheDocument();
  });

  it('displays course management options', async () => {
    render(<InstructorCourseViewPage />);
    expect(await screen.findByText(/Course Analytics/i)).toBeInTheDocument();
  });
});
