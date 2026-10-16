import { describe, expect, it } from 'vitest';
import { formatRating, ratingLabel, ratingShares, ratingTone } from './ratingLabel';

describe('ratingShares', () => {
  it('positivas 4–5★, neutras 3★ e críticas 1–2★ com o % do total', () => {
    expect(ratingShares({ 1: 1, 2: 1, 3: 2, 4: 3, 5: 5 }, 12)).toEqual({
      positive: { count: 8, pct: 67 },
      neutral: { count: 2, pct: 17 },
      critical: { count: 2, pct: 17 },
    });
  });

  it('sem avaliações, tudo zero', () => {
    expect(ratingShares({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 0).positive).toEqual({ count: 0, pct: 0 });
  });
});

describe('ratingLabel', () => {
  it.each([
    [5, 'Ótima'],
    [4.5, 'Ótima'],
    [4.4, 'Boa'],
    [3.5, 'Boa'],
    [3.4, 'Mediana'],
    [2.5, 'Mediana'],
    [2.4, 'Ruim'],
    [1.5, 'Ruim'],
    [1.4, 'Péssima'],
    [1, 'Péssima'],
  ] as const)('%s → %s', (mean, label) => {
    expect(ratingLabel(mean)).toBe(label);
  });

  it('classifica pelo número que a tela mostra (uma casa)', () => {
    // 4,46 aparece como "4,5" — o rótulo não pode dizer "Boa".
    expect(formatRating(4.46)).toBe('4,5');
    expect(ratingLabel(4.46)).toBe('Ótima');
    expect(ratingLabel(4.44)).toBe('Boa');
  });

  it('tom de cor acompanha o rótulo', () => {
    expect(ratingTone(4.2)).toBe('positive');
    expect(ratingTone(3)).toBe('neutral');
    expect(ratingTone(2)).toBe('negative');
  });
});
