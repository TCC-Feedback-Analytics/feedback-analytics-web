/**
 * Participação nos comentários (o comentário é opcional no formulário): quando
 * avisar que o tom dos comentários representa pouca gente e como dizer se quem
 * comenta está mais ou menos satisfeito que quem só dá as estrelas.
 */
import type { CommentGroupRating } from 'lib/interfaces/domain/feedback.domain';
import { comparePeriods } from './periodComparison';

/** Abaixo disso, o tom dos comentários representa só uma parte dos clientes. */
export const LOW_PARTICIPATION_PCT = 30;
/** Avaliações mínimas para o aviso de representatividade valer (com menos, tudo é incerto). */
export const MIN_FOR_PARTICIPATION_NOTICE = 10;

export function isLowParticipation(pct: number, total: number): boolean {
  return total >= MIN_FOR_PARTICIPATION_NOTICE && pct < LOW_PARTICIPATION_PCT;
}

export type CommentGroupsVerdict = { text: string; tone: string };

/** "Quem comenta está menos satisfeito", "Diferença incerta"… ou `null` sem os dois grupos. */
export function commentGroupsVerdict(
  withComment: CommentGroupRating | null | undefined,
  withoutComment: CommentGroupRating | null | undefined,
): CommentGroupsVerdict | null {
  if (!withComment || !withoutComment) return null;
  const result = comparePeriods(
    { value: withComment.mean, interval: withComment.ci },
    { value: withoutComment.mean, interval: withoutComment.ci },
    { decimals: 1 },
  );
  if (result.status === 'same') return { text: 'Quem comenta dá a mesma nota de quem não comenta', tone: 'text-(--text-secondary)' };
  if (result.status !== 'changed') return null;
  if (result.uncertain) return { text: 'Diferença incerta: ainda há poucas avaliações para saber', tone: 'text-(--text-tertiary)' };
  return result.improved
    ? { text: 'Quem comenta está mais satisfeito', tone: 'text-(--positive)' }
    : { text: 'Quem comenta está menos satisfeito', tone: 'text-(--negative)' };
}
