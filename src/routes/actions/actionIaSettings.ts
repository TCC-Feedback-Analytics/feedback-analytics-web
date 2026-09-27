import type { ActionFunctionArgs } from 'react-router-dom';
import { INTENT_SAVE_IA_CONFIG, INTENT_DELETE_IA_CONFIG, INTENT_UPDATE_IA_MODEL } from 'src/lib/constants/routes/intents';
import {
  ServiceUpdateIaConfig,
  ServiceDeleteIaConfig,
  ServiceUpdateIaModel,
  type IaConfigResponse,
} from 'src/services/serviceIaConfig';
import { iaConfigError } from 'src/lib/utils/iaConfigErrors';

type HttpError = Error & {
  status?: number;
  code?: string;
};

export interface IaSettingsActionResult {
  ok: boolean;
  iaConfig?: IaConfigResponse;
  error?: string;
  message?: string;
  operation?: 'model';
}

export async function ActionIaSettings({ request }: ActionFunctionArgs): Promise<IaSettingsActionResult> {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent === INTENT_UPDATE_IA_MODEL) {
    const model = String(form.get('model') ?? '').trim();
    if (!model || model.length > 120) {
      return { ok: false, error: 'invalid_payload', message: 'Selecione um modelo de IA válido.' };
    }
    try {
      const iaConfig = await ServiceUpdateIaModel(model);
      return { ok: true, iaConfig, operation: 'model' };
    } catch (error) {
      const failure = iaConfigError(error, 'Não foi possível salvar o modelo agora. Tente novamente.');
      return { ok: false, error: failure.code || 'save_failed', message: failure.message };
    }
  }

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

    if (!model || model.length > 120) {
      return {
        ok: false,
        error: 'invalid_payload',
        message: 'Selecione um modelo de IA válido.',
      };
    }

    try {
      const iaConfig = await ServiceUpdateIaConfig({
        provider,
        model,
        apiKey,
      });

      return {
        ok: true,
        iaConfig,
      };
    } catch (error) {
      const httpError = error as HttpError;

      if (httpError?.code === 'invalid_payload') {
        return {
          ok: false,
          error: 'invalid_payload',
          message: 'Informe a chave da API.',
        };
      }

      const failure = iaConfigError(error, 'Não foi possível salvar agora. Tente novamente.');
      return {
        ok: false,
        error: failure.code || 'save_failed',
        message: failure.message,
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
