import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  controls: {
    scope: 'COMPANY',
    setScope: vi.fn(),
    catalogItemId: '',
    setCatalogItemId: vi.fn(),
    catalogItemOptions: [],
    availableScopes: ['COMPANY'],
    period: { preset: 'ALL' } as { preset: string },
    setPeriod: vi.fn(),
    compare: false,
    setCompare: vi.fn(),
  },
}));

vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));

import InsightsControlsBar from './InsightsControlsBar';

beforeEach(() => {
  mocks.controls.period = { preset: 'ALL' };
  mocks.controls.compare = false;
  mocks.controls.setCompare.mockReset();
});

afterEach(cleanup);

describe('InsightsControlsBar — comparação com o período anterior', () => {
  it('sem período escolhido, não oferece a comparação', () => {
    render(<InsightsControlsBar />);
    expect(screen.queryByRole('switch', { name: 'Comparar com o período anterior' })).not.toBeInTheDocument();
  });

  it('com período, liga e desliga a comparação', () => {
    mocks.controls.period = { preset: 'LAST_30_DAYS' };
    const { rerender } = render(<InsightsControlsBar />);

    const toggle = screen.getByRole('switch', { name: 'Comparar com o período anterior' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(mocks.controls.setCompare).toHaveBeenCalledWith(true);

    mocks.controls.compare = true;
    rerender(<InsightsControlsBar />);
    expect(screen.getByRole('switch', { name: 'Comparar com o período anterior' })).toHaveAttribute('aria-checked', 'true');
  });
});
