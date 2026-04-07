import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Input } from '../input';

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders input with type', () => {
    const { container } = render(<Input type="email" />);
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
  });

  it('renders disabled input', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders input with value', () => {
    render(<Input value="Test Value" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });
});
