/**
 * Rótulo em palavras da nota média (1 a 5), pela mesma escala que o cliente
 * respondeu no formulário (Péssimo → Ótimo). Dá parâmetro ao número: "4,2" sozinho
 * não diz se é bom; "4,2 /5 Boa" diz. Decisão de organização das métricas (16/10/2026).
 */

export type RatingLabel = 'Ótima' | 'Boa' | 'Mediana' | 'Ruim' | 'Péssima';
export type RatingTone = 'positive' | 'neutral' | 'negative';

/** Arredonda como a tela mostra (uma casa), para o rótulo nunca contradizer o número. */
function roundForDisplay(mean: number): number {
  return Math.round(mean * 10) / 10;
}

/** 4,5–5,0 Ótima · 3,5–4,4 Boa · 2,5–3,4 Mediana · 1,5–2,4 Ruim · 1,0–1,4 Péssima. */
export function ratingLabel(mean: number): RatingLabel {
  const value = roundForDisplay(mean);
  if (value >= 4.5) return 'Ótima';
  if (value >= 3.5) return 'Boa';
  if (value >= 2.5) return 'Mediana';
  if (value >= 1.5) return 'Ruim';
  return 'Péssima';
}

export function ratingTone(mean: number): RatingTone {
  const label = ratingLabel(mean);
  if (label === 'Ótima' || label === 'Boa') return 'positive';
  if (label === 'Mediana') return 'neutral';
  return 'negative';
}

/** Cor do rótulo da nota (tokens do tema). */
export const RATING_TONE_CLASS: Record<RatingTone, string> = {
  positive: 'text-(--positive)',
  neutral: 'text-(--neutral)',
  negative: 'text-(--negative)',
};

export type RatingShare = { count: number; pct: number };

/**
 * Avaliações positivas (4–5★), neutras (3★) e críticas (1–2★), com o % sobre o
 * total. Calculado pela distribuição das estrelas — e não pelo campo
 * `sentimentBreakdown`, que tem nome de sentimento mas também vem das estrelas.
 */
export function ratingShares(
  distribution: Record<1 | 2 | 3 | 4 | 5, number>,
  total: number,
): { positive: RatingShare; neutral: RatingShare; critical: RatingShare } {
  const share = (count: number): RatingShare => ({
    count,
    pct: total > 0 ? Math.round((count / total) * 100) : 0,
  });
  return {
    positive: share(distribution[4] + distribution[5]),
    neutral: share(distribution[3]),
    critical: share(distribution[1] + distribution[2]),
  };
}

/** Nota no formato da tela: "4,2". */
export function formatRating(mean: number): string {
  return roundForDisplay(mean).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
