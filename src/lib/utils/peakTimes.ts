import type { FeedbackHeatmapCell } from 'src/services/serviceFeedbacks';

/**
 * Dias e horários de pico (métricas novas, 3): nomes dos dias e das faixas e o
 * resumo "quando mais avaliam" e "quando a nota é pior".
 */

/** Como o `extract(dow)` do Postgres: 0 domingo … 6 sábado. */
export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_NAME = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export const BAND_LABEL = ['Madrugada (0–6h)', 'Manhã (6–12h)', 'Tarde (12–18h)', 'Noite (18–24h)'];
/** Nome e horas separados, para a faixa caber em duas linhas curtas no celular. */
export const BAND_NAME = ['Madrugada', 'Manhã', 'Tarde', 'Noite'];
export const BAND_HOURS = ['0–6h', '6–12h', '12–18h', '18–24h'];
const BAND_PHRASE = ['de madrugada', 'de manhã', 'à tarde', 'à noite'];

/** Abaixo disso, a média da faixa fica apagada (pouco confiável). */
export const PEAK_FEW_RATINGS = 5;
/** "Pior média" só entre faixas com pelo menos isso de avaliações. */
export const PEAK_MIN_FOR_WORST = 10;

/** "sexta à tarde", "domingo de madrugada". */
export function cellPhrase(cell: Pick<FeedbackHeatmapCell, 'weekday' | 'band'>): string {
  return `${WEEKDAY_NAME[cell.weekday]} ${BAND_PHRASE[cell.band]}`;
}

export function peakSummary(cells: FeedbackHeatmapCell[]): {
  busiest: FeedbackHeatmapCell | null;
  worst: FeedbackHeatmapCell | null;
} {
  const busiest = cells.reduce<FeedbackHeatmapCell | null>(
    (best, cell) => (cell.count > (best?.count ?? 0) ? cell : best),
    null,
  );
  // A pior média só faz sentido comparando ao menos duas faixas com avaliações suficientes.
  const solid = cells.filter((cell) => cell.count >= PEAK_MIN_FOR_WORST && cell.mean != null);
  const worst = solid.length >= 2 ? solid.reduce((low, cell) => (cell.mean! < low.mean! ? cell : low)) : null;
  return { busiest, worst };
}
