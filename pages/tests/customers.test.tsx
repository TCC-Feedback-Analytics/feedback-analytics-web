import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  getFeedbackStats: vi.fn(),
  useInsightsControls: vi.fn(),
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('src/services/serviceFeedbacks', () => ({
  ServiceGetFeedbackStats: mocks.getFeedbackStats,
  ServiceGetFeedbackHeatmap: () => Promise.resolve({ tz: 'America/Sao_Paulo', total: 0, cells: [] }),
  ServiceGetFeedbackCustomers: () => Promise.resolve({ identified: 0, unidentified: 0, firstTimeCount: 0, returningCount: 0, returningPct: null, returningPctCI: null, customers: 0, returningCustomers: 0, firstTime: null, returning: null }),
}));

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: mocks.useInsightsControls,
}));

import Customers from '../user/customers';

const stats = {
  totalFeedbacks: 10,
  averageRating: 4.2,
  starMeanCI: { lower: 3.8, upper: 4.6 },
  ratingDistribution: { 1: 0, 2: 1, 3: 1, 4: 4, 5: 4 },
  channelBreakdown: [
    { channel: 'QR', count: 7, mean: 4.3, ci: { lower: 3.8, upper: 4.8 } },
    { channel: 'LINK', count: 3, mean: 4, ci: { lower: 3, upper: 5 } },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/user/customers']}>
      <Customers />
    </MemoryRouter>,
  );
}

describe('[Unidade] Página Clientes e canais', () => {
  beforeEach(() => {
    mocks.useInsightsControls.mockReturnValue({
      scope: 'PRODUCT',
      catalogItemId: 'p1',
      catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
      period: { preset: 'ALL' },
    });
    mocks.getFeedbackStats.mockResolvedValue(stats);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('junta os canais, os horários de pico e os clientes que voltam, pelo escopo do cabeçalho', async () => {
    renderPage();

    const channels = await screen.findByRole('region', { name: /Por onde chegaram/ });
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1' });
    expect(within(channels).getByText('QR Code')).toBeInTheDocument();
    // Já é a página de destino: o card não leva a ela de novo.
    expect(within(channels).queryByRole('link', { name: /Ver horários de pico/ })).not.toBeInTheDocument();

    expect(screen.getByRole('region', { name: /Dias e horários de pico/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Clientes que voltam/ })).toBeInTheDocument();
  });

  it('avisa quando não consegue carregar os canais e mantém as outras seções', async () => {
    mocks.getFeedbackStats.mockRejectedValue(new Error('offline'));
    renderPage();

    expect(await screen.findByText('Não foi possível carregar os canais agora. Tente novamente em instantes.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Clientes que voltam/ })).toBeInTheDocument();
  });
});
