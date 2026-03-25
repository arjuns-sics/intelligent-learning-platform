import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { LandingPage } from '@/pages/landing-page';

describe('LandingPage', () => {
  it('renders landing page', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Intelligent Learning Platform/i)).toBeInTheDocument();
  });

  it('displays hero section', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Personalized Learning/i)).toBeInTheDocument();
  });

  it('displays get started button', () => {
    render(<LandingPage />);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('displays features section', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
  });

  it('displays login link', () => {
    render(<LandingPage />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
