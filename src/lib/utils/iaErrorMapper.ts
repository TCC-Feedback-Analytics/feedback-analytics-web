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
  invalid_ai_response_language: 'A IA não conseguiu produzir o relatório integralmente em português brasileiro, mesmo após a correção automática. Tente novamente ou selecione outro modelo.',
  invalid_provider_response: 'O OpenRouter retornou uma resposta inesperada. A análise não foi concluída.',
  empty_ai_response: 'O modelo não retornou conteúdo para análise. Tente novamente mais tarde ou selecione outro modelo.',
  truncated_ai_response: 'A resposta do modelo foi cortada pelo limite de saída. A análise foi interrompida; reduza o tamanho dos lotes ou selecione outro modelo.',
  incomplete_ai_response: 'A IA não concluiu todos os feedbacks. O fluxo foi interrompido antes de gerar novos insights. Tente novamente para processar os pendentes.',
  ai_response_refused: 'O provedor recusou a análise ou bloqueou a resposta por um filtro de conteúdo.',
  ia_provider_error: 'O OpenRouter informou uma falha do provedor durante a análise. Verifique os logs de diagnóstico.',
  ia_provider_auth_error: 'O OpenRouter recusou a chave configurada. Verifique sua configuração de IA.',
  ia_provider_credits_exhausted: 'O OpenRouter informou saldo ou créditos insuficientes para essa análise.',
  ia_provider_rate_limited: 'O limite de chamadas do provedor foi atingido. Aguarde antes de tentar novamente.',
  ia_provider_unavailable: 'Não há um provedor compatível disponível ou o provedor falhou. Tente novamente mais tarde ou selecione outro modelo com suporte a JSON.',
};

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
    return 'Nenhum relatório foi gerado. Verifique se há feedbacks analisados suficientes e tente novamente.';
  }

  if (IA_SERVICE_UNAVAILABLE_CODES.has(code)) {
    return 'O serviço de análise por IA está indisponível ou demorou demais para responder. Tente novamente em alguns instantes.';
  }

  return 'Ocorreu um erro ao processar a análise com IA.';
}
