import type { FeedbackAnalysisItem, FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';

/**
 * Lente Comentários (decisões de 16/10/2026): o tom lido pela IA aparece numa
 * métrica só — a barra positivo/neutro/negativo e um resumo "+45 · Positivo" —, e
 * a lista de comentários ganha filtros (que absorvem os "momentos emocionais").
 */

export type CommentToneWord = 'Positivo' | 'Neutro' | 'Atenção';

/** Mesma banda neutra de ±5 do antigo "clima emocional". */
export function commentToneWord(netSentimentScore: number): CommentToneWord {
  if (netSentimentScore > 5) return 'Positivo';
  if (netSentimentScore < -5) return 'Atenção';
  return 'Neutro';
}

export function commentToneShares(summary: FeedbackAnalysisSummary) {
  const total = summary.totalAnalyzed;
  const pct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);
  return {
    positive: { count: summary.sentiments.positive, pct: pct(summary.sentiments.positive) },
    neutral: { count: summary.sentiments.neutral, pct: pct(summary.sentiments.neutral) },
    negative: { count: summary.sentiments.negative, pct: pct(summary.sentiments.negative) },
  };
}

export const COMMENT_FILTERS = ['todos', 'positivos', 'neutros', 'negativos', 'divergentes'] as const;
export type CommentFilter = (typeof COMMENT_FILTERS)[number];

export const COMMENT_FILTER_LABEL: Record<CommentFilter, string> = {
  todos: 'Todos',
  positivos: 'Positivos',
  neutros: 'Neutros',
  negativos: 'Negativos',
  divergentes: 'Nota e texto não combinam',
};

export function parseCommentFilter(value: string | null): CommentFilter {
  return (COMMENT_FILTERS as readonly string[]).includes(value ?? '') ? (value as CommentFilter) : 'todos';
}

export function filterComments(items: FeedbackAnalysisItem[], filter: CommentFilter): FeedbackAnalysisItem[] {
  switch (filter) {
    case 'positivos':
      return items.filter((item) => item.sentiment === 'positive');
    case 'neutros':
      return items.filter((item) => item.sentiment === 'neutral');
    case 'negativos':
      return items.filter((item) => item.sentiment === 'negative');
    case 'divergentes':
      // Nota alta com texto negativo, ou nota baixa com texto positivo.
      return items.filter((item) => item.discrepancy != null);
    default:
      return items;
  }
}
