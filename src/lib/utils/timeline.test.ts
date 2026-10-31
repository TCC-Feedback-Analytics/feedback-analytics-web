import { describe, expect, it } from 'vitest';
import { chooseTimelineBucket, formatBucketLabel } from './timeline';

const now = new Date(2026, 9, 18, 10, 0);

describe('chooseTimelineBucket', () => {
  it('dia para janelas curtas, semana para meses, semana sem período', () => {
    expect(chooseTimelineBucket({ preset: 'LAST_7_DAYS' }, now)).toBe('day');
    expect(chooseTimelineBucket({ preset: 'LAST_30_DAYS' }, now)).toBe('day');
    expect(chooseTimelineBucket({ preset: 'LAST_3_MONTHS' }, now)).toBe('week');
    expect(chooseTimelineBucket({ preset: 'LAST_6_MONTHS' }, now)).toBe('week');
    expect(chooseTimelineBucket({ preset: 'ALL' }, now)).toBe('week');
  });

  it('Personalizado pelo tamanho do intervalo', () => {
    expect(chooseTimelineBucket({ preset: 'CUSTOM', from: '2026-09-01', to: '2026-10-18' }, now)).toBe('day');
    expect(chooseTimelineBucket({ preset: 'CUSTOM', from: '2026-01-01', to: '2026-10-18' }, now)).toBe('week');
    expect(chooseTimelineBucket({ preset: 'CUSTOM', from: '2024-01-01', to: '2026-10-18' }, now)).toBe('month');
  });
});

describe('formatBucketLabel', () => {
  it('dia, semana e mês em português', () => {
    expect(formatBucketLabel('2026-10-15', 'day')).toBe('15/10');
    expect(formatBucketLabel('2026-10-12', 'week')).toBe('12/10 a 18/10');
    expect(formatBucketLabel('2026-10-26', 'week')).toBe('26/10 a 01/11');
    expect(formatBucketLabel('2026-10-01', 'month')).toMatch(/out.*2026/);
  });
});
