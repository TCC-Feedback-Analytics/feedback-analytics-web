const IA_SERVICE_UNAVAILABLE_CODES = new Set<string>([
  'failed_remote_ia_analyze_request',
  'remote_ia_analyze_error',
  'invalid_remote_ia_analyze_response_shape',
  'missing_ia_analyze_remote_url',
  'missing_gemini_api_key',
  'failed_ia_request',
  'invalid_ai_response',
  'ia_service_unavailable',
]);

// Também usado na action síncrona: não perder a causa ao receber HTTP 502.
export const IA_RESPONSE_ERROR_MESSAGES: Record<string, string> = {
  failed_ia_request: 'Não foi possível concluir a chamada ao provedor de IA. Tente novamente mais tarde.',
  invalid_ai_response: 'O modelo retornou um JSON inválido. A análise não foi concluída. Tente novamente ou selecione outro modelo compatível.',
  invalid_ai_response_schema: 'A resposta da IA não segue o formato esperado ou contém resultados inválidos. A análise foi interrompida.',
  invalid_ai_response_language: 'A IA não conseguiu produzir o resumo integralmente em português brasileiro, mesmo após a correção automática. Tente novamente ou selecione outro modelo.',
  invalid_provider_response: 'O OpenRouter retornou uma resposta inesperada. A análise não foi concluída.',
  empty_ai_response: 'O modelo não retornou conteúdo para análise. Tente novamente mais tarde ou selecione outro modelo.',
  truncated_ai_response: 'A resposta do modelo foi cortada pelo limite de saída. A análise foi interrompida; reduza o tamanho dos lotes ou selecione outro modelo.',
  incomplete_ai_response: 'A IA não concluiu todos os feedbacks. O fluxo foi interrompido antes de gerar o novo resumo. Tente novamente para processar os pendentes.',
  ai_response_refused: 'O provedor recusou a análise ou bloqueou a resposta por um filtro de conteúdo.',
  ia_provider_error: 'O OpenRouter informou uma falha do provedor durante a análise. Verifique os logs de diagnóstico.',
  ia_provider_auth_error: 'O OpenRouter recusou a chave configurada. Verifique sua configuração de IA.',
  ia_provider_credits_exhausted: 'O OpenRouter informou saldo ou créditos insuficientes para essa análise.',
  ia_provider_rate_limited: 'O limite de chamadas do provedor foi atingido. Aguarde antes de tentar novamente.',
  ia_provider_unavailable: 'Não há um provedor compatível disponível ou o provedor falhou. Tente novamente mais tarde ou selecione outro modelo com suporte a JSON.',
};

/**
 * De quem é a falha, para orientar o usuário:
 * - temporary: limite ou instabilidade do provedor/serviço; tentar mais tarde resolve.
 * - account: chave, créditos ou configuração da conta OpenRouter.
 * - model: o modelo escolhido não entrega o que a análise exige; trocar de modelo resolve.
 */
export type IaErrorCategory = 'temporary' | 'account' | 'model' | 'unknown';

const IA_ACCOUNT_ERROR_CODES = new Set<string>([
  'ia_provider_auth_error',
  'ia_provider_credits_exhausted',
  'ia_config_required',
]);

const IA_MODEL_ERROR_CODES = new Set<string>([
  'invalid_ai_response',
  'invalid_ai_response_schema',
  'invalid_ai_response_language',
  'invalid_provider_response',
  'empty_ai_response',
  'truncated_ai_response',
  'ai_response_refused',
  // O modelo devolveu menos itens do que recebeu no lote.
  'incomplete_ai_response',
  // OpenRouter: modelo inexistente ou sem provedor compatível com JSON (404/5xx persistente).
  'ia_provider_unavailable',
]);

const IA_TEMPORARY_ERROR_CODES = new Set<string>([
  'ia_provider_rate_limited',
  'ia_provider_error',
  ...[...IA_SERVICE_UNAVAILABLE_CODES].filter((code) => !IA_MODEL_ERROR_CODES.has(code)),
]);

export function getIaErrorCategory(errorCode: string | null | undefined): IaErrorCategory {
  const code = String(errorCode ?? '').trim();
  if (IA_ACCOUNT_ERROR_CODES.has(code)) return 'account';
  if (IA_MODEL_ERROR_CODES.has(code)) return 'model';
  if (IA_TEMPORARY_ERROR_CODES.has(code)) return 'temporary';
  return 'unknown';
}

export function getIaErrorMessage(errorCode: string | null | undefined): string {
  const code = String(errorCode ?? '').trim();
  if (Object.hasOwn(IA_RESPONSE_ERROR_MESSAGES, code)) return IA_RESPONSE_ERROR_MESSAGES[code];

  if (code === 'collecting_data_required_for_analysis') {
    return 'Para analisar os feedbacks, preencha as informações da empresa em Editar > Configuração de Coleta de Dados.';
  }

  if (code === 'insufficient_feedbacks_for_analysis') {
    return 'Há poucos feedbacks neste contexto para uma análise relevante. É necessário no mínimo 10 feedbacks.';
  }

  if (code === 'ia_config_required') {
    return 'Configure sua chave OpenRouter em Editar > Configuração de IA antes de iniciar uma análise.';
  }

  if (code === 'insights_not_generated') {
    return 'Nenhum resumo foi gerado. Verifique se há feedbacks analisados suficientes e tente novamente.';
  }

  if (IA_SERVICE_UNAVAILABLE_CODES.has(code)) {
    return 'O serviço de análise por IA está indisponível ou demorou demais para responder. Tente novamente em alguns instantes.';
  }

  return 'Ocorreu um erro ao processar a análise com IA.';
}

export type IaFailureNotice = {
  category: Exclude<IaErrorCategory, 'unknown'>;
  title: string;
  description: string;
  /** Presente quando o próximo passo é a Configuração de IA (trocar modelo ou revisar a chave). */
  actionLabel?: string;
};

/**
 * Aviso de uma falha terminal da IA: o motivo pela categoria do erro e o que o
 * usuário pode fazer. `task` completa "O modelo X não conseguiu …" (ex.: "analisar
 * os feedbacks"); `outcome` diz o que ficou valendo (ex.: "As perguntas padrão
 * foram mantidas."). Devolve null quando o erro não tem categoria conhecida.
 */
export function getIaFailureNotice({
  errorCode,
  model,
  task,
  outcome,
}: {
  errorCode: string | null | undefined;
  model: string | null | undefined;
  task: string;
  outcome?: string;
}): IaFailureNotice | null {
  const reason = getIaErrorMessage(errorCode);
  const suffix = outcome ? ` ${outcome}` : '';
  const modelName = model ? `O modelo ${model}` : 'O modelo escolhido';

  switch (getIaErrorCategory(errorCode)) {
    case 'model':
      return {
        category: 'model',
        title: 'Modelo com erro',
        description: `${modelName} não conseguiu ${task}. ${reason}${suffix}`,
        actionLabel: 'Trocar modelo',
      };
    case 'account':
      return {
        category: 'account',
        title: 'Revise sua conta OpenRouter',
        description: `${reason}${suffix}`,
        actionLabel: 'Revisar chave',
      };
    case 'temporary':
      // Só falhas do provedor se resolvem trocando de modelo; queda do nosso serviço, não.
      return String(errorCode).startsWith('ia_provider_')
        ? {
            category: 'temporary',
            title: 'Provedor de IA indisponível',
            description: `${modelName} segue sem responder depois de várias tentativas. ${reason}${suffix} Se continuar, troque de modelo.`,
            actionLabel: 'Trocar modelo',
          }
        : { category: 'temporary', title: 'IA indisponível no momento', description: `${reason}${suffix}` };
    default:
      return null;
  }
}
