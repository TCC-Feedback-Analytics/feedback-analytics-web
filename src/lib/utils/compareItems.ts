import type { InsightsCatalogItemOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';

const KINDS: InsightsCatalogItemOption['kind'][] = ['PRODUCT', 'SERVICE', 'DEPARTMENT'];

/**
 * Tipos de item que dá para comparar (etapa 02, parte D): os que têm pelo menos
 * 2 itens. A comparação é sempre entre itens do mesmo tipo.
 */
export function comparableKinds(options: InsightsCatalogItemOption[]): InsightsCatalogItemOption['kind'][] {
  return KINDS.filter((kind) => options.filter((item) => item.kind === kind).length >= 2);
}
