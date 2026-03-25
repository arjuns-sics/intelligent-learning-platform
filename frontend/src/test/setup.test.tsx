import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';

describe('Test Setup', () => {
  it('vitest is working', () => {
    expect(1 + 1).toBe(2);
  });

  it('can render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    const { getByText } = render(<TestComponent />);
    expect(getByText('Hello Test')).toBeInTheDocument();
  });
});
