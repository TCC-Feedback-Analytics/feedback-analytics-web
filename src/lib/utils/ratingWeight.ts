import type { Interval, QuestionMetric } from 'lib/interfaces/domain/feedback.domain';

/**
 * O que mais pesa na nota (métricas novas, 2). O gateway devolve, por pergunta,
 * a correlação de Spearman entre a nota da pergunta e as estrelas do mesmo
 * feedback. Aqui ela vira um selo em palavras simples e a frase de prioridade.
 */

export type RatingWeight = { r: number; ci: Interval; n: number };

export type RatingWeightLevel = 'strong' | 'medium' | 'weak' | 'few';

/** Abaixo disso, o peso ainda é incerto demais para mostrar. */
export const RATING_WEIGHT_MIN_ANSWERS = 30;

export const RATING_WEIGHT_LABEL: Record<RatingWeightLevel, string> = {
  strong: 'Pesa muito na nota',
  medium: 'Pesa na nota',
  weak: 'Pesa pouco na nota',
  few: 'Poucas respostas para saber o peso',
};

/** O campo vem do gateway novo; o tipo do pacote de contratos ainda não o tem. */
export function ratingWeightOf(metric: QuestionMetric): RatingWeight | null {
  return (metric as QuestionMetric & { ratingWeight?: RatingWeight | null }).ratingWeight ?? null;
}

/** r ≥ 0,5 pesa muito; 0,3 a 0,5 pesa; abaixo (ou negativo) pesa pouco. Menos de 30 respostas: incerto. */
export function ratingWeightLevel(weight: RatingWeight | null): RatingWeightLevel {
  if (!weight || weight.n < RATING_WEIGHT_MIN_ANSWERS) return 'few';
  if (weight.r >= 0.5) return 'strong';
  if (weight.r >= 0.3) return 'medium';
  return 'weak';
}

/**
 * "Melhore primeiro": entre as perguntas que pesam (muito ou médio), a de menor
 * nota — desde que ainda não seja Ótima (abaixo de 4,5). `null` quando nada se destaca.
 */
export function improveFirst<T extends { metric: QuestionMetric }>(rows: T[]): (T & { level: RatingWeightLevel }) | null {
  const candidates = rows
    .map((row) => ({ ...row, level: ratingWeightLevel(ratingWeightOf(row.metric)) }))
    .filter((row) => (row.level === 'strong' || row.level === 'medium') && row.metric.mean < 4.5);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, row) => (row.metric.mean < best.metric.mean ? row : best));
}
