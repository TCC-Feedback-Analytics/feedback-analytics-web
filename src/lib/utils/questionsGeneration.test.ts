import { describe, it, expect } from 'vitest';
import { questionsGenerationBlockedMessage } from './questionsGeneration';

describe('questionsGenerationBlockedMessage', () => {
  it('com pedido para acompanhar (ou sem informação), não há motivo a mostrar', () => {
    expect(questionsGenerationBlockedMessage(undefined)).toBeNull();
    expect(questionsGenerationBlockedMessage({ status: 'queued' })).toBeNull();
    expect(questionsGenerationBlockedMessage({ status: 'running' })).toBeNull();
    expect(questionsGenerationBlockedMessage({ status: 'completed' })).toBeNull();
  });

  it('diz quanto esperar no intervalo ou no limite diário', () => {
    expect(questionsGenerationBlockedMessage({ status: 'rate_limited', retryAfterSeconds: 1 })).toBe('Aguarde 1 segundo para tentar de novo.');
    expect(questionsGenerationBlockedMessage({ status: 'rate_limited', retryAfterSeconds: 42 })).toBe('Aguarde 42 segundos para tentar de novo.');
    expect(questionsGenerationBlockedMessage({ status: 'rate_limited', retryAfterSeconds: 90 })).toBe('Aguarde 2 minutos para tentar de novo.');
    expect(questionsGenerationBlockedMessage({ status: 'rate_limited', retryAfterSeconds: 5 * 3600 })).toBe('Aguarde 5 horas para tentar de novo.');
  });

  it('explica perguntas já editadas e configuração faltando', () => {
    expect(questionsGenerationBlockedMessage({ status: 'customized' })).toMatch(/já foram editadas/);
    expect(questionsGenerationBlockedMessage({ status: 'unavailable', code: 'ia_config_required' })).toBe('Configure a chave da IA para tentar de novo.');
    expect(questionsGenerationBlockedMessage({ status: 'unavailable', code: 'company_context_required' })).toBe('Complete o contexto da empresa para tentar de novo.');
    expect(questionsGenerationBlockedMessage({ status: 'unavailable', code: 'internal_error' })).toMatch(/Tente em instantes/);
  });
});
