import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Button } from '../button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders disabled button', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  it('renders variant types', () => {
    const { container: defaultContainer } = render(<Button variant="default">Default</Button>);
    const { container: destructiveContainer } = render(<Button variant="destructive">Destructive</Button>);
    const { container: outlineContainer } = render(<Button variant="outline">Outline</Button>);
    
    expect(defaultContainer).toBeInTheDocument();
    expect(destructiveContainer).toBeInTheDocument();
    expect(outlineContainer).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { container: smContainer } = render(<Button size="sm">Small</Button>);
    const { container: lgContainer } = render(<Button size="lg">Large</Button>);
    
    expect(smContainer).toBeInTheDocument();
    expect(lgContainer).toBeInTheDocument();
  });
});
