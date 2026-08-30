import { getJson, putJson, deleteJson } from 'src/lib/utils/http';

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
