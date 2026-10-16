import type {
  FeedbackAnalysisItem,
  FeedbackAnalysisSummary,
} from 'lib/interfaces/domain/feedback.domain';

/**
 * Props do bloco "Tom dos comentários" (lente Comentários, IA).
 * Usado em: components/user/pages/comments/CommentToneSection.tsx.
 */
export interface CommentToneSectionProps {
  summary: FeedbackAnalysisSummary | null;
  /** Complemento de escopo para vazios e precisão (scopeText). */
  inScope: string;
  ofScope: string;
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
