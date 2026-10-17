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
}));

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: mocks.useInsightsControls,
}));

import Ratings from '../user/ratings';

const stats = {
  totalFeedbacks: 20,
  averageRating: 3.4,
  starMeanCI: { lower: 2.9, upper: 3.9 },
  ratingDistribution: { 1: 2, 2: 3, 3: 5, 4: 6, 5: 4 },
  sentimentBreakdown: { positive: 10, neutral: 5, negative: 5 },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/user/ratings']}>
      <Ratings />
    </MemoryRouter>,
  );
}

describe('[Unidade] Página Todas as métricas de estrelas', () => {
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

  it('busca as estatísticas pelo escopo do cabeçalho', async () => {
    renderPage();
    await screen.findByRole('region', { name: 'Avaliação por estrelas' });
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1' });
  });

  it('com período, busca as estatísticas do período e diz isso na etiqueta', async () => {
    mocks.useInsightsControls.mockReturnValue({
      scope: 'PRODUCT',
      catalogItemId: 'p1',
      catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
      period: { preset: 'CUSTOM', from: '2026-10-01', to: '2026-10-17' },
    });
    renderPage();
    const section = await screen.findByRole('region', { name: 'Avaliação por estrelas' });

    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({
      scope_type: 'PRODUCT',
      catalog_item_id: 'p1',
      start_date: new Date(2026, 9, 1).toISOString(),
      end_date: new Date(2026, 9, 18).toISOString(),
    });
    expect(within(section).getByRole('button', { name: /Produto · Pizza · 01\/10\/2026 a 17\/10\/2026/ })).toBeInTheDocument();
  });

  it('mostra média, positivas, neutras, críticas e a distribuição, sem o link "ver todas"', async () => {
    renderPage();
    const section = await screen.findByRole('region', { name: 'Avaliação por estrelas' });

    expect(within(section).getByRole('button', { name: /Produto · Pizza/ })).toBeInTheDocument();
    expect(within(section).getByText('3,4')).toBeInTheDocument();
    expect(within(section).getByText('Mediana')).toBeInTheDocument();
    // Positivas 10 (50%), neutras 5 (25%), críticas 5 (25%): somam 100%.
    expect(within(section).getByText('Neutras (3★)')).toBeInTheDocument();
    expect(within(section).getByText('· 50%')).toBeInTheDocument();
    expect(within(section).getAllByText('· 25%')).toHaveLength(2);
    expect(within(section).queryByRole('link', { name: /Ver todas/ })).not.toBeInTheDocument();

    expect(screen.getByText('Distribuição das avaliações')).toBeInTheDocument();
    expect(screen.getByText('Percentual de avaliações em cada nota, no escopo selecionado')).toBeInTheDocument();
  });

  it('avisa quando não consegue carregar', async () => {
    mocks.getFeedbackStats.mockRejectedValue(new Error('offline'));
    renderPage();
    expect(await screen.findByText(/Não foi possível carregar as avaliações/)).toBeInTheDocument();
  });
});
