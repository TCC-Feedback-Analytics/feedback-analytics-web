import type { FeedbackChannel } from 'lib/schemas/public/feedbackChannel';

const CHANNEL_LABEL: Record<FeedbackChannel, string> = {
  QR: 'QR Code',
  LINK: 'Link',
  NFC: 'Etiqueta NFC',
  TEST: 'Teste do formulário',
};

/** Explica a marca "Teste" na lista de feedbacks. */
export const TEST_FEEDBACK_HINT = 'Enviado pelo "Testar o formulário". Não entra nas métricas nem na análise da IA.';

/**
 * Por onde o feedback chegou, para a lista e o detalhe. Sem marca de canal
 * (feedbacks de antes dela), vale o nome do ponto de coleta (`fallback`).
 */
export function feedbackChannelLabel(channel: FeedbackChannel | null | undefined, fallback: string): string {
  return channel ? CHANNEL_LABEL[channel] : fallback;
}
