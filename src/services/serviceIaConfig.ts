import { getJson, putJson, patchJson, deleteJson } from 'src/lib/utils/http';

export interface IaConfigResponse {
  hasKey: boolean;
  provider: string | null;
  model: string | null;
  keyHint: string | null;
}

export interface UpdateIaConfigPayload {
  provider: 'openrouter' | string;
  model?: string;
  apiKey: string;
}

export interface IaModelOption {
  id: string;
  name: string;
  contextLength: number | null;
  maxCompletionTokens: number | null;
  isAutomatic: boolean;
}

export interface IaModelsResponse {
  models: IaModelOption[];
  source: 'public' | 'user';
  fetchedAt: string;
  stale: boolean;
  currentModel: string | null;
  currentModelAvailable: boolean | null;
}

export function ServiceGetIaModels(signal?: AbortSignal): Promise<IaModelsResponse> {
  return getJson<IaModelsResponse>('/api/protected/user/ia-models', { signal, cache: 'no-store' });
}

export function ServiceUpdateIaModel(model: string): Promise<IaConfigResponse> {
  // Não aceitar um objeto de configuração aqui: PATCH só pode enviar o modelo.
  return patchJson<IaConfigResponse>('/api/protected/user/ia-config/model', { model });
}

export function ServiceGetIaConfig(): Promise<IaConfigResponse> {
  return getJson<IaConfigResponse>('/api/protected/user/ia-config');
}

export function ServiceUpdateIaConfig(
  payload: UpdateIaConfigPayload,
): Promise<IaConfigResponse> {
  return putJson<IaConfigResponse>('/api/protected/user/ia-config', payload);
}

export function ServiceDeleteIaConfig(): Promise<IaConfigResponse> {
  return deleteJson<IaConfigResponse>('/api/protected/user/ia-config');
}
