/** Variantes explicitamente gratuitas, sem inferir preço pelo nome do modelo. */
export function isFreeIaModel(modelId: string): boolean {
  // O roteador comum (openrouter/auto) pode selecionar modelos pagos.
  return modelId.endsWith(':free') || modelId === 'openrouter/free';
}
