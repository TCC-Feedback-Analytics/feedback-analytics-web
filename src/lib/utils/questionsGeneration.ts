import type { QuestionsGenerationResult } from 'src/services/serviceFeedbacks';

function waitText(seconds: number): string {
  if (seconds < 60) return `${seconds} segundo${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minuto${minutes === 1 ? '' : 's'}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hora${hours === 1 ? '' : 's'}`;
}

/**
 * Depois de trocar o modelo ou de "Tentar de novo": null quando há um pedido para
 * acompanhar (novo ou já andando); senão, o motivo de não ter saído, em texto.
 */
export function questionsGenerationBlockedMessage(result: QuestionsGenerationResult | undefined): string | null {
  if (!result) return null;
  switch (result.status) {
    case 'queued':
    case 'running':
    case 'completed':
      return null;
    case 'customized':
      return 'As perguntas do formulário já foram editadas; a IA não vai substituí-las.';
    case 'rate_limited':
      return `Aguarde ${waitText(Math.max(1, Math.ceil(result.retryAfterSeconds)))} para tentar de novo.`;
    case 'unavailable':
      if (result.code === 'ia_config_required') return 'Configure a chave da IA para tentar de novo.';
      if (result.code === 'company_context_required') return 'Complete o contexto da empresa para tentar de novo.';
      return 'Não foi possível tentar de novo agora. Tente em instantes.';
  }
}
