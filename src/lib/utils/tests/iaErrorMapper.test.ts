import { describe, expect, it } from 'vitest';
import { getIaErrorMessage } from '../iaErrorMapper';

describe('[Unidade] getIaErrorMessage', () => {
  it('orienta a configurar o OpenRouter quando a chave da empresa está ausente', () => {
    expect(getIaErrorMessage('ia_config_required')).toBe(
      'Configure sua chave OpenRouter em Editar > Configuração de IA antes de iniciar uma análise.',
    );
  });
});
