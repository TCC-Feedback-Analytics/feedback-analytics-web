import { ServiceGetIaConfig, type IaConfigResponse } from 'src/services/serviceIaConfig';

export interface LoaderIaSettingsResult {
  iaConfig: IaConfigResponse;
}

export async function LoaderIaSettings(): Promise<LoaderIaSettingsResult> {
  try {
    const iaConfig = await ServiceGetIaConfig();
    return { iaConfig };
  } catch (error) {
    console.error('LoaderIaSettings: falha ao carregar configuração de IA', error);
    return {
      iaConfig: {
        hasKey: false,
        provider: null,
        model: null,
        keyHint: null,
      },
    };
  }
}
