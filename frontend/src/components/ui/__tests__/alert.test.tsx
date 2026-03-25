import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
  it('renders alert', () => {
    render(<Alert>Alert Message</Alert>);
    expect(screen.getByText('Alert Message')).toBeInTheDocument();
  });

  it('renders alert with title', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
      </Alert>
    );
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('renders alert with description', () => {
    render(
      <Alert>
        <AlertDescription>Alert Description</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Alert Description')).toBeInTheDocument();
  });
});
