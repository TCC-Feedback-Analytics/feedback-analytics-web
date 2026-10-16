import { describe, expect, it } from 'vitest';
import { formatRating, ratingLabel, ratingTone } from './ratingLabel';

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
