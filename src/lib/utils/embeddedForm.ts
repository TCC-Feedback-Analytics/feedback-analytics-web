/**
 * Formulário do cliente aberto dentro do Dashboard ("Testar o formulário"): a
 * página pública roda num iframe com ?embed=1, sem o cabeçalho do site, e avisa
 * a janela de cima quando a resposta foi enviada.
 */
export const EMBED_PARAM = 'embed';
export const EMBEDDED_FORM_MESSAGE = 'feedback-analytics:form-result';

export type EmbeddedFormResult = 'sent' | 'already';

export function isEmbeddedForm(search: string = window.location.search): boolean {
  return new URLSearchParams(search).get(EMBED_PARAM) === '1';
}

export function embeddedFormUrl(feedbackUrl: string): string {
  const url = new URL(feedbackUrl, window.location.origin);
  url.searchParams.set(EMBED_PARAM, '1');
  return url.toString();
}

/** Avisa o Dashboard (mesma origem) que o formulário embutido terminou. */
export function notifyEmbeddedFormResult(result: EmbeddedFormResult): void {
  if (window.parent === window) return;
  window.parent.postMessage({ type: EMBEDDED_FORM_MESSAGE, result }, window.location.origin);
}

/** Lê a mensagem do iframe; `null` se não veio dele ou não é o aviso esperado. */
export function readEmbeddedFormResult(
  event: MessageEvent,
  frame: Window | null | undefined,
): EmbeddedFormResult | null {
  if (event.origin !== window.location.origin || !frame || event.source !== frame) return null;
  const data = event.data as { type?: unknown; result?: unknown } | null;
  if (data?.type !== EMBEDDED_FORM_MESSAGE) return null;
  return data.result === 'sent' || data.result === 'already' ? data.result : null;
}
