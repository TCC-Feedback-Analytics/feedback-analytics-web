const messages: Record<string, string> = {
  ia_config_invalid_key: 'Chave inválida — confira a chave no OpenRouter e tente de novo.',
  ia_model_unavailable: 'Este modelo não está disponível para sua chave ou não é compatível com as análises. Atualize a lista e escolha outro.',
  ia_models_unavailable: 'Não foi possível consultar os modelos no OpenRouter agora. Tente novamente.',
  ia_models_forbidden: 'O OpenRouter bloqueou a consulta de modelos. Confira as permissões e restrições da sua chave na conta OpenRouter.',
  ia_config_required: 'É necessário configurar uma chave OpenRouter. Recarregue a configuração antes de continuar.',
  ia_config_changed: 'A configuração foi alterada em outra operação. Recarregue antes de tentar novamente.',
  enterprise_not_found: 'Empresa não encontrada.',
  unauthorized: 'Sua sessão expirou. Entre novamente para configurar a IA.',
};

export function iaConfigError(error: unknown, fallback: string) {
  const candidate = error as { code?: unknown; status?: unknown } | null;
  const code = candidate?.status === 401 ? 'unauthorized'
    : typeof candidate?.code === 'string' ? candidate.code : undefined;
  // Nunca usar mensagens brutas do provedor/servidor na interface.
  return { code, message: (code && messages[code]) || fallback };
}
