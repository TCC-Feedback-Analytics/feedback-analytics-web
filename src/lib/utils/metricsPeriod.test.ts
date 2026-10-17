import { describe, expect, it } from 'vitest';
import {
  hasMetricsPeriod,
  isValidCustomPeriod,
  metricsPeriodKey,
  metricsPeriodParams,
  periodText,
  resolveMetricsPeriodRange,
} from './metricsPeriod';

// 17/10/2026 no meio da tarde, no fuso do navegador.
const now = new Date(2026, 9, 17, 15, 30);

describe('resolveMetricsPeriodRange', () => {
  it('"Todo o período" não recorta nada', () => {
    expect(resolveMetricsPeriodRange({ preset: 'ALL' }, now)).toBeNull();
    expect(metricsPeriodParams({ preset: 'ALL' }, now)).toEqual({});
  });

  it('as janelas incluem hoje e contam dias inteiros', () => {
    expect(resolveMetricsPeriodRange({ preset: 'LAST_7_DAYS' }, now)).toEqual({
      start: new Date(2026, 9, 11),
      end: new Date(2026, 9, 18),
    });
    expect(resolveMetricsPeriodRange({ preset: 'LAST_30_DAYS' }, now)?.start).toEqual(new Date(2026, 8, 18));
    expect(resolveMetricsPeriodRange({ preset: 'LAST_3_MONTHS' }, now)?.start).toEqual(new Date(2026, 6, 18));
    expect(resolveMetricsPeriodRange({ preset: 'LAST_6_MONTHS' }, now)?.start).toEqual(new Date(2026, 3, 18));
  });

  it('mês mais curto não pula para o mês seguinte', () => {
    // Hoje 30/05 → amanhã 31/05 → 3 meses antes cai no último dia de fevereiro.
    expect(resolveMetricsPeriodRange({ preset: 'LAST_3_MONTHS' }, new Date(2026, 4, 30))?.start).toEqual(
      new Date(2026, 1, 28),
    );
  });

  it('Personalizado inclui o dia final inteiro', () => {
    const period = { preset: 'CUSTOM' as const, from: '2026-10-01', to: '2026-10-17' };
    expect(resolveMetricsPeriodRange(period, now)).toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 18) });
    expect(metricsPeriodParams(period, now)).toEqual({
      start_date: new Date(2026, 9, 1).toISOString(),
      end_date: new Date(2026, 9, 18).toISOString(),
    });
  });

  it('Personalizado inválido vale como "Todo o período"', () => {
    expect(isValidCustomPeriod('2026-10-17', '2026-10-01')).toBe(false);
    expect(isValidCustomPeriod('2026-02-30', '2026-03-01')).toBe(false);
    expect(isValidCustomPeriod('2026-10-01', undefined)).toBe(false);
    expect(hasMetricsPeriod({ preset: 'CUSTOM', from: '2026-10-17', to: '2026-10-01' })).toBe(false);
    expect(metricsPeriodParams({ preset: 'CUSTOM' }, now)).toEqual({});
    expect(metricsPeriodKey({ preset: 'CUSTOM' })).toBe('ALL');
  });
});

describe('periodText', () => {
  it('rótulo e complemento das frases', () => {
    expect(periodText({ preset: 'ALL' })).toEqual({ label: 'Todo o período', inPeriod: '' });
    expect(periodText({ preset: 'LAST_30_DAYS' })).toEqual({ label: 'Últimos 30 dias', inPeriod: 'nos últimos 30 dias' });
    expect(periodText({ preset: 'CUSTOM', from: '2026-10-01', to: '2026-10-17' })).toEqual({
      label: '01/10/2026 a 17/10/2026',
      inPeriod: 'de 01/10/2026 a 17/10/2026',
    });
    expect(periodText({ preset: 'CUSTOM', from: '2026-10-17', to: '2026-10-17' })).toEqual({
      label: '17/10/2026',
      inPeriod: 'em 17/10/2026',
    });
  });
});
