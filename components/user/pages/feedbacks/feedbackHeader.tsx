import { formatRating, ratingShares } from 'src/lib/utils/ratingLabel';
import { countLabel } from 'src/lib/utils/plural';
import type { FeedbackHeaderProps } from './ui.types';

export default function FeedbackHeader({ stats }: FeedbackHeaderProps) {
  const shares = stats ? ratingShares(stats.ratingDistribution, stats.totalFeedbacks) : null;

  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-5 md:p-6 lg:p-8 glass-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            Feedbacks
          </h1>
          {stats && (
            <div className="mt-1.5 text-sm text-[var(--text-tertiary)]">
              Total: {countLabel(stats.totalFeedbacks, 'feedbacks')} | Média das estrelas:{' '}
              {stats.totalFeedbacks > 0 ? `${formatRating(stats.averageRating)}/5` : '—'}
            </div>
          )}
        </div>

        {shares && (
          // Contagens pelas ESTRELAS: "positivas/críticas" ficam para a nota e
          // "positivo/negativo", para o tom dos comentários lido pela IA.
          <div className="flex shrink-0 items-center gap-4 sm:gap-6" aria-label="Avaliações por estrelas">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--positive)">{shares.positive.count}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Positivas (4–5★)</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--neutral)">{shares.neutral.count}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Neutras (3★)</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--negative)">{shares.critical.count}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Críticas (1–2★)</div>
            </div>
          </div>
        )}
      </div>
      <div className="gradient-banner" />
    </div>
  );
}
