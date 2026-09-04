import { useEffect, useState } from 'react';
import { ServiceGetIaModels, type IaConfigResponse, type IaModelsResponse } from 'src/services/serviceIaConfig';
import { iaConfigError } from 'src/lib/utils/iaConfigErrors';

interface CatalogState {
  config: IaConfigResponse | null;
  revision: number;
  catalog?: IaModelsResponse;
  error?: string;
}

export function useIaModels(config: IaConfigResponse | null) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<CatalogState | null>(null);

  useEffect(() => {
    if (!config) return;
    const controller = new AbortController();
    ServiceGetIaModels(controller.signal).then((catalog) => {
      if (!controller.signal.aborted) setState({ config, revision, catalog });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setState({ config, revision, error: iaConfigError(error, 'Não foi possível carregar os modelos. Tente novamente.').message });
      }
    });
    return () => controller.abort();
  }, [config, revision]);

  // Uma resposta do catálogo anterior nunca habilita o formulário de outra config.
  const current = state?.config === config && state?.revision === revision ? state : null;
  return {
    catalog: current?.catalog,
    error: current?.error,
    loading: Boolean(config && !current),
    reload: () => setRevision((value) => value + 1),
  };
}
