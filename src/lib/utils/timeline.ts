import { parseLocalDate, resolveMetricsPeriodRange, type MetricsPeriod } from './metricsPeriod';

/**
 * Movimento no tempo (métricas novas, 1): de quanto em quanto tempo o gráfico
 * agrupa as avaliações e como cada intervalo aparece na tela.
 */

export type TimelineBucket = 'day' | 'week' | 'month';

/** Sem período, começa por semana; passando de 6 meses de histórico, vira mês. */
export const ALL_TIME_MAX_WEEKS = 26;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 7 e 30 dias → dia; 3 e 6 meses → semana; Personalizado pelo tamanho; sem período → semana. */
export function chooseTimelineBucket(period: MetricsPeriod, now: Date = new Date()): TimelineBucket {
  const range = resolveMetricsPeriodRange(period, now);
  if (!range) return 'week';
  const days = Math.round((range.end.getTime() - range.start.getTime()) / DAY_MS);
  if (days <= 62) return 'day';
  if (days <= 366) return 'week';
  return 'month';
}

/** Fuso do navegador (IANA), para o gateway agrupar no horário do gestor. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  } catch {
    return 'America/Sao_Paulo';
  }
}

export const BUCKET_WORD: Record<TimelineBucket, string> = { day: 'dia', week: 'semana', month: 'mês' };
export const BUCKET_PLURAL: Record<TimelineBucket, string> = { day: 'dias', week: 'semanas', month: 'meses' };

/** "15/10", "sem. de 12/10", "out. de 2026". */
export function formatBucketLabel(start: string, bucket: TimelineBucket): string {
  const date = parseLocalDate(start);
  if (!date) return start;
  if (bucket === 'month') return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return bucket === 'week' ? `sem. de ${dayMonth}` : dayMonth;
}
