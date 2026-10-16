import type { Interval } from 'lib/interfaces/domain/feedback.domain';

/**
 * Indicador único de Precisão (decisão de 16/10/2026): junta a faixa provável e o
 * selo de confiança. Sai da LARGURA da faixa — que já considera a variação e a
 * quantidade de respostas —, com um mínimo de respostas como trava (poucas
 * respostas iguais dariam uma faixa de largura zero). A matemática da faixa vive
 * no backend; aqui só classificamos.
 */

export type Precision = 'alta' | 'media' | 'baixa';

/**
 * Unidade em que a faixa chega da API:
 * - mean: pontos da nota 1–5 (starMeanCI, QuestionMetric.ci);
 * - pct: porcentagem 0–100 (csat.ci);
 * - fraction: fração 0–1 (sentimentCIs, aspectos).
 */
export type PrecisionKind = 'mean' | 'pct' | 'fraction';

/** Abaixo disso, a precisão é sempre baixa — mesmo corte do antigo selo "insuficiente". */
export const PRECISION_MIN_RESPONSES = 10;

/** Meia-largura máxima (o ± da faixa) para cada nível, aprovada pelo dono em 16/10/2026. */
export const PRECISION_LIMITS = {
  mean: { alta: 0.25, media: 0.5 },
  pct: { alta: 5, media: 10 },
} as const;

export const PRECISION_LABEL: Record<Precision, string> = {
  alta: 'Precisão alta',
  media: 'Precisão média',
  baixa: 'Precisão baixa',
};

/** Classes de borda/fundo/texto por nível (mesmos tokens de cor do antigo selo). */
export const PRECISION_TONE: Record<Precision, string> = {
  alta: 'border-(--positive)/40 bg-(--positive)/10 text-(--positive)',
  media: 'border-(--neutral)/40 bg-(--neutral)/10 text-(--neutral)',
  baixa: 'border-(--negative)/40 bg-(--negative)/10 text-(--negative)',
};

/** O ± da faixa na unidade de leitura: pontos (nota) ou pontos percentuais. */
export function halfWidth(interval: Interval, kind: PrecisionKind): number {
  const width = (interval.upper - interval.lower) / 2;
  return kind === 'fraction' ? width * 100 : width;
}

/** Null quando não há faixa para classificar (a tela não mostra o indicador). */
export function getPrecision({
  n,
  interval,
  kind,
}: {
  n: number;
  interval: Interval | null | undefined;
  kind: PrecisionKind;
}): Precision | null {
  if (n <= 0) return null;
  if (n < PRECISION_MIN_RESPONSES) return 'baixa';
  if (!interval) return null;

  const limits = kind === 'mean' ? PRECISION_LIMITS.mean : PRECISION_LIMITS.pct;
  const margin = halfWidth(interval, kind);
  // Tolerância para o ponto flutuante: ±0,5 exato não pode virar 0,5000000000000002.
  const EPSILON = 1e-9;
  if (margin <= limits.alta + EPSILON) return 'alta';
  if (margin <= limits.media + EPSILON) return 'media';
  return 'baixa';
}

/** A faixa em linguagem simples: "4,0 e 4,4" (nota) ou "58% e 70%" (porcentagens). */
export function formatPrecisionRange(interval: Interval, kind: PrecisionKind): string {
  if (kind === 'mean') {
    const fmt = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `${fmt(interval.lower)} e ${fmt(interval.upper)}`;
  }
  const factor = kind === 'fraction' ? 100 : 1;
  return `${Math.round(interval.lower * factor)}% e ${Math.round(interval.upper * factor)}%`;
}

/** Por que o número recebeu aquele nível, em uma frase. */
export function precisionReason({
  n,
  interval,
  kind,
}: {
  n: number;
  interval: Interval | null | undefined;
  kind: PrecisionKind;
}): string {
  if (n < PRECISION_MIN_RESPONSES) {
    return `São menos de ${PRECISION_MIN_RESPONSES} respostas: ainda poucas para confiar no número, mesmo que pareçam parecidas.`;
  }
  if (!interval) return 'Não há faixa calculada para este número.';
  const margin = halfWidth(interval, kind);
  const unit = kind === 'mean' ? 'ponto' : 'pontos percentuais';
  const formatted = margin.toLocaleString('pt-BR', { maximumFractionDigits: kind === 'mean' ? 2 : 0 });
  return `A faixa provável vai ${formatted} ${unit} para cada lado do número.`;
}
