import type {
  Interval,
  QuestionDistribution,
  QuestionMetric,
  QuestionMetricStatus,
} from 'lib/interfaces/domain/feedback.domain';
import type { PreviousPeriod } from 'src/lib/hooks/usePreviousPeriod';

/**
 * Props do selo de estado de uma redação (desativada / antiga).
 * Usado em: components/user/pages/questions/QuestionParts.tsx.
 */
export interface QuestionStatusTagProps {
  status: QuestionMetricStatus;
}

/**
 * Props da barra de distribuição das respostas (péssimo → ótimo).
 * Usado em: components/user/pages/questions/QuestionParts.tsx.
 */
export interface AnswerDistributionProps {
  distribution: QuestionDistribution;
  total: number;
  /** Mostra a contagem de cada resposta abaixo da barra (página da pergunta). */
  showLegend?: boolean;
}

/**
 * Props do resumo da nota de uma pergunta ou subpergunta.
 * Usado em: components/user/pages/questions/QuestionParts.tsx.
 */
export interface QuestionScoreProps {
  metricName: string;
  mean: number;
  count: number;
  satisfiedPct: number;
  ci: Interval;
  ofScope: string;
}

/**
 * Props da seção "Perguntas do formulário" do Dashboard.
 * Usado em: components/user/pages/questions/SectionFormQuestions.tsx.
 */
export interface SectionFormQuestionsProps {
  /** Métricas por pergunta do escopo (`/feedbacks/questions`). */
  metrics: QuestionMetric[];
  /** Mesmas métricas no período anterior (comparação ligada). */
  previous?: PreviousPeriod<QuestionMetric[]> | null;
}

/**
 * Props do selo "o que mais pesa na nota" de uma pergunta (métricas novas, 2).
 * Usado em: components/user/pages/questions/QuestionParts.tsx.
 */
export interface QuestionWeightTagProps {
  metric: QuestionMetric;
}

/**
 * Props da diferença da nota de uma pergunta para o período anterior.
 * Usado em: components/user/pages/questions/QuestionParts.tsx.
 */
export interface QuestionDeltaProps {
  metricName: string;
  metric: QuestionMetric;
  previous: PreviousPeriod<QuestionMetric[]>;
}
