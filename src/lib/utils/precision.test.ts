import { describe, expect, it } from 'vitest';
import { formatPrecisionRange, getPrecision, halfWidth, precisionReason } from './precision';

describe('getPrecision', () => {
  it('sem respostas não há indicador', () => {
    expect(getPrecision({ n: 0, interval: { lower: 4, upper: 4 }, kind: 'mean' })).toBeNull();
  });

  it('com menos de 10 respostas é sempre baixa, mesmo com faixa de largura zero', () => {
    expect(getPrecision({ n: 3, interval: { lower: 5, upper: 5 }, kind: 'mean' })).toBe('baixa');
    expect(getPrecision({ n: 9, interval: null, kind: 'mean' })).toBe('baixa');
  });

  it('sem faixa (com respostas suficientes) não classifica', () => {
    expect(getPrecision({ n: 50, interval: undefined, kind: 'mean' })).toBeNull();
  });

  it.each([
    [{ lower: 4.0, upper: 4.5 }, 'alta'], // ±0,25
    [{ lower: 3.9, upper: 4.5 }, 'media'], // ±0,3
    [{ lower: 3.7, upper: 4.7 }, 'media'], // ±0,5
    [{ lower: 3.6, upper: 4.8 }, 'baixa'], // ±0,6
  ] as const)('média 1–5: faixa %j → %s', (interval, expected) => {
    expect(getPrecision({ n: 50, interval, kind: 'mean' })).toBe(expected);
  });

  it.each([
    [{ lower: 60, upper: 70 }, 'alta'], // ±5 p.p.
    [{ lower: 55, upper: 75 }, 'media'], // ±10 p.p.
    [{ lower: 50, upper: 76 }, 'baixa'], // ±13 p.p.
  ] as const)('porcentagem 0–100: faixa %j → %s', (interval, expected) => {
    expect(getPrecision({ n: 50, interval, kind: 'pct' })).toBe(expected);
  });

  it('fração 0–1 é lida em pontos percentuais', () => {
    expect(halfWidth({ lower: 0.6, upper: 0.7 }, 'fraction')).toBeCloseTo(5);
    expect(getPrecision({ n: 50, interval: { lower: 0.6, upper: 0.7 }, kind: 'fraction' })).toBe('alta');
    expect(getPrecision({ n: 50, interval: { lower: 0.4, upper: 0.7 }, kind: 'fraction' })).toBe('baixa');
  });
});

describe('textos do painel', () => {
  it('faixa em linguagem simples', () => {
    expect(formatPrecisionRange({ lower: 4.03, upper: 4.36 }, 'mean')).toBe('4,0 e 4,4');
    expect(formatPrecisionRange({ lower: 57.8, upper: 74.5 }, 'pct')).toBe('58% e 75%');
    expect(formatPrecisionRange({ lower: 0.31, upper: 0.5 }, 'fraction')).toBe('31% e 50%');
  });

  it('explica o porquê do nível', () => {
    expect(precisionReason({ n: 4, interval: null, kind: 'mean' })).toMatch(/menos de 10 respostas/);
    expect(precisionReason({ n: 40, interval: { lower: 4, upper: 4.4 }, kind: 'mean' })).toMatch(/0,2 ponto/);
    expect(precisionReason({ n: 40, interval: { lower: 60, upper: 76 }, kind: 'pct' })).toMatch(/8 pontos percentuais/);
  });
});
