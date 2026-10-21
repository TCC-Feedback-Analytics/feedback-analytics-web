import type {
  FeedbackAnalysisItem,
  FeedbackAnalysisSummary,
  FeedbackStats,
} from 'lib/interfaces/domain/feedback.domain';
import type { PreviousPeriod } from 'src/lib/hooks/usePreviousPeriod';

/**
 * Props do bloco "Tom dos comentários" (lente Comentários, IA).
 * Usado em: components/user/pages/comments/CommentToneSection.tsx.
 */
export interface CommentToneSectionProps {
  summary: FeedbackAnalysisSummary | null;
  /** Complemento de escopo para vazios e precisão (scopeText). */
  inScope: string;
  ofScope: string;
  /** Quantos feedbacks faltam no escopo para a IA poder analisar (só no estado vazio). */
  feedbacksUntilAnalysis?: number;
  /** Stats do mesmo escopo no período anterior (comparação ligada): o tom vem de `aiSentiment`. */
  previous?: PreviousPeriod<FeedbackStats> | null;
}

/**
 * Props do bloco "Assuntos que mais impactam" (categorias como reserva).
 * Usado em: components/user/pages/comments/CommentTopicsSection.tsx.
 */
export interface CommentTopicsSectionProps {
  summary: FeedbackAnalysisSummary;
}

/**
 * Props da lista de comentários analisados.
 * Usado em: components/user/pages/comments/CommentList.tsx.
 */
export interface CommentListProps {
  items: FeedbackAnalysisItem[];
}

/**
 * Props do bloco "Quem escreve comentário" (o comentário é opcional).
 * Usado em: components/user/pages/comments/CommentParticipationSection.tsx.
 */
export interface CommentParticipationSectionProps {
  stats: FeedbackStats | null;
  loading?: boolean;
  /** Complemento de escopo para vazios e precisão (scopeText). */
  inScope: string;
  ofScope: string;
  /** Mesmo escopo no período anterior (comparação ligada). */
  previous?: PreviousPeriod<FeedbackStats> | null;
  /** `compact`: uma linha no bloco de comentários do Dashboard. */
  variant?: 'full' | 'compact';
}

export interface LowParticipationNoticeProps {
  pct: number;
  total: number;
}
