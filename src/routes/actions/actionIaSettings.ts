import type { ActionFunctionArgs } from 'react-router-dom';
import { INTENT_SAVE_IA_CONFIG, INTENT_DELETE_IA_CONFIG } from 'src/lib/constants/routes/intents';
import {
  ServiceUpdateIaConfig,
  ServiceDeleteIaConfig,
} from 'src/services/serviceIaConfig';

type HttpError = Error & {
  status?: number;
  code?: string;
};

export async function ActionIaSettings({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent === INTENT_SAVE_IA_CONFIG) {
    const apiKey = String(form.get('apiKey') ?? '').trim();
    const model = String(form.get('model') ?? '').trim();
    const provider = String(form.get('provider') ?? 'openrouter').trim() || 'openrouter';

    if (!apiKey) {
      return {
        ok: false,
        error: 'invalid_payload',
        message: 'Informe a chave da API.',
      };
    }

    try {
      const iaConfig = await ServiceUpdateIaConfig({
        provider,
        model: model || undefined,
        apiKey,
      });

      return {
        ok: true,
        iaConfig,
      };
    } catch (error) {
      const httpError = error as HttpError;

      if (httpError?.code === 'ia_config_invalid_key') {
        return {
          ok: false,
          error: 'ia_config_invalid_key',
          message: 'Chave inválida — confira a chave no OpenRouter e tente de novo.',
        };
      }

      if (httpError?.code === 'invalid_payload') {
        return {
          ok: false,
          error: 'invalid_payload',
          message: 'Informe a chave da API.',
        };
      }

      if (httpError?.code === 'enterprise_not_found') {
        return {
          ok: false,
          error: 'enterprise_not_found',
          message: 'Empresa não encontrada.',
        };
      }

      return {
        ok: false,
        error: httpError?.code || 'save_failed',
        message: 'Não foi possível salvar agora. Tente novamente.',
      };
    }
  }

  if (intent === INTENT_DELETE_IA_CONFIG) {
    try {
      const iaConfig = await ServiceDeleteIaConfig();

      return {
        ok: true,
        iaConfig,
      };
    } catch (error) {
      const httpError = error as HttpError;

      return {
        ok: false,
        error: httpError?.code || 'delete_failed',
        message: 'Não foi possível remover a chave agora. Tente novamente.',
      };
    }
  }

  return {
    ok: false,
    error: 'invalid_intent',
    message: 'Ação inválida.',
  };
}
