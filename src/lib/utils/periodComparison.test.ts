import { describe, expect, it } from 'vitest';
import { comparePeriods, nssFromCounts, nssInterval, wilsonPctInterval } from './periodComparison';

describe('comparePeriods', () => {
  it('sem referência no período anterior', () => {
    expect(comparePeriods({ value: 4.2 }, null)).toEqual({ status: 'no-reference' });
  });

  it('diferença que some no arredondamento é "sem mudança"', () => {
    expect(comparePeriods({ value: 4.24 }, { value: 4.21 }, { decimals: 1 })).toEqual({ status: 'same' });
  });

  it('melhora ou piora conforme o sentido da métrica', () => {
    expect(comparePeriods({ value: 60 }, { value: 50 })).toEqual({ status: 'changed', delta: 10, improved: true, uncertain: false });
    // Críticas: subir é piorar.
    expect(comparePeriods({ value: 30 }, { value: 20 }, { higherIsBetter: false })).toEqual({
      status: 'changed',
      delta: 10,
      improved: false,
      uncertain: false,
    });
  });

  it('margens que se sobrepõem deixam a diferença incerta', () => {
    const result = comparePeriods(
      { value: 4.2, interval: { lower: 3.9, upper: 4.5 } },
      { value: 3.9, interval: { lower: 3.5, upper: 4.3 } },
      { decimals: 1 },
    );
    expect(result).toEqual({ status: 'changed', delta: 0.3, improved: true, uncertain: true });

    const clear = comparePeriods(
      { value: 4.6, interval: { lower: 4.5, upper: 4.7 } },
      { value: 3.9, interval: { lower: 3.8, upper: 4.0 } },
      { decimals: 1 },
    );
    expect(clear).toEqual({ status: 'changed', delta: 0.7, improved: true, uncertain: false });
  });
});

describe('intervalos', () => {
  it('Wilson em % fica dentro de 0–100 e contém a proporção', () => {
    const interval = wilsonPctInterval(10, 20)!;
    expect(interval.lower).toBeCloseTo(29.9, 1);
    expect(interval.upper).toBeCloseTo(70.1, 1);
    expect(wilsonPctInterval(0, 0)).toBeNull();
    expect(wilsonPctInterval(0, 10)!.lower).toBeCloseTo(0, 5);
  });

  it('tom: NSS das contagens e a margem dele', () => {
    const counts = { positive: 60, neutral: 20, negative: 20 };
    expect(nssFromCounts(counts)).toBe(40);
    const interval = nssInterval(counts)!;
    expect(interval.lower).toBeLessThan(40);
    expect(interval.upper).toBeGreaterThan(40);
    expect(nssFromCounts({ positive: 0, neutral: 0, negative: 0 })).toBeNull();
    expect(nssInterval({ positive: 0, neutral: 0, negative: 0 })).toBeNull();
  });
});
