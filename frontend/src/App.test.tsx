import { describe, it, expect } from 'vitest';

import { render } from './tests/test-utils';

describe('Test Setup Verification', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Test</div>;
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('should have access to testing library matchers', () => {
    const TestComponent = () => <button>Click me</button>;
    const { getByRole } = render(<TestComponent />);
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });
});
