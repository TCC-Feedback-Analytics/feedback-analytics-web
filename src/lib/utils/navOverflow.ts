/**
 * Quantos itens do menu do cabeçalho cabem lado a lado na largura disponível.
 * Se todos cabem, mostra todos. Se não, reserva o espaço do botão "Mais" e
 * mostra os primeiros que couberem antes dele; o resto vai para o "Mais".
 * Sem largura medida (antes do layout), mostra todos.
 */
export function countFittingNavItems(
  itemWidths: readonly number[],
  available: number,
  moreWidth: number,
  gap: number,
): number {
  if (available <= 0) return itemWidths.length;
  const allWidth = itemWidths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, itemWidths.length - 1);
  if (allWidth <= available) return itemWidths.length;

  let used = moreWidth;
  let count = 0;
  for (const width of itemWidths) {
    const next = used + gap + width;
    if (next > available) break;
    used = next;
    count += 1;
  }
  return count;
}
