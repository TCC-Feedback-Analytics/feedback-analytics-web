import { getCatalogKindByKind } from 'src/lib/constants/catalog';
import type { InsightScopeOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';

/** Âncora do cartão "Campo de comentário" nas telas de configuração do formulário. */
export const COMMENT_FIELD_ANCHOR = 'campo-comentario';

/**
 * Tela que configura o formulário do escopo selecionado: empresa → Avaliação da
 * empresa; item escolhido → a tela do item; tipo sem item → a lista do tipo,
 * para o gestor escolher o item.
 */
export function formConfigPath(scope: InsightScopeOption, catalogItemId: string | null | undefined): string {
  if (scope === 'COMPANY') return '/user/edit/feedback-general';
  const config = getCatalogKindByKind(scope);
  if (!config) return '/user/edit/feedback-general';
  if (!catalogItemId) return config.listPath;
  return `/user/edit/feedback/${config.slug}/${catalogItemId}`;
}

/** Mesma tela, já no cartão do campo de comentário (só onde ele existe). */
export function commentFieldConfigPath(scope: InsightScopeOption, catalogItemId: string | null | undefined): string {
  const path = formConfigPath(scope, catalogItemId);
  return scope !== 'COMPANY' && !catalogItemId ? path : `${path}#${COMMENT_FIELD_ANCHOR}`;
}
