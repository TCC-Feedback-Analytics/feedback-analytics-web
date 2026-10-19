/**
 * Tema de quem abre um portal. Menus, modais e listas renderizados com
 * `createPortal(…, document.body)` ficam FORA de `.private-user-theme` e
 * `.public-theme` e caíam nas cores genéricas do site (no tema claro, cinza
 * escuro `#393939` como fundo). O portal envolve o conteúdo com esta classe.
 */
export type PortalThemeClass = 'private-user-theme' | 'public-theme' | '';

export function themeClassOf(element: Element | null | undefined): PortalThemeClass {
  if (element?.closest('.private-user-theme')) return 'private-user-theme';
  if (element?.closest('.public-theme')) return 'public-theme';
  return '';
}
