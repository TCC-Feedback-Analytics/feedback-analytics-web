import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  getFeedbackStats: vi.fn(),
  controls: {
    scope: 'PRODUCT',
    catalogItemId: 'p1',
    catalogItemOptions: [] as Array<{ id: string; name: string; kind: string }>,
    period: { preset: 'ALL' } as { preset: string },
    setPeriod: vi.fn(),
  },
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetFeedbackStats: mocks.getFeedbackStats }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));

import CompareItems from '../user/compare';

function stats(overrides: Record<string, unknown>) {
  return {
    totalFeedbacks: 100,
    averageRating: 4,
    starMeanCI: { lower: 3.9, upper: 4.1 },
    ratingDistribution: { 1: 5, 2: 5, 3: 10, 4: 40, 5: 40 },
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    ...overrides,
  };
}

const byItem: Record<string, unknown> = {
  p1: stats({ averageRating: 4.6, starMeanCI: { lower: 4.5, upper: 4.7 }, aiSentiment: { positive: 80, neutral: 10, negative: 10, netSentimentScore: 70, confidenceTier: 'good' } }),
  p2: stats({ averageRating: 4.0, starMeanCI: { lower: 3.9, upper: 4.1 } }),
  s1: stats({ totalFeedbacks: 12, averageRating: 3.8, starMeanCI: { lower: 3.2, upper: 4.4 } }),
  s2: stats({ totalFeedbacks: 9, averageRating: 3.5, starMeanCI: { lower: 2.8, upper: 4.2 } }),
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/user/compare']}>
      <CompareItems />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.controls.scope = 'PRODUCT';
  mocks.controls.catalogItemId = 'p1';
  mocks.controls.period = { preset: 'ALL' };
  mocks.controls.catalogItemOptions = [
    { id: 'p1', name: 'Pizza', kind: 'PRODUCT' },
    { id: 'p2', name: 'Refrigerante', kind: 'PRODUCT' },
    { id: 's1', name: 'Entrega', kind: 'SERVICE' },
    { id: 's2', name: 'Retirada', kind: 'SERVICE' },
    { id: 'd1', name: 'Cozinha', kind: 'DEPARTMENT' },
  ];
  mocks.getFeedbackStats.mockImplementation((params: { catalog_item_id: string }) => Promise.resolve(byItem[params.catalog_item_id]));
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('[Unidade] Comparar itens', () => {
  it('começa pelo item do escopo e compara com outro do mesmo tipo', async () => {
    renderPage();

    const table = await screen.findByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'A · Pizza' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'B · Refrigerante' })).toBeInTheDocument();
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1' });
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p2' });

    const mean = within(table).getByRole('row', { name: /^Média/ });
    expect(within(mean).getByText('4,6')).toBeInTheDocument();
    expect(within(mean).getByText(/0,6 melhor/)).toBeInTheDocument();

    const tone = within(table).getByRole('row', { name: /^Tom dos comentários/ });
    expect(within(tone).getByText('Sem comentários analisados')).toBeInTheDocument();
    expect(within(tone).getByText('Sem dados para comparar')).toBeInTheDocument();

    // Departamento com 1 item não dá para comparar: fica fora dos tipos.
    expect(screen.getByRole('button', { name: 'Produtos' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Departamentos' })).not.toBeInTheDocument();
  });

  it('troca de tipo e diz quando a diferença é incerta', async () => {
    renderPage();
    await screen.findByRole('table');

    fireEvent.click(screen.getByRole('button', { name: 'Serviços' }));
    const table = await screen.findByRole('table');
    expect(await within(table).findByRole('columnheader', { name: 'A · Entrega' })).toBeInTheDocument();
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'SERVICE', catalog_item_id: 's2' });

    const mean = within(table).getByRole('row', { name: /^Média/ });
    expect(within(mean).getByText('Diferença incerta')).toBeInTheDocument();
  });

  it('usa o período escolhido para os dois itens', async () => {
    mocks.controls.period = { preset: 'CUSTOM', from: '2026-10-01', to: '2026-10-17' } as { preset: string };
    renderPage();
    await screen.findByRole('table');

    const period = { start_date: new Date(2026, 9, 1).toISOString(), end_date: new Date(2026, 9, 18).toISOString() };
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1', ...period });
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p2', ...period });
  });

  it('sem 2 itens do mesmo tipo, explica como habilitar', () => {
    mocks.controls.scope = 'COMPANY';
    mocks.controls.catalogItemId = '';
    mocks.controls.catalogItemOptions = [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }];
    renderPage();

    expect(screen.getByText(/cadastre pelo menos 2 itens do mesmo tipo/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/user/edit/types-feedback');
    expect(mocks.getFeedbackStats).not.toHaveBeenCalled();
  });
});
