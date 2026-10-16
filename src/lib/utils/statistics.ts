/**
 * Formatação das métricas estatísticas das análises.
 * A MATEMÁTICA vive no backend (libs/statistics); aqui só apresentamos.
 */

/** Net Sentiment Score com sinal explícito (+40, -12, 0). */
export function formatNss(nss: number): string {
  const rounded = Math.round(nss);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
