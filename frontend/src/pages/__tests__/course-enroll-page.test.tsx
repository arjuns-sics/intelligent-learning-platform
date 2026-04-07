import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { CourseEnrollPage } from '@/pages/course-enroll-page';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '1' }),
  };
});

vi.mock('@/services/enrollment.service', () => ({
  checkEnrollment: vi.fn(() => Promise.resolve({
    success: true,
    data: { enrolled: false },
  })),
  enrollInCourse: vi.fn(() => Promise.resolve({ success: true })),
}));

describe('CourseEnrollPage', () => {
  it('renders course enroll page', async () => {
    render(<CourseEnrollPage />);
    expect(await screen.findByText(/Enroll in Course/i)).toBeInTheDocument();
  });

  it('displays enroll button', async () => {
    render(<CourseEnrollPage />);
    expect(await screen.findByRole('button', { name: /enroll/i })).toBeInTheDocument();
  });
});
