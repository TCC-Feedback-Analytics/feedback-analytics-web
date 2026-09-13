import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ActionIaSettings } from './actionIaSettings';
import {
  ServiceUpdateIaConfig,
  ServiceDeleteIaConfig,
  ServiceUpdateIaModel,
} from 'src/services/serviceIaConfig';
import type { ActionFunctionArgs } from 'react-router-dom';

vi.mock('src/services/serviceIaConfig', () => ({
  ServiceUpdateIaConfig: vi.fn(),
  ServiceDeleteIaConfig: vi.fn(),
  ServiceUpdateIaModel: vi.fn(),
}));

const mockUpdateIaConfig = vi.mocked(ServiceUpdateIaConfig);
const mockDeleteIaConfig = vi.mocked(ServiceDeleteIaConfig);
const mockUpdateIaModel = vi.mocked(ServiceUpdateIaModel);

function createArgs(body: Record<string, string | undefined>): ActionFunctionArgs {
  const formData = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      formData.append(key, value);
    }
  });

  const request = new Request('http://localhost/user/edit/ia-settings', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });

  return {
    request,
    params: {},
    context: undefined,
  } as ActionFunctionArgs;
}

describe('[Unit] ActionIaSettings', () => {
  beforeEach(() => {
    mockUpdateIaConfig.mockReset();
    mockDeleteIaConfig.mockReset();
    mockUpdateIaModel.mockReset();
  });

  describe('save_ia_config', () => {
    it('salva a configuração de IA com sucesso', async () => {
      mockUpdateIaConfig.mockResolvedValue({
        hasKey: true,
        provider: 'openrouter',
        model: 'openrouter/auto',
        keyHint: 'xyz9',
      });

      const result = await ActionIaSettings(
        createArgs({
          intent: 'save_ia_config',
          provider: 'openrouter',
          model: 'openrouter/auto',
          apiKey: 'sk-or-v1-valid-key-123456789',
        }),
      );

      expect(mockUpdateIaConfig).toHaveBeenCalledWith({
        provider: 'openrouter',
        model: 'openrouter/auto',
        apiKey: 'sk-or-v1-valid-key-123456789',
      });

      expect(result).toEqual({
        ok: true,
        iaConfig: {
          hasKey: true,
          provider: 'openrouter',
          model: 'openrouter/auto',
          keyHint: 'xyz9',
        },
      });
    });

    it('retorna erro se a apiKey estiver vazia', async () => {
      const result = await ActionIaSettings(
        createArgs({
          intent: 'save_ia_config',
          provider: 'openrouter',
          model: 'google/gemini-2.5-flash',
          apiKey: '   ',
        }),
      );

      expect(mockUpdateIaConfig).not.toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: 'invalid_payload',
        message: 'Informe a chave da API.',
      });
    });

    it.each([undefined, '', '   ', 'x'.repeat(121)])('rejeita modelo obrigatório inválido %s', async (model) => {
      const result = await ActionIaSettings(
        createArgs({
          intent: 'save_ia_config',
          provider: 'openrouter',
          model,
          apiKey: 'sk-or-v1-valid-key-123456789',
        }),
      );

      expect(result).toMatchObject({ ok: false, error: 'invalid_payload' });
      expect(mockUpdateIaConfig).not.toHaveBeenCalled();
    });

    it('trata erro ia_config_invalid_key devolvido pelo backend', async () => {
      const error = new Error('ia_config_invalid_key') as Error & { code?: string };
      error.code = 'ia_config_invalid_key';
      mockUpdateIaConfig.mockRejectedValue(error);

      const result = await ActionIaSettings(
        createArgs({
          intent: 'save_ia_config',
          provider: 'openrouter',
          model: 'google/gemini-2.5-flash',
          apiKey: 'sk-or-invalid-key',
        }),
      );

      expect(result).toEqual({
        ok: false,
        error: 'ia_config_invalid_key',
        message: 'Chave inválida — confira a chave no OpenRouter e tente de novo.',
      });
    });

    it('trata erro genérico ao salvar', async () => {
      const error = new Error('server_error') as Error & { code?: string };
      error.code = 'server_error';
      mockUpdateIaConfig.mockRejectedValue(error);

      const result = await ActionIaSettings(
        createArgs({
          intent: 'save_ia_config',
          provider: 'openrouter',
          model: 'openrouter/auto',
          apiKey: 'sk-or-v1-valid',
        }),
      );

      expect(result).toEqual({
        ok: false,
        error: 'server_error',
        message: 'Não foi possível salvar agora. Tente novamente.',
      });
    });
  });

  describe('delete_ia_config', () => {
    it('remove a configuração de IA com sucesso', async () => {
      mockDeleteIaConfig.mockResolvedValue({
        hasKey: false,
        provider: null,
        model: null,
        keyHint: null,
      });

      const result = await ActionIaSettings(
        createArgs({
          intent: 'delete_ia_config',
        }),
      );

      expect(mockDeleteIaConfig).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        iaConfig: {
          hasKey: false,
          provider: null,
          model: null,
          keyHint: null,
        },
      });
    });

    it('trata erro de falha ao remover', async () => {
      const error = new Error('delete_failed') as Error & { code?: string };
      error.code = 'delete_failed';
      mockDeleteIaConfig.mockRejectedValue(error);

      const result = await ActionIaSettings(
        createArgs({
          intent: 'delete_ia_config',
        }),
      );

      expect(result).toEqual({
        ok: false,
        error: 'delete_failed',
        message: 'Não foi possível remover a chave agora. Tente novamente.',
      });
    });
  });

  describe('intent inválida', () => {
    it('retorna erro quando intent é desconhecida', async () => {
      const result = await ActionIaSettings(
        createArgs({
          intent: 'unknown_intent',
        }),
      );

      expect(result).toEqual({
        ok: false,
        error: 'invalid_intent',
        message: 'Ação inválida.',
      });
    });
  });

  describe('update_ia_model', () => {
    it('envia somente o modelo, sem depender de chave ou provedor no formulário', async () => {
      const config = { hasKey: true, provider: 'openrouter', model: 'vendor/model', keyHint: '1234' };
      mockUpdateIaModel.mockResolvedValue(config);
      const result = await ActionIaSettings(createArgs({ intent: 'update_ia_model', model: ' vendor/model ' }));
      expect(mockUpdateIaModel).toHaveBeenCalledWith('vendor/model');
      expect(mockUpdateIaConfig).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: true, iaConfig: config, operation: 'model' });
    });

    it('não encaminha campos extras para o PATCH', async () => {
      await ActionIaSettings(createArgs({
        intent: 'update_ia_model', model: 'vendor/model', apiKey: 'do-not-send', provider: 'other', enterpriseId: 'other',
      }));
      expect(mockUpdateIaModel).toHaveBeenCalledExactlyOnceWith('vendor/model');
      expect(mockUpdateIaConfig).not.toHaveBeenCalled();
    });

    it.each([undefined, '', '   ', 'x'.repeat(121)])('rejeita modelo inválido %s antes da chamada HTTP', async (model) => {
      const result = await ActionIaSettings(createArgs({ intent: 'update_ia_model', model }));
      expect(result).toMatchObject({ ok: false, error: 'invalid_payload' });
      expect(mockUpdateIaModel).not.toHaveBeenCalled();
    });
  });

  describe.each(['save_ia_config', 'update_ia_model'])('%s — erros do catálogo', (intent) => {
    it.each([
      ['ia_config_invalid_key', 'Chave inválida'],
      ['ia_model_unavailable', 'Este modelo não está disponível'],
      ['ia_models_unavailable', 'Não foi possível consultar os modelos'],
      ['ia_models_forbidden', 'O OpenRouter bloqueou'],
      ['ia_config_changed', 'A configuração foi alterada'],
      ['ia_config_required', 'É necessário configurar uma chave'],
      ['enterprise_not_found', 'Empresa não encontrada'],
    ])('explica %s sem apresentar mensagem bruta do servidor', async (code, message) => {
      const service = intent === 'save_ia_config' ? mockUpdateIaConfig : mockUpdateIaModel;
      service.mockRejectedValue({ code, message: 'sensitive-upstream-message' });
      const result = await ActionIaSettings(createArgs({ intent, model: 'vendor/model', apiKey: 'test-key' }));
      expect(result).toMatchObject({ ok: false, error: code });
      expect(result.message).toContain(message);
      expect(result.message).not.toContain('sensitive');
    });

    it('diferencia sessão expirada de chave OpenRouter inválida', async () => {
      const service = intent === 'save_ia_config' ? mockUpdateIaConfig : mockUpdateIaModel;
      service.mockRejectedValue({ status: 401 });
      const result = await ActionIaSettings(createArgs({ intent, model: 'vendor/model', apiKey: 'test-key' }));
      expect(result).toMatchObject({ ok: false, error: 'unauthorized' });
      expect(result.message).toContain('Sua sessão expirou');
    });
  });
});
