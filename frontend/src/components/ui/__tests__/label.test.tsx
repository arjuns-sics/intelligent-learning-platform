import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Label } from '../label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label htmlFor="test">Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders label with htmlFor', () => {
    render(<Label htmlFor="input-id">Label</Label>);
    expect(screen.getByText('Label')).toHaveAttribute('for', 'input-id');
  });
});
