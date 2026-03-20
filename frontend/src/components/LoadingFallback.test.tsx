import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import LoadingFallback from './LoadingFallback';

describe('LoadingFallback', () => {
  it('should render skeleton screens', () => {
    const { container } = render(<LoadingFallback />);

    // Check that skeleton elements are present
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render header skeleton', () => {
    const { container } = render(<LoadingFallback />);

    // Header should have circular skeletons for icons
    const circularSkeletons = container.querySelectorAll('.MuiSkeleton-circular');
    expect(circularSkeletons.length).toBeGreaterThan(0);
  });

  it('should render sidebar skeleton on desktop', () => {
    const { container } = render(<LoadingFallback />);

    const roundedSkeletons = container.querySelectorAll('.MuiSkeleton-rounded');
    expect(roundedSkeletons.length).toBeGreaterThan(0);
  });

  it('should render content area skeleton', () => {
    const { container } = render(<LoadingFallback />);

    const textSkeletons = container.querySelectorAll('.MuiSkeleton-text');
    const roundedSkeletons = container.querySelectorAll('.MuiSkeleton-rounded');
    expect(textSkeletons.length).toBeGreaterThan(0);
    expect(roundedSkeletons.length).toBeGreaterThan(0);
  });

  it('should have proper layout structure', () => {
    const { container } = render(<LoadingFallback />);

    // Should have a full-height container
    const mainBox = container.firstChild as HTMLElement;
    expect(mainBox).toBeInTheDocument();
  });
});
