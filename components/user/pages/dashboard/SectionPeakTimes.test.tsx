import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  getFeedbackHeatmap: vi.fn(),
  controls: {
    scope: 'COMPANY',
    catalogItemId: '',
    catalogItemOptions: [],
    period: { preset: 'LAST_30_DAYS' },
  },
}));

vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetFeedbackHeatmap: mocks.getFeedbackHeatmap }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));

import SectionPeakTimes from './SectionPeakTimes';

function heatmap(filled: Array<[number, number, number, number]>) {
  const cells = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    for (let band = 0; band < 4; band++) {
      const found = filled.find(([d, b]) => d === weekday && b === band);
      cells.push({ weekday, band, count: found?.[2] ?? 0, mean: found ? found[3] : null });
    }
  }
  return { tz: 'America/Sao_Paulo', total: filled.reduce((sum, [, , count]) => sum + count, 0), cells };
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('SectionPeakTimes', () => {
  it('resume o pico e a pior média e mostra a média em cada dia × faixa', async () => {
    mocks.getFeedbackHeatmap.mockResolvedValue(
      heatmap([
        [6, 3, 30, 4.6],
        [5, 2, 12, 3.4],
        [1, 1, 3, 2],
      ]),
    );
    render(<SectionPeakTimes />);

    const section = await screen.findByRole('region', { name: /Dias e horários de pico/ });
    expect(await within(section).findByText(/Mais avaliações:/)).toHaveTextContent('Mais avaliações: sábado à noite (30)');
    expect(within(section).getByText(/Pior média:/)).toHaveTextContent('Pior média: sexta à tarde (3,4)');

    const table = within(section).getByRole('table', { name: 'Avaliações e média por dia da semana e faixa do dia' });
    const night = within(table).getByRole('row', { name: /Noite/ });
    expect(within(night).getByText('4,6')).toBeInTheDocument();
    expect(within(table).getByTitle('segunda de manhã: 3 avaliações, média 2,0 (poucas avaliações)')).toBeInTheDocument();
    expect(mocks.getFeedbackHeatmap).toHaveBeenCalledWith(
      expect.objectContaining({ scope_type: 'COMPANY', tz: expect.any(String), start_date: expect.any(String) }),
    );
  });

  it('sem avaliações, diz isso com o escopo e o período', async () => {
    mocks.getFeedbackHeatmap.mockResolvedValue(heatmap([]));
    render(<SectionPeakTimes />);

    expect(await screen.findByText('Ainda sem avaliações na empresa (avaliação geral) nos últimos 30 dias.')).toBeInTheDocument();
  });

  it('avisa quando não consegue carregar', async () => {
    mocks.getFeedbackHeatmap.mockRejectedValue(new Error('offline'));
    render(<SectionPeakTimes />);

    expect(await screen.findByText('Não foi possível carregar os dias e horários agora.')).toBeInTheDocument();
  });
});
