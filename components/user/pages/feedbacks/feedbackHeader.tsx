import { formatRating, ratingShares } from 'src/lib/utils/ratingLabel';
import { countLabel } from 'src/lib/utils/plural';
import { FaInbox } from 'react-icons/fa6';
import type { FeedbackHeaderProps } from './ui.types';

export default function FeedbackHeader({ stats }: FeedbackHeaderProps) {
  const shares = stats ? ratingShares(stats.ratingDistribution, stats.totalFeedbacks) : null;

  return (
    <section className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-4 sm:p-6 glass-card">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
            <FaInbox aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--primary-color)">Feedbacks recebidos</p>
            <h1 className="mt-1 font-montserrat text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
              Acompanhe a opinião dos clientes
            </h1>
          {stats && (
            <div className="mt-1.5 text-sm leading-relaxed text-[var(--text-tertiary)]">
              {countLabel(stats.totalFeedbacks, 'feedbacks')} recebidos · Média:{' '}
              {stats.totalFeedbacks > 0 ? `${formatRating(stats.averageRating)}/5` : '—'}
            </div>
          )}
          </div>
        </div>

        {shares && (
          // Contagens pelas ESTRELAS: "positivas/críticas" ficam para a nota e
          // "positivo/negativo", para o tom dos comentários lido pela IA.
          <div className="grid w-full grid-cols-3 divide-x divide-(--quaternary-color)/12 rounded-xl border border-(--quaternary-color)/10 bg-(--bg-primary)/30 py-2 sm:w-auto sm:min-w-80" aria-label="Avaliações por estrelas">
            <div className="px-2 text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--positive)">{shares.positive.count}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Positivas (4–5★)</div>
            </div>
            <div className="px-2 text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--neutral)">{shares.neutral.count}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Neutras (3★)</div>
            </div>
            <div className="px-2 text-center">
              <div className="text-xl sm:text-2xl font-bold text-(--negative)">{shares.critical.count}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Críticas (1–2★)</div>
            </div>
          </div>
        )}
      </div>
      <div className="gradient-banner" />
    </section>
  );
}
