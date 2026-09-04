import { ServiceGetIaConfig, type IaConfigResponse } from 'src/services/serviceIaConfig';
import { iaConfigError } from 'src/lib/utils/iaConfigErrors';

export interface LoaderIaSettingsResult {
  iaConfig: IaConfigResponse | null;
  error?: string;
}

export async function LoaderIaSettings(): Promise<LoaderIaSettingsResult> {
  try {
    const iaConfig = await ServiceGetIaConfig();
    return { iaConfig };
  } catch (error) {
    // Falha de leitura não significa que a empresa está sem chave.
    return {
      iaConfig: null,
      error: iaConfigError(error, 'Não foi possível carregar a configuração de IA. Tente novamente.').message,
    };
  }
}
