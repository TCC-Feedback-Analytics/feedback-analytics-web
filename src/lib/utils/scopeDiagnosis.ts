/**
 * Diagnóstico do escopo com IA: textos de período e de quando foi gerado, e se
 * o diagnóstico guardado é do mesmo período escolhido no cabeçalho.
 */
import type { ScopeDiagnosisPeriod } from 'lib/interfaces/contracts/ia-analyze/scope-diagnosis.contract';
import { toLocalDateInput, type MetricsPeriodParams } from './metricsPeriod';

/** O fim é exclusivo: o último dia do período é o anterior a ele. */
function lastDayOf(end: string): Date {
  return new Date(Date.parse(end) - 1);
}

/** "Todo o período", "01/09/2026 a 30/09/2026" ou um dia só. */
export function diagnosisPeriodLabel(period: ScopeDiagnosisPeriod): string {
  if (!period.start && !period.end) return 'Todo o período';
  const from = period.start ? new Date(period.start).toLocaleDateString('pt-BR') : null;
  const to = period.end ? lastDayOf(period.end).toLocaleDateString('pt-BR') : null;
  if (from && to) return from === to ? from : `${from} a ${to}`;
  return from ? `A partir de ${from}` : `Até ${to}`;
}

/**
 * Mesmo período do cabeçalho, comparando dias no fuso do navegador: "Últimos 30
 * dias" anda um dia por dia, e o diagnóstico de ontem já é de outro período.
 */
export function isSameDiagnosisPeriod(period: ScopeDiagnosisPeriod, selected: MetricsPeriodParams): boolean {
  const day = (value: string | null | undefined, isEnd: boolean) =>
    value ? toLocalDateInput(isEnd ? lastDayOf(value) : new Date(value)) : null;
  return day(period.start, false) === day(selected.start_date, false) && day(period.end, true) === day(selected.end_date, true);
}

/** "gerado hoje às 14:05", "gerado em 02/10/2026". */
export function diagnosisGeneratedLabel(createdAt: string, now: Date = new Date()): string {
  const date = new Date(createdAt);
  if (toLocalDateInput(date) === toLocalDateInput(now)) {
    return `gerado hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `gerado em ${date.toLocaleDateString('pt-BR')}`;
}
