import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { AssignmentSubmissionPage } from '@/pages/assignment-submission-page';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '1', assignmentId: '1' }),
  };
});

describe('AssignmentSubmissionPage', () => {
  it('renders assignment submission page', async () => {
    render(<AssignmentSubmissionPage />);
    expect(await screen.findByText(/Assignment/i)).toBeInTheDocument();
  });

  it('displays submission form', async () => {
    render(<AssignmentSubmissionPage />);
    expect(await screen.findByText(/Submit Assignment/i)).toBeInTheDocument();
  });

  it('displays file upload area', async () => {
    render(<AssignmentSubmissionPage />);
    expect(await screen.findByText(/Upload your work/i)).toBeInTheDocument();
  });
});
