import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ActionIaSettings } from './actionIaSettings';
import {
  ServiceUpdateIaConfig,
  ServiceDeleteIaConfig,
} from 'src/services/serviceIaConfig';
import type { ActionFunctionArgs } from 'react-router-dom';

vi.mock('src/services/serviceIaConfig', () => ({
  ServiceUpdateIaConfig: vi.fn(),
  ServiceDeleteIaConfig: vi.fn(),
}));

const mockUpdateIaConfig = vi.mocked(ServiceUpdateIaConfig);
const mockDeleteIaConfig = vi.mocked(ServiceDeleteIaConfig);

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
});
