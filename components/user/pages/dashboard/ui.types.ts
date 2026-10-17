import type { ReactNode } from 'react';
import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import type { FormQuestionConfig } from 'src/lib/utils/formQuestions';

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

/**
 * Props do QR Code decorativo.
 * Usado em: components/user/pages/dashboard/QrGlyph.tsx.
 */
export interface QrGlyphProps {
  className?: string;
}

/**
 * Props do bloco de boas-vindas da conta sem feedbacks.
 * Usado em: components/user/pages/dashboard/DashboardWelcome.tsx.
 */
export interface DashboardWelcomeProps {
  enterprise: { id: string; full_name?: string | null };
  /** Status do QR geral; null quando não foi possível consultar (o passo de ativar some). */
  qrActive: boolean | null;
  /** Feedbacks da conta inteira, para o progresso até a análise da IA. */
  totalFeedbacks: number;
}

/**
 * Props de um passo da lista "Primeiros passos".
 * Usado em: components/user/pages/dashboard/DashboardWelcome.tsx.
 */
export interface WelcomeStepProps {
  number: number;
  title: string;
  description: string;
  children: ReactNode;
  note?: string;
}

/**
 * Props da prévia das seções do Dashboard na conta sem feedbacks.
 * Usado em: components/user/pages/dashboard/WelcomePreview.tsx.
 */
export interface WelcomePreviewProps {
  /** Perguntas ativas do formulário geral, na ordem (dado real, não exemplo). */
  questions: FormQuestionConfig[];
}

/**
 * Props de um card da prévia.
 * Usado em: components/user/pages/dashboard/WelcomePreview.tsx.
 */
export interface WelcomePreviewCardProps {
  title: ReactNode;
  description: string;
  /** Mostra o selo "Exemplo" (dados ilustrativos). */
  example?: boolean;
  tourId?: string;
  children: ReactNode;
}

