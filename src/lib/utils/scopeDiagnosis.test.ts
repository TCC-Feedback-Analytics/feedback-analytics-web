import { describe, expect, it } from 'vitest';
import { diagnosisGeneratedLabel, diagnosisPeriodLabel, isSameDiagnosisPeriod } from './scopeDiagnosis';

// Instantes à meia-noite local, como o seletor de período envia.
const local = (year: number, month: number, day: number) => new Date(year, month - 1, day).toISOString();

describe('scopeDiagnosis', () => {
  it('rótulo do período: fim exclusivo vira o último dia', () => {
    expect(diagnosisPeriodLabel({ start: null, end: null })).toBe('Todo o período');
    expect(diagnosisPeriodLabel({ start: local(2026, 9, 1), end: local(2026, 10, 1) })).toBe('01/09/2026 a 30/09/2026');
    expect(diagnosisPeriodLabel({ start: local(2026, 9, 1), end: local(2026, 9, 2) })).toBe('01/09/2026');
  });

  it('mesmo período quando os dias batem, mesmo com horas diferentes', () => {
    const period = { start: local(2026, 9, 1), end: local(2026, 10, 1) };
    expect(isSameDiagnosisPeriod(period, { start_date: local(2026, 9, 1), end_date: local(2026, 10, 1) })).toBe(true);
    expect(isSameDiagnosisPeriod(period, { start_date: local(2026, 9, 2), end_date: local(2026, 10, 2) })).toBe(false);
    expect(isSameDiagnosisPeriod({ start: null, end: null }, {})).toBe(true);
    expect(isSameDiagnosisPeriod({ start: null, end: null }, { start_date: local(2026, 9, 1), end_date: local(2026, 10, 1) })).toBe(false);
  });

  it('gerado hoje mostra a hora; outro dia, a data', () => {
    const now = new Date(2026, 9, 20, 15, 0);
    expect(diagnosisGeneratedLabel(new Date(2026, 9, 20, 14, 5).toISOString(), now)).toBe('gerado hoje às 14:05');
    expect(diagnosisGeneratedLabel(new Date(2026, 9, 2, 9, 0).toISOString(), now)).toBe('gerado em 02/10/2026');
  });
});
