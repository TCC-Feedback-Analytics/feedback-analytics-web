import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  getFeedbackCustomers: vi.fn(),
  controls: {
    scope: 'PRODUCT',
    catalogItemId: 'p1',
    catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
    period: { preset: 'ALL' },
  },
}));

vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetFeedbackCustomers: mocks.getFeedbackCustomers }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));

import SectionReturningCustomers from './SectionReturningCustomers';

const base = {
  identified: 50,
  unidentified: 2,
  firstTimeCount: 40,
  returningCount: 10,
  returningPct: 20,
  returningPctCI: { lower: 11, upper: 33 },
  customers: 45,
  returningCustomers: 7,
  firstTime: { n: 40, mean: 3.8, ci: { lower: 3.6, upper: 4.0 } },
  returning: { n: 10, mean: 4.8, ci: { lower: 4.5, upper: 5 } },
};

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('SectionReturningCustomers', () => {
  it('mostra o % de quem volta, os clientes e quem está mais satisfeito', async () => {
    mocks.getFeedbackCustomers.mockResolvedValue(base);
    render(<SectionReturningCustomers />);

    const section = await screen.findByRole('region', { name: /Clientes que voltam/ });
    expect(await within(section).findByText('20%')).toBeInTheDocument();
    expect(within(section).getByText(/das avaliações vieram de quem já tinha avaliado/)).toHaveTextContent('(10 de 50)');
    expect(within(section).getByText('45 clientes avaliaram, 7 mais de uma vez')).toBeInTheDocument();
    expect(within(section).getByText(/Quem volta dá/)).toHaveTextContent('Quem volta dá 4,8; primeira vez, 3,8.');
    expect(within(section).getByText('Quem volta está mais satisfeito')).toBeInTheDocument();
    expect(within(section).getByText(/o número é aproximado/)).toBeInTheDocument();
    expect(mocks.getFeedbackCustomers).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1' });
  });

  it('com margens que se sobrepõem, a diferença é incerta', async () => {
    mocks.getFeedbackCustomers.mockResolvedValue({
      ...base,
      returning: { n: 4, mean: 4.3, ci: { lower: 3.2, upper: 5 } },
    });
    render(<SectionReturningCustomers />);

    expect(await screen.findByText(/Diferença incerta/)).toBeInTheDocument();
  });

  it('sem ninguém que voltou, diz isso com o escopo', async () => {
    mocks.getFeedbackCustomers.mockResolvedValue({ ...base, returningCount: 0, returningPct: 0, returningCustomers: 0, returning: null });
    render(<SectionReturningCustomers />);

    expect(await screen.findByText('Nenhum cliente voltou a avaliar no produto Pizza.')).toBeInTheDocument();
  });

  it('sem avaliações identificadas, diz que ainda não há avaliações', async () => {
    mocks.getFeedbackCustomers.mockResolvedValue({ ...base, identified: 0, firstTime: null, returning: null });
    render(<SectionReturningCustomers />);

    expect(await screen.findByText('Ainda sem avaliações no produto Pizza.')).toBeInTheDocument();
  });
});
