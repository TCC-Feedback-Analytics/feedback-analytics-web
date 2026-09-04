import type { FeedbackHeaderProps } from './ui.types';

export default function FeedbackHeader({ stats }: FeedbackHeaderProps) {
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-5 md:p-6 lg:p-8 glass-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            Feedbacks
          </h1>
          {stats && (
            <div className="mt-1.5 text-sm text-[var(--text-tertiary)]">
              Total: {stats.totalFeedbacks} feedbacks | Média:{' '}
              {stats.averageRating}/5
            </div>
          )}
        </div>

        {stats && (
          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--positive)">
                {stats.sentimentBreakdown.positive}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Positivos</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--neutral)">
                {stats.sentimentBreakdown.neutral}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Neutros</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--negative)">
                {stats.sentimentBreakdown.negative}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Negativos</div>
            </div>
          </div>
        )}
      </div>
      <div className="gradient-banner" />
    </div>
  );
}
