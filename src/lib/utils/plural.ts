/**
 * Contagem com a palavra no singular ou no plural: "1 resposta", "64 respostas".
 * Recebe o plural (como as telas já escrevem) e acha o singular nesta lista.
 */
const SINGULAR: Record<string, string> = {
  avaliações: 'avaliação',
  respostas: 'resposta',
  feedbacks: 'feedback',
  comentários: 'comentário',
  'comentários analisados': 'comentário analisado',
  'avaliações novas': 'avaliação nova',
};

/** A palavra certa para a quantidade: `pluralWord(1, 'respostas')` → "resposta". */
export function pluralWord(count: number, plural: string): string {
  return count === 1 ? (SINGULAR[plural] ?? plural) : plural;
}

/** Quantidade formatada + palavra: `countLabel(1, 'respostas')` → "1 resposta". */
export function countLabel(count: number, plural: string): string {
  return `${count.toLocaleString('pt-BR')} ${pluralWord(count, plural)}`;
}
