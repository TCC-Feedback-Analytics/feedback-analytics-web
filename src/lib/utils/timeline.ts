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

/** Rótulo do intervalo com mais avaliações, no resumo acima do gráfico. */
export const BUCKET_PEAK_LABEL: Record<TimelineBucket, string> = {
  day: 'Dia com mais avaliações',
  week: 'Semana com mais avaliações',
  month: 'Mês com mais avaliações',
};

/** O que cada barra do gráfico representa (no gateway, a semana começa na segunda). */
export const BUCKET_BAR_MEANING: Record<TimelineBucket, string> = {
  day: 'Cada barra é um dia.',
  week: 'Cada barra é uma semana, de segunda a domingo.',
  month: 'Cada barra é um mês.',
};

function formatDayMonth(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** "15/10", "12/10 a 18/10" (a semana inteira, para não deixar dúvida) e "out. de 2026". */
export function formatBucketLabel(start: string, bucket: TimelineBucket): string {
  const date = parseLocalDate(start);
  if (!date) return start;
  if (bucket === 'month') return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  if (bucket === 'day') return formatDayMonth(date);
  const weekEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6);
  return `${formatDayMonth(date)} a ${formatDayMonth(weekEnd)}`;
}
