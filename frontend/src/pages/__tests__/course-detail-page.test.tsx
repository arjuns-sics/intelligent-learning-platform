import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { CourseDetailPage } from '@/pages/course-detail-page';

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
      instructor: { name: 'Test Instructor' },
      category: 'Development',
      level: 'Beginner',
      modules: [],
      rating: { average: 4.5, count: 10 },
      enrolledStudents: 100,
    },
  })),
}));

describe('CourseDetailPage', () => {
  it('renders course detail page', async () => {
    render(<CourseDetailPage />);
    expect(await screen.findByText(/Test Course/i)).toBeInTheDocument();
  });

  it('displays course title', async () => {
    render(<CourseDetailPage />);
    expect(await screen.findByText('Test Course')).toBeInTheDocument();
  });

  it('displays course instructor', async () => {
    render(<CourseDetailPage />);
    expect(await screen.findByText(/Test Instructor/i)).toBeInTheDocument();
  });

  it('displays course description', async () => {
    render(<CourseDetailPage />);
    expect(await screen.findByText('Test Description')).toBeInTheDocument();
  });

  it('displays course category', async () => {
    render(<CourseDetailPage />);
    expect(await screen.findByText('Development')).toBeInTheDocument();
  });

  it('displays course level', async () => {
    render(<CourseDetailPage />);
    expect(await screen.findByText('Beginner')).toBeInTheDocument();
  });
});
