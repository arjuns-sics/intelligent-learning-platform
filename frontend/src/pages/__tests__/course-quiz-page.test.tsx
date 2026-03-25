import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { CourseQuizPage } from '@/pages/course-quiz-page';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '1', quizId: '1' }),
  };
});

describe('CourseQuizPage', () => {
  it('renders quiz page', async () => {
    render(<CourseQuizPage />);
    expect(await screen.findByText(/Quiz/i)).toBeInTheDocument();
  });

  it('displays quiz questions container', async () => {
    render(<CourseQuizPage />);
    expect(await screen.findByText(/Quiz Content/i)).toBeInTheDocument();
  });
});
