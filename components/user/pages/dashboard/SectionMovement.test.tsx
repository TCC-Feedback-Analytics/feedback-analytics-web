import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  getFeedbackTimeline: vi.fn(),
  controls: {
    scope: 'PRODUCT',
    catalogItemId: 'p1',
    catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
    period: { preset: 'LAST_7_DAYS' } as { preset: string },
  },
}));

vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetFeedbackTimeline: mocks.getFeedbackTimeline }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));

import SectionMovement from './SectionMovement';

function week(points: Array<[string, number, number | null]>, bucket = 'day') {
  return {
    bucket,
    tz: 'America/Sao_Paulo',
    total: points.reduce((sum, [, count]) => sum + count, 0),
    points: points.map(([start, count, mean]) => ({ start, count, mean })),
  };
}

beforeEach(() => {
  mocks.controls.period = { preset: 'LAST_7_DAYS' };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('SectionMovement', () => {
  it('mostra o total, o pico e os dados de cada dia, pelo escopo e período do cabeçalho', async () => {
    mocks.getFeedbackTimeline.mockResolvedValue(
      week([
        ['2026-10-14', 0, null],
        ['2026-10-15', 12, 4.25],
        ['2026-10-16', 3, 3.33],
      ]),
    );
    render(<SectionMovement />);

    const section = await screen.findByRole('region', { name: /Movimento das avaliações/ });
    expect(await within(section).findByText('15')).toBeInTheDocument();
    expect(within(section).getByText(/mais avaliações em/)).toHaveTextContent('15/10 (12)');

    const table = within(section).getByRole('table', { name: 'Avaliações e média por dia' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(within(rows[1]).getByText('sem avaliações')).toBeInTheDocument();
    expect(within(rows[2]).getByText('4,3')).toBeInTheDocument();

    expect(mocks.getFeedbackTimeline).toHaveBeenCalledWith(
      expect.objectContaining({ scope_type: 'PRODUCT', catalog_item_id: 'p1', bucket: 'day', tz: expect.any(String), start_date: expect.any(String) }),
    );
  });

  it('com avaliações em um só intervalo, mostra um aviso em vez de uma barra solitária', async () => {
    mocks.getFeedbackTimeline.mockResolvedValue(
      week([
        ['2026-10-12', 0, null],
        ['2026-10-13', 1, 5],
        ['2026-10-14', 0, null],
      ]),
    );
    render(<SectionMovement />);

    expect(await screen.findByText(/Com avaliações em pelo menos 2 dias/)).toBeInTheDocument();
    expect(screen.getByText(/em 13\/10, média 5,0/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('sem avaliações, diz isso com o escopo e o período', async () => {
    mocks.getFeedbackTimeline.mockResolvedValue(week([['2026-10-15', 0, null]]));
    render(<SectionMovement />);

    expect(await screen.findByText('Ainda sem avaliações no produto Pizza nos últimos 7 dias.')).toBeInTheDocument();
  });

  it('sem período e com histórico longo, pede de novo por mês', async () => {
    mocks.controls.period = { preset: 'ALL' };
    const weeks = Array.from({ length: 30 }, (_, index) => [`2026-0${1 + Math.floor(index / 5)}-0${1 + (index % 5)}`, 1, 4] as [string, number, number]);
    mocks.getFeedbackTimeline
      .mockResolvedValueOnce(week(weeks, 'week'))
      .mockResolvedValueOnce(week([['2026-01-01', 10, 4], ['2026-02-01', 20, 4.5]], 'month'));
    render(<SectionMovement variant="detail" />);

    expect(await screen.findByRole('table', { name: 'Avaliações e média por mês' })).toBeInTheDocument();
    expect(mocks.getFeedbackTimeline).toHaveBeenNthCalledWith(1, expect.objectContaining({ bucket: 'week' }));
    expect(mocks.getFeedbackTimeline).toHaveBeenNthCalledWith(2, expect.objectContaining({ bucket: 'month' }));
  });

  it('avisa quando não consegue carregar', async () => {
    mocks.getFeedbackTimeline.mockRejectedValue(new Error('offline'));
    render(<SectionMovement />);

    expect(await screen.findByText('Não foi possível carregar o movimento agora.')).toBeInTheDocument();
  });
});
