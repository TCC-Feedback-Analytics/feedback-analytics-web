import { getJson, putJson } from 'src/lib/utils/http';

export const SYSTEM_GUIDE_PATH = '/api/protected/user/onboarding/system-guide';

export type SystemGuideStatus = 'pending' | 'completed' | 'skipped';

export interface SystemGuideResponse {
  tourKey: 'system-guide';
  version: number;
  status: SystemGuideStatus;
  finishedAt: string | null;
}

export interface UpdateSystemGuidePayload {
  version: number;
  status: Extract<SystemGuideStatus, 'completed' | 'skipped'>;
}

export function ServiceGetSystemGuide(signal?: AbortSignal): Promise<SystemGuideResponse> {
  return getJson<SystemGuideResponse>(SYSTEM_GUIDE_PATH, { signal, cache: 'no-store' });
}

export function ServiceUpdateSystemGuide(
  payload: UpdateSystemGuidePayload,
): Promise<SystemGuideResponse> {
  return putJson<SystemGuideResponse>(SYSTEM_GUIDE_PATH, payload);
}
