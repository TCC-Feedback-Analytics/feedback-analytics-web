import type { CatalogKindSlug } from "src/lib/constants/catalog";

/**
 * Props da listagem de itens de um tipo do catálogo (produtos/serviços/departamentos).
 * Usado em: components/user/pages/catalog/catalogItemsList.tsx.
 */
export interface CatalogItemsListProps {
  kindSlug: CatalogKindSlug;
}

/** Estado do filtro de disponibilidade do QR Code na listagem do catálogo. */
export type CatalogQrStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
