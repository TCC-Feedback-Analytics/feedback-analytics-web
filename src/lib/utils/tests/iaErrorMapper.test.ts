import { describe, expect, it } from 'vitest';
import { getIaErrorMessage, IA_RESPONSE_ERROR_MESSAGES } from '../iaErrorMapper';

describe('[Unidade] getIaErrorMessage', () => {
  it.each(Object.entries(IA_RESPONSE_ERROR_MESSAGES))('polling exibe diagnóstico específico para %s', (code, message) => {
    expect(getIaErrorMessage(code)).toBe(message);
  });
  it('código desconhecido usa mensagem segura', () => {
    expect(getIaErrorMessage('sk-or-secret')).not.toContain('sk-or-secret');
    expect(typeof getIaErrorMessage('constructor')).toBe('string');
  });
  it('orienta a configurar o OpenRouter quando a chave da empresa está ausente', () => {
    expect(getIaErrorMessage('ia_config_required')).toBe(
      'Configure sua chave OpenRouter em Editar > Configuração de IA antes de iniciar uma análise.',
    );
  });
});
