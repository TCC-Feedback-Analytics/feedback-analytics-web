/**
 * Período das métricas (etapa 02). Janelas móveis contadas em dias inteiros no
 * fuso do navegador, sempre incluindo hoje: "Últimos 7 dias" = hoje e os 6 dias
 * anteriores. O gateway recebe instantes absolutos, com início incluído e fim
 * excluído (`[start_date, end_date)`). "Todo o período" não envia datas.
 */

export type MetricsPeriodPreset =
  | 'ALL'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'LAST_3_MONTHS'
  | 'LAST_6_MONTHS'
  | 'CUSTOM';

export type MetricsPeriod = {
  preset: MetricsPeriodPreset;
  /** Só no Personalizado: datas locais `AAAA-MM-DD`, as duas incluídas. */
  from?: string;
  to?: string;
};

export type MetricsPeriodParams = {
  start_date?: string;
  end_date?: string;
};

export const ALL_TIME_PERIOD: MetricsPeriod = { preset: 'ALL' };

export const METRICS_PERIOD_OPTIONS: { preset: MetricsPeriodPreset; label: string }[] = [
  { preset: 'ALL', label: 'Todo o período' },
  { preset: 'LAST_7_DAYS', label: 'Últimos 7 dias' },
  { preset: 'LAST_30_DAYS', label: 'Últimos 30 dias' },
  { preset: 'LAST_3_MONTHS', label: 'Últimos 3 meses' },
  { preset: 'LAST_6_MONTHS', label: 'Últimos 6 meses' },
  { preset: 'CUSTOM', label: 'Personalizado' },
];

const IN_PERIOD: Record<Exclude<MetricsPeriodPreset, 'ALL' | 'CUSTOM'>, string> = {
  LAST_7_DAYS: 'nos últimos 7 dias',
  LAST_30_DAYS: 'nos últimos 30 dias',
  LAST_3_MONTHS: 'nos últimos 3 meses',
  LAST_6_MONTHS: 'nos últimos 6 meses',
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `AAAA-MM-DD` → meia-noite local daquele dia; `null` se a data não existe. */
export function parseLocalDate(value: string | undefined): Date | null {
  const match = value ? DATE_ONLY.exec(value) : null;
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

/** Data local no formato dos inputs de data (`AAAA-MM-DD`). */
export function toLocalDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

/** Personalizado válido: as duas datas existem e o início não passa do fim. */
export function isValidCustomPeriod(from: string | undefined, to: string | undefined): boolean {
  const start = parseLocalDate(from);
  const end = parseLocalDate(to);
  return Boolean(start && end && start <= end);
}

export function hasMetricsPeriod(period: MetricsPeriod): boolean {
  if (period.preset === 'ALL') return false;
  if (period.preset === 'CUSTOM') return isValidCustomPeriod(period.from, period.to);
  return true;
}

/** Intervalo local `[start, end)` do período; `null` = histórico inteiro. */
export function resolveMetricsPeriodRange(period: MetricsPeriod, now: Date = new Date()): { start: Date; end: Date } | null {
  if (!hasMetricsPeriod(period)) return null;
  const tomorrow = addDays(startOfDay(now), 1);

  switch (period.preset) {
    case 'LAST_7_DAYS':
      return { start: addDays(tomorrow, -7), end: tomorrow };
    case 'LAST_30_DAYS':
      return { start: addDays(tomorrow, -30), end: tomorrow };
    case 'LAST_3_MONTHS':
      return { start: addMonths(tomorrow, -3), end: tomorrow };
    case 'LAST_6_MONTHS':
      return { start: addMonths(tomorrow, -6), end: tomorrow };
    case 'CUSTOM':
      return { start: parseLocalDate(period.from)!, end: addDays(parseLocalDate(period.to)!, 1) };
    default:
      return null;
  }
}

/** Parâmetros `start_date`/`end_date` para o gateway; vazio = histórico inteiro. */
export function metricsPeriodParams(period: MetricsPeriod, now: Date = new Date()): MetricsPeriodParams {
  const range = resolveMetricsPeriodRange(period, now);
  if (!range) return {};
  return { start_date: range.start.toISOString(), end_date: range.end.toISOString() };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Período anterior, do mesmo tamanho e logo antes do escolhido (etapa 02, comparação):
 * "Últimos 30 dias" → os 30 dias antes deles; "Últimos 3 meses" → os 3 meses antes.
 */
export function resolvePreviousMetricsPeriodRange(period: MetricsPeriod, now: Date = new Date()): { start: Date; end: Date } | null {
  const range = resolveMetricsPeriodRange(period, now);
  if (!range) return null;
  if (period.preset === 'LAST_3_MONTHS') return { start: addMonths(range.start, -3), end: range.start };
  if (period.preset === 'LAST_6_MONTHS') return { start: addMonths(range.start, -6), end: range.start };
  const days = Math.round((range.end.getTime() - range.start.getTime()) / DAY_MS);
  return { start: addDays(range.start, -days), end: range.start };
}

export function previousMetricsPeriodParams(period: MetricsPeriod, now: Date = new Date()): MetricsPeriodParams {
  const range = resolvePreviousMetricsPeriodRange(period, now);
  if (!range) return {};
  return { start_date: range.start.toISOString(), end_date: range.end.toISOString() };
}

const PREVIOUS_LABEL: Record<Exclude<MetricsPeriodPreset, 'ALL' | 'CUSTOM'>, string> = {
  LAST_7_DAYS: '7 dias anteriores',
  LAST_30_DAYS: '30 dias anteriores',
  LAST_3_MONTHS: '3 meses anteriores',
  LAST_6_MONTHS: '6 meses anteriores',
};

/** Como a comparação chama o período anterior: "30 dias anteriores", "14/09/2026 a 30/09/2026". */
export function previousPeriodLabel(period: MetricsPeriod, now: Date = new Date()): string {
  if (!hasMetricsPeriod(period)) return '';
  if (period.preset !== 'CUSTOM') return PREVIOUS_LABEL[period.preset as keyof typeof PREVIOUS_LABEL];
  const range = resolvePreviousMetricsPeriodRange(period, now)!;
  const from = range.start.toLocaleDateString('pt-BR');
  const to = addDays(range.end, -1).toLocaleDateString('pt-BR');
  return from === to ? from : `${from} a ${to}`;
}

/** Chave estável do período (para dependências e para saber de qual período é um dado). */
export function metricsPeriodKey(period: MetricsPeriod): string {
  if (!hasMetricsPeriod(period)) return 'ALL';
  return period.preset === 'CUSTOM' ? `CUSTOM:${period.from}:${period.to}` : period.preset;
}

function formatLocalDate(value: string | undefined): string {
  const date = parseLocalDate(value);
  return date ? date.toLocaleDateString('pt-BR') : '';
}

export type PeriodText = {
  /** "Todo o período", "Últimos 30 dias", "12/09/2026 a 17/10/2026". */
  label: string;
  /** Complemento das frases de escopo: "nos últimos 30 dias", "de 12/09/2026 a 17/10/2026"; vazio sem período. */
  inPeriod: string;
};

export function periodText(period: MetricsPeriod): PeriodText {
  if (!hasMetricsPeriod(period)) return { label: 'Todo o período', inPeriod: '' };

  if (period.preset === 'CUSTOM') {
    const from = formatLocalDate(period.from);
    const to = formatLocalDate(period.to);
    if (from === to) return { label: from, inPeriod: `em ${from}` };
    return { label: `${from} a ${to}`, inPeriod: `de ${from} a ${to}` };
  }

  const option = METRICS_PERIOD_OPTIONS.find((item) => item.preset === period.preset);
  return { label: option?.label ?? '', inPeriod: IN_PERIOD[period.preset as keyof typeof IN_PERIOD] ?? '' };
}
