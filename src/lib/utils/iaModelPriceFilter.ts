import { isFreeIaModel } from './isFreeIaModel';
import type { IaConfigResponse } from 'src/services/serviceIaConfig';

/**
 * A escolha do modelo começa mostrando só os gratuitos. A exceção é quem já usa
 * um modelo pago: a lista abre com os pagos para não esconder a escolha atual.
 */
export function startsWithFreeModelsOnly(config: IaConfigResponse | null | undefined): boolean {
  if (!config?.hasKey) return true;
  return isFreeIaModel(config.model || 'openrouter/auto');
}

/** Filtra pelo preço; `keepId` mantém a seleção atual visível mesmo fora do filtro. */
export function filterIaModelsByPrice<T extends { id: string }>(
  models: T[],
  { includePaid, keepId }: { includePaid: boolean; keepId?: string | null },
): T[] {
  return includePaid ? models : models.filter((model) => isFreeIaModel(model.id) || model.id === keepId);
}
