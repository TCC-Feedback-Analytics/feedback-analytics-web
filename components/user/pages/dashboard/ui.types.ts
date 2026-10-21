import type { ReactNode } from 'react';
import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import type { FormQuestionConfig } from 'src/lib/utils/formQuestions';
import type { PreviousPeriod } from 'src/lib/hooks/usePreviousPeriod';
import type { FeedbackHeatmapCell, FeedbackTimelinePoint } from 'src/services/serviceFeedbacks';
import type { TimelineBucket } from 'src/lib/utils/timeline';

/**
 * Props da seção "Avaliação por estrelas" do dashboard.
 * Usado em: components/user/pages/dashboard/SectionRatings.tsx.
 */
export interface SectionRatingsProps {
  stats: FeedbackStats | null;
  /** Mesmo escopo no período anterior (comparação ligada); `null`/ausente = sem comparação. */
  previous?: PreviousPeriod<FeedbackStats> | null;
  /** 'detail' (página de estrelas): inclui as neutras (3★) e omite o link "ver todas". */
  variant?: 'dashboard' | 'detail';
}

export interface RatingCardsProps {
  stats: FeedbackStats;
  total: number;
  ofScope: string;
  showNeutral: boolean;
  previous?: PreviousPeriod<FeedbackStats> | null;
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
  /** Abre o guia do sistema (atalho "Conhecer o sistema"). */
  onStartGuide?: () => void;
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
  /** Classes extras do card (ex.: ocupar a linha inteira da grade). */
  className?: string;
  children: ReactNode;
}

/**
 * Props da seção "Movimento das avaliações" (métricas novas, 1).
 * Usado em: components/user/pages/dashboard/SectionMovement.tsx.
 */
export interface SectionMovementProps {
  /** 'dashboard' = gráfico mais baixo; 'detail' = página de todas as métricas de estrelas. */
  variant?: 'dashboard' | 'detail';
}

/**
 * Props do gráfico do movimento: barras com a quantidade e linha com a média.
 * Usado em: components/user/pages/dashboard/SectionMovement.tsx.
 */
export interface MovementChartProps {
  points: FeedbackTimelinePoint[];
  bucket: TimelineBucket;
  compact: boolean;
}

/**
 * Props do mapa de dias e horários de pico (métricas novas, 3).
 * Usado em: components/user/pages/dashboard/SectionPeakTimes.tsx.
 */
export interface PeakTimesGridProps {
  cells: FeedbackHeatmapCell[];
}

/**
 * Props do bloco "Diagnóstico do escopo ✨ IA" do dashboard.
 * Usado em: components/user/pages/dashboard/SectionScopeDiagnosis.tsx.
 */
export interface SectionScopeDiagnosisProps {
  /** Chave e modelo da empresa configurados. */
  hasConfiguredAI: boolean;
  /** Objetivo, meta e resumo da empresa preenchidos. */
  hasCompanyContext: boolean;
  /** Avaliações no escopo e no período do cabeçalho; `null` enquanto carrega. */
  periodTotal: number | null;
  /** Modelo da empresa, para o aviso de falha. */
  model: string | null;
}

