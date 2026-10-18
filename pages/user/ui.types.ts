import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { LoaderUserProtected } from 'src/routes/loaders/loaderUserProtected';
import type { ReactNode } from 'react';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import type { PeriodDeltaResult } from 'src/lib/utils/periodComparison';
import type { InsightsCatalogItemOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';

/**
 * Tipo auxiliar com os dados do loader protegido do usuário.
 * Usado em: pages/user/dashboard.tsx.
 */
export type UserLoaderData = Awaited<ReturnType<typeof LoaderUserProtected>>;
/**
 * Tipo auxiliar com os dados do loader do dashboard do usuário.
 * Usado em: pages/user/dashboard.tsx.
 */
export type DashboardLoaderData = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>;

/**
 * Uma linha da comparação A × B (etapa 02, parte D): a métrica, o valor de cada
 * item e quem está melhor (ou se a diferença é incerta).
 * Usado em: pages/user/compare.tsx.
 */
export type CompareItemsRow = {
  metric: string;
  a: ReactNode;
  b: ReactNode;
  /** Sem veredito (ex.: nº de avaliações): a coluna mostra "—". */
  result: PeriodDeltaResult | null;
  kind: 'rating' | 'points' | 'nss';
  /** Críticas: quem tem menos está melhor ("8 pontos a menos"). */
  lowerIsBetter?: boolean;
};

/** Tipo de item comparável (produto, serviço ou departamento). */
export type CatalogKind = InsightsCatalogItemOption['kind'];

/** Stats dos dois itens comparados, do mesmo período. */
export type CompareItemsStats = { a: FeedbackStats | null; b: FeedbackStats | null };
