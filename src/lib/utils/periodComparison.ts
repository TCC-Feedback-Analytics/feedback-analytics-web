import type { Interval } from 'lib/interfaces/domain/feedback.domain';

/**
 * Comparação com o período anterior (etapa 02, parte C). A diferença é a do
 * número mostrado na tela; ela é "incerta" quando as margens de erro dos dois
 * períodos se sobrepõem — a mudança pode ser só acaso.
 */

export type ComparedValue = {
  value: number;
  /** Margem de erro na mesma unidade do valor; sem ela, a diferença não é julgada. */
  interval?: Interval | null;
};

export type PeriodDeltaResult =
  | { status: 'no-reference' }
  | { status: 'same' }
  | { status: 'changed'; delta: number; improved: boolean; uncertain: boolean };

const Z = 1.96;

/** Diferença no formato da tela: nota "+0,3", pontos "+5 p.p.", tom "+8". */
export function formatDelta(delta: number, kind: 'rating' | 'points' | 'nss'): string {
  const sign = delta > 0 ? '+' : '−';
  const abs = Math.abs(delta);
  if (kind === 'rating') return `${sign}${abs.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  if (kind === 'points') return `${sign}${abs} p.p.`;
  return `${sign}${abs}`;
}

function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.lower <= b.upper && b.lower <= a.upper;
}

export function comparePeriods(
  current: ComparedValue,
  previous: ComparedValue | null,
  { decimals = 0, higherIsBetter = true }: { decimals?: number; higherIsBetter?: boolean } = {},
): PeriodDeltaResult {
  if (!previous) return { status: 'no-reference' };
  const factor = 10 ** decimals;
  const delta = Math.round((current.value - previous.value) * factor) / factor;
  if (delta === 0) return { status: 'same' };
  const uncertain = Boolean(current.interval && previous.interval && intervalsOverlap(current.interval, previous.interval));
  return { status: 'changed', delta, improved: higherIsBetter ? delta > 0 : delta < 0, uncertain };
}

/** Intervalo de Wilson (95%) de uma proporção, em % — para positivas e críticas. */
export function wilsonPctInterval(count: number, total: number): Interval | null {
  if (total <= 0) return null;
  const p = count / total;
  const z2 = Z * Z;
  const denom = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denom;
  const half = (Z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denom;
  return { lower: (center - half) * 100, upper: (center + half) * 100 };
}

/**
 * Intervalo (95%) do tom (NSS = (positivos − negativos) / analisados × 100):
 * cada comentário vale +1, 0 ou −1, e o NSS é a média ×100.
 */
export function nssInterval({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }): Interval | null {
  const total = positive + neutral + negative;
  if (total <= 0) return null;
  const mean = (positive - negative) / total;
  const variance = Math.max(0, (positive + negative) / total - mean * mean);
  const half = Z * Math.sqrt(variance / total);
  return { lower: (mean - half) * 100, upper: (mean + half) * 100 };
}

/** NSS das contagens, no mesmo cálculo do gateway. */
export function nssFromCounts({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }): number | null {
  const total = positive + neutral + negative;
  return total > 0 ? ((positive - negative) / total) * 100 : null;
}
