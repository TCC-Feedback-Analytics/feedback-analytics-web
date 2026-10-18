import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  getFeedbackStats: vi.fn(),
  getFeedbackTimeline: vi.fn(() => Promise.resolve({ bucket: 'week', tz: 'America/Sao_Paulo', total: 0, points: [] })),
  useInsightsControls: vi.fn(),
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('src/services/serviceFeedbacks', () => ({
  ServiceGetFeedbackStats: mocks.getFeedbackStats,
  ServiceGetFeedbackTimeline: mocks.getFeedbackTimeline,
  ServiceGetFeedbackHeatmap: () => Promise.resolve({ tz: 'America/Sao_Paulo', total: 0, cells: [] }),
}));

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: mocks.useInsightsControls,
}));

import Ratings from '../user/ratings';
import { previousMetricsPeriodParams } from 'src/lib/utils/metricsPeriod';

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

  describe('comparação com o período anterior', () => {
    const previousParams = previousMetricsPeriodParams({ preset: 'LAST_30_DAYS' });

    function compareWith(previous: unknown) {
      mocks.useInsightsControls.mockReturnValue({
        scope: 'PRODUCT',
        catalogItemId: 'p1',
        catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
        period: { preset: 'LAST_30_DAYS' },
        compare: true,
      });
      mocks.getFeedbackStats.mockImplementation((params: { start_date?: string }) =>
        Promise.resolve(params.start_date === previousParams.start_date ? previous : stats),
      );
    }

    it('busca o período anterior do mesmo escopo e mostra quanto mudou', async () => {
      compareWith({
        ...stats,
        totalFeedbacks: 200,
        averageRating: 4.4,
        starMeanCI: { lower: 4.3, upper: 4.5 },
        ratingDistribution: { 1: 5, 2: 5, 3: 20, 4: 70, 5: 100 },
      });
      renderPage();

      expect(await screen.findByLabelText('Média: −1,0 vs. 30 dias anteriores, piorou')).toBeInTheDocument();
      // Positivas 50% vs. 85%; críticas 25% vs. 5% (subir críticas é piorar).
      expect(screen.getByLabelText('Positivas: −35 pontos vs. 30 dias anteriores, piorou')).toBeInTheDocument();
      expect(screen.getByLabelText('Críticas: +20 pontos vs. 30 dias anteriores, piorou')).toBeInTheDocument();
      expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1', ...previousParams });
    });

    it('com margens que se sobrepõem, diz que a diferença é incerta', async () => {
      compareWith({
        ...stats,
        totalFeedbacks: 18,
        averageRating: 3.0,
        starMeanCI: { lower: 2.4, upper: 3.6 },
        ratingDistribution: { 1: 3, 2: 3, 3: 6, 4: 3, 5: 3 },
      });
      renderPage();

      expect(await screen.findByLabelText('Média: +0,4 vs. 30 dias anteriores, diferença incerta')).toBeInTheDocument();
      expect(screen.getAllByText('· Diferença incerta').length).toBeGreaterThan(0);
    });

    it('sem avaliações no período anterior, diz isso', async () => {
      compareWith({ ...stats, totalFeedbacks: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      renderPage();

      expect(await screen.findAllByText('Sem dados no período anterior')).toHaveLength(3);
    });

    it('com a comparação desligada, não busca o período anterior', async () => {
      mocks.useInsightsControls.mockReturnValue({
        scope: 'PRODUCT',
        catalogItemId: 'p1',
        catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
        period: { preset: 'LAST_30_DAYS' },
        compare: false,
      });
      renderPage();

      await screen.findByRole('region', { name: 'Avaliação por estrelas' });
      expect(mocks.getFeedbackStats).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/vs\. 30 dias anteriores/)).not.toBeInTheDocument();
    });
  });

  it('avisa quando não consegue carregar', async () => {
    mocks.getFeedbackStats.mockRejectedValue(new Error('offline'));
    renderPage();
    expect(await screen.findByText(/Não foi possível carregar as avaliações/)).toBeInTheDocument();
  });
});
