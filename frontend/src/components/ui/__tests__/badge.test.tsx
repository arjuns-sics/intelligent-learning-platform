import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { container: defaultContainer } = render(<Badge variant="default">Default</Badge>);
    const { container: secondaryContainer } = render(<Badge variant="secondary">Secondary</Badge>);
    const { container: outlineContainer } = render(<Badge variant="outline">Outline</Badge>);
    const { container: destructiveContainer } = render(<Badge variant="destructive">Destructive</Badge>);
    
    expect(defaultContainer).toBeInTheDocument();
    expect(secondaryContainer).toBeInTheDocument();
    expect(outlineContainer).toBeInTheDocument();
    expect(destructiveContainer).toBeInTheDocument();
  });
});
