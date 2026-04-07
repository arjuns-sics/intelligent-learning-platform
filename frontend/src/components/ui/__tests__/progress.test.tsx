import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Progress } from '../progress';

describe('Progress', () => {
  it('renders progress bar', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders progress with value', () => {
    render(<Progress value={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
  });

  it('renders progress at 0', () => {
    render(<Progress value={0} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders progress at 100', () => {
    render(<Progress value={100} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });
});
