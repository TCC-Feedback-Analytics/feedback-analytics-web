import { describe, expect, it } from 'vitest';
import { getIaErrorCategory, getIaFailureNotice } from './iaErrorMapper';

describe('getIaErrorCategory', () => {
  it.each([
    ['ia_provider_auth_error', 'account'],
    ['ia_provider_credits_exhausted', 'account'],
    ['ia_config_required', 'account'],
    ['invalid_ai_response_schema', 'model'],
    ['invalid_ai_response', 'model'],
    ['truncated_ai_response', 'model'],
    ['incomplete_ai_response', 'model'],
    ['ia_provider_unavailable', 'model'],
    ['ia_provider_rate_limited', 'temporary'],
    ['ia_provider_error', 'temporary'],
    ['failed_remote_ia_analyze_request', 'temporary'],
    ['insufficient_feedbacks_for_analysis', 'unknown'],
    [null, 'unknown'],
  ] as const)('%s → %s', (code, category) => {
    expect(getIaErrorCategory(code)).toBe(category);
  });
});

describe('getIaFailureNotice', () => {
  const base = { model: 'vendor/model', task: 'analisar os feedbacks' };

  it('erro do modelo cita o modelo e oferece Trocar modelo', () => {
    const notice = getIaFailureNotice({ ...base, errorCode: 'invalid_ai_response_schema' });
    expect(notice).toMatchObject({ category: 'model', title: 'Modelo com erro', actionLabel: 'Trocar modelo' });
    expect(notice?.description).toContain('O modelo vendor/model não conseguiu analisar os feedbacks.');
  });

  it('erro de conta oferece Revisar chave', () => {
    expect(getIaFailureNotice({ ...base, errorCode: 'ia_provider_credits_exhausted' }))
      .toMatchObject({ category: 'account', actionLabel: 'Revisar chave' });
  });

  it('limite do provedor é temporário e sugere trocar de modelo se continuar', () => {
    const notice = getIaFailureNotice({ ...base, errorCode: 'ia_provider_rate_limited' });
    expect(notice).toMatchObject({ category: 'temporary', actionLabel: 'Trocar modelo' });
    expect(notice?.description).toContain('Se continuar, troque de modelo.');
  });

  it('queda do nosso serviço é temporária e não oferece trocar de modelo', () => {
    const notice = getIaFailureNotice({ ...base, errorCode: 'failed_remote_ia_analyze_request' });
    expect(notice).toMatchObject({ category: 'temporary' });
    expect(notice?.actionLabel).toBeUndefined();
  });

  it('inclui o que ficou valendo quando informado', () => {
    const notice = getIaFailureNotice({ ...base, errorCode: 'empty_ai_response', outcome: 'As perguntas padrão foram mantidas.' });
    expect(notice?.description).toMatch(/As perguntas padrão foram mantidas\.$/);
  });

  it('sem modelo configurado usa "O modelo escolhido"', () => {
    const notice = getIaFailureNotice({ ...base, model: null, errorCode: 'empty_ai_response' });
    expect(notice?.description).toContain('O modelo escolhido não conseguiu');
  });

  it('erro sem categoria devolve null para o chamador manter a mensagem', () => {
    expect(getIaFailureNotice({ ...base, errorCode: 'insufficient_feedbacks_for_analysis' })).toBeNull();
  });
});
