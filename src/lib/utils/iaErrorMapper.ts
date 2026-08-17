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

export function getIaErrorMessage(errorCode: string | null | undefined): string {
  const code = String(errorCode ?? '').trim();

  if (code === 'collecting_data_required_for_analysis') {
    return 'Para analisar os feedbacks, preencha as informações da empresa em Editar > Configuração de Coleta de Dados.';
  }

  if (code === 'insufficient_feedbacks_for_analysis') {
    return 'Há poucos feedbacks neste contexto para uma análise relevante. É necessário no mínimo 10 feedbacks.';
  }

  if (IA_SERVICE_UNAVAILABLE_CODES.has(code)) {
    return 'O serviço de análise por IA está indisponível ou demorou demais para responder. Tente novamente em alguns instantes.';
  }

  return 'Ocorreu um erro ao processar a análise com IA.';
}
