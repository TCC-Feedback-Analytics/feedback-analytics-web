import { describe, expect, it } from 'vitest';
import { cellPhrase, peakSummary } from './peakTimes';

const cell = (weekday: number, band: number, count: number, mean: number | null) => ({ weekday, band, count, mean });

describe('peakTimes', () => {
  it('nomeia o dia e a faixa em português', () => {
    expect(cellPhrase({ weekday: 5, band: 2 })).toBe('sexta à tarde');
    expect(cellPhrase({ weekday: 0, band: 0 })).toBe('domingo de madrugada');
    expect(cellPhrase({ weekday: 6, band: 3 })).toBe('sábado à noite');
  });

  it('mais avaliações e pior média só entre faixas com avaliações suficientes', () => {
    const { busiest, worst } = peakSummary([
      cell(6, 3, 30, 4.6),
      cell(5, 2, 12, 3.4),
      cell(1, 1, 3, 1.5), // média menor, mas só 3 avaliações
    ]);
    expect(busiest).toMatchObject({ weekday: 6, band: 3 });
    expect(worst).toMatchObject({ weekday: 5, band: 2 });
  });

  it('sem duas faixas para comparar, não aponta pior média', () => {
    expect(peakSummary([cell(6, 3, 30, 4.6), cell(5, 2, 4, 2)]).worst).toBeNull();
    expect(peakSummary([cell(0, 0, 0, null)]).busiest).toBeNull();
  });
});
