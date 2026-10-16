import type {
  InsightScopeOption,
  InsightsCatalogItemOption,
} from 'components/user/pages/feedbacksInsightsReport/ui.types';

/**
 * Texto que diz DE QUEM é o número (decisão de 16/10/2026): descreve exatamente o
 * que entra na conta. "Geral" mostra só o QR geral da empresa — não o total —, por
 * isso aqui ele aparece como "QR geral da empresa".
 */

type CatalogScope = Exclude<InsightScopeOption, 'COMPANY'>;

const KIND_SINGULAR: Record<CatalogScope, string> = {
  PRODUCT: 'produto',
  SERVICE: 'serviço',
  DEPARTMENT: 'departamento',
};

const KIND_PLURAL: Record<CatalogScope, string> = {
  PRODUCT: 'produtos',
  SERVICE: 'serviços',
  DEPARTMENT: 'departamentos',
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type ScopeText = {
  /** Etiqueta da seção: "QR geral da empresa", "Todos os produtos (3)", "Produto · Pizza". */
  label: string;
  /** Para "Ainda sem avaliações {inScope}": "no QR geral da empresa", "no produto Pizza". */
  inScope: string;
  /** Para "Baseada em 128 avaliações {ofScope}": "do QR geral da empresa", "do produto Pizza". */
  ofScope: string;
};

export function scopeText({
  scope,
  catalogItemId,
  catalogItemOptions,
}: {
  scope: InsightScopeOption;
  catalogItemId: string;
  catalogItemOptions: InsightsCatalogItemOption[];
}): ScopeText {
  if (scope === 'COMPANY') {
    return { label: 'QR geral da empresa', inScope: 'no QR geral da empresa', ofScope: 'do QR geral da empresa' };
  }

  const singular = KIND_SINGULAR[scope];
  const item = catalogItemId
    ? catalogItemOptions.find((option) => option.id === catalogItemId && option.kind === scope)
    : undefined;

  if (item) {
    return {
      label: `${capitalize(singular)} · ${item.name}`,
      inScope: `no ${singular} ${item.name}`,
      ofScope: `do ${singular} ${item.name}`,
    };
  }

  if (catalogItemId) {
    // Item escolhido, mas ainda fora da lista carregada: não inventa o nome.
    return { label: capitalize(singular), inScope: `neste ${singular}`, ofScope: `deste ${singular}` };
  }

  const plural = KIND_PLURAL[scope];
  const count = catalogItemOptions.filter((option) => option.kind === scope).length;
  return {
    label: `Todos os ${plural} (${count})`,
    inScope: `em todos os ${plural}`,
    ofScope: `de todos os ${plural}`,
  };
}
