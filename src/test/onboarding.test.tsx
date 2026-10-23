import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingView } from '../features/onboarding/OnboardingView';

describe('OnboardingView Component', () => {
  it('renders all 3 onboarding options: empty curriculum, import JSON, and explore demo', () => {
    const handleCreateEmpty = vi.fn();
    const handleLoadDemo = vi.fn();
    const handleImport = vi.fn();

    render(
      <OnboardingView
        onCreateEmpty={handleCreateEmpty}
        onLoadDemo={handleLoadDemo}
        onImportClick={handleImport}
      />
    );

    expect(screen.getByText('Welcome to Curriculum Simulation')).toBeInTheDocument();
    expect(screen.getByText('Create Empty Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Import Curriculum JSON')).toBeInTheDocument();
    expect(screen.getByText('Explore Demo Curriculum')).toBeInTheDocument();

    // Test button clicks
    fireEvent.click(screen.getByText('Start Empty'));
    expect(handleCreateEmpty).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Upload JSON'));
    expect(handleImport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Load Sample Demo'));
    expect(handleLoadDemo).toHaveBeenCalledTimes(1);
  });
});
