import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';

/**
 * Props da seção "Avaliação por estrelas" do dashboard.
 * Usado em: components/user/pages/dashboard/SectionRatings.tsx.
 */
export interface SectionRatingsProps {
  stats: FeedbackStats | null;
  /** 'detail' (página de estrelas): inclui as neutras (3★) e omite o link "ver todas". */
  variant?: 'dashboard' | 'detail';
}

export interface RatingCardsProps {
  stats: FeedbackStats;
  total: number;
  ofScope: string;
  showNeutral: boolean;
}

export interface ShareValueProps {
  count: number;
  pct: number;
}

/**
 * Tipo auxiliar das estatísticas retornadas pelo loader do dashboard.
 * Usado em: components/user/pages/dashboard/SectionEvaluationDistribution.tsx.
 */
export type DashboardStats = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>['stats'];

/**
 * Props da seção de distribuição de avaliações.
 * Usado em: components/user/pages/dashboard/SectionEvaluationDistribution.tsx.
 */
export interface EvaluationDistributionProps {
  stats: DashboardStats | null;
}

