/**
 * Aviso "a IA está demorando" (recomenda trocar de modelo). Pode ser frequente,
 * então a pessoa pode desligá-lo; o padrão é ligado. Fica no navegador; sem
 * armazenamento disponível, o aviso continua ligado.
 */

/** Depois disso sem resposta da IA, o aviso aparece. */
export const IA_SLOW_AFTER_MS = 40_000;

const STORAGE_KEY = 'feedback-analytics:aviso-ia-lenta';

export function isIaSlowNoticeEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setIaSlowNoticeEnabled(enabled: boolean): void {
  try {
    if (enabled) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, 'off');
  } catch {
    // Sem armazenamento: a escolha vale só nesta tela.
  }
}
