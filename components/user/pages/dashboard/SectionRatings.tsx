import { Link } from 'react-router-dom';
import { FaArrowRight, FaFaceFrown, FaFaceMeh, FaFaceSmile, FaStar } from 'react-icons/fa6';
import MetricCard from 'components/user/shared/cards/MetricCard';
import MetricHelp from 'components/user/shared/MetricHelp';
import PrecisionBadge from 'components/user/shared/PrecisionBadge';
import ScopeTag from 'components/user/shared/ScopeTag';
import PeriodDelta from 'components/user/shared/PeriodDelta';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import {
  RATING_TONE_CLASS,
  formatRating,
  ratingLabel,
  ratingShares,
  ratingTone,
} from 'src/lib/utils/ratingLabel';
import { scopeText } from 'src/lib/utils/scopeText';
import { wilsonPctInterval } from 'src/lib/utils/periodComparison';
import { comparableKinds } from 'src/lib/utils/compareItems';
import type { RatingCardsProps, SectionRatingsProps, ShareValueProps } from './ui.types';

/**
 * "Avaliação por estrelas" (decisão de 16/10/2026): só a nota de 1 a 5. No
 * Dashboard, 3 cards — média com parâmetro, positivas e críticas com %. Na página
 * "Todas as métricas de estrelas" (variant 'detail'), também as neutras.
 */
export default function SectionRatings({ stats, previous = null, variant = 'dashboard' }: SectionRatingsProps) {
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const total = stats?.totalFeedbacks ?? 0;

  return (
    <section
      className="font-work-sans space-y-4"
      aria-labelledby="ratings-section-title"
      data-tour={variant === 'dashboard' ? 'tour-star-ratings' : undefined}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ratings-section-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
          Avaliação por estrelas
        </h2>
        <ScopeTag />
      </header>

      {!stats || total === 0 ? (
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-6 text-sm text-(--text-tertiary)">
          Ainda sem avaliações {scopeInfo.inScope}.
        </div>
      ) : (
        <RatingCards
          stats={stats}
          total={total}
          ofScope={scopeInfo.ofScope}
          showNeutral={variant === 'detail'}
          previous={previous}
        />
      )}

      {variant === 'dashboard' && (
        <div className="flex flex-wrap justify-end gap-x-5 gap-y-2">
          {comparableKinds(catalogItemOptions).length > 0 && (
            <Link
              to="/user/compare"
              className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
            >
              Comparar dois itens
              <FaArrowRight className="text-xs" aria-hidden />
            </Link>
          )}
          <Link
            to="/user/ratings"
            className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
          >
            Ver todas as métricas de estrelas
            <FaArrowRight className="text-xs" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}

function RatingCards({ stats, total, ofScope, showNeutral, previous }: RatingCardsProps) {
  const shares = ratingShares(stats.ratingDistribution, total);
  const average = stats.averageRating;

  // Comparação com o período anterior (parte C): média, positivas e críticas.
  const prevStats = previous?.data && previous.data.totalFeedbacks > 0 ? previous.data : null;
  const prevTotal = prevStats?.totalFeedbacks ?? 0;
  const prevShares = prevStats ? ratingShares(prevStats.ratingDistribution, prevTotal) : null;
  const deltaState = { reference: previous?.reference ?? '', loading: previous?.loading, failed: previous?.failed };
  const shareDelta = (metricName: string, key: 'positive' | 'critical') =>
    previous ? (
      <PeriodDelta
        metricName={metricName}
        kind="points"
        higherIsBetter={key === 'positive'}
        current={{ value: shares[key].pct, interval: wilsonPctInterval(shares[key].count, total) }}
        previous={prevShares ? { value: prevShares[key].pct, interval: wilsonPctInterval(prevShares[key].count, prevTotal) } : null}
        {...deltaState}
      />
    ) : null;

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${showNeutral ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
      <MetricCard
        title={
          <span className="inline-flex items-center gap-1">
            Média <MetricHelp term="ratingAverage" />
          </span>
        }
        value={
          <span className="inline-flex flex-wrap items-baseline gap-x-2">
            <span>
              {formatRating(average)}
              <span className="text-base font-normal text-(--text-tertiary)"> /5</span>
            </span>
            <FaStar className="self-center text-xl text-yellow-400" aria-hidden />
            <span className={`text-base font-semibold ${RATING_TONE_CLASS[ratingTone(average)]}`}>
              {ratingLabel(average)}
            </span>
          </span>
        }
        helper={
          <span className="flex flex-col gap-1.5">
            <span className="flex flex-wrap items-center gap-2">
              <span>{total.toLocaleString('pt-BR')} avaliações</span>
              <PrecisionBadge
                metricName="Média de satisfação"
                n={total}
                unit="avaliações"
                interval={stats.starMeanCI}
                kind="mean"
                ofScope={ofScope}
              />
            </span>
            {previous && (
              <PeriodDelta
                metricName="Média"
                kind="rating"
                current={{ value: average, interval: stats.starMeanCI }}
                previous={prevStats ? { value: prevStats.averageRating, interval: prevStats.starMeanCI } : null}
                {...deltaState}
              />
            )}
          </span>
        }
        icon={FaStar}
      />
      <MetricCard
        title={
          <span className="inline-flex items-center gap-1">
            Positivas (4–5★) <MetricHelp term="ratingShares" />
          </span>
        }
        value={<ShareValue count={shares.positive.count} pct={shares.positive.pct} />}
        helper={
          <span className="flex flex-col gap-1.5">
            <span>das avaliações</span>
            {shareDelta('Positivas', 'positive')}
          </span>
        }
        icon={FaFaceSmile}
      />
      {showNeutral && (
        <MetricCard
          title="Neutras (3★)"
          value={<ShareValue count={shares.neutral.count} pct={shares.neutral.pct} />}
          helper="das avaliações"
          icon={FaFaceMeh}
        />
      )}
      <MetricCard
        title="Críticas (1–2★)"
        value={<ShareValue count={shares.critical.count} pct={shares.critical.pct} />}
        helper={
          <span className="flex flex-col gap-1.5">
            <span>das avaliações</span>
            {shareDelta('Críticas', 'critical')}
          </span>
        }
        icon={FaFaceFrown}
      />
    </div>
  );
}

function ShareValue({ count, pct }: ShareValueProps) {
  return (
    <span>
      {count.toLocaleString('pt-BR')}
      <span className="text-base font-normal text-(--text-tertiary)"> · {pct}%</span>
    </span>
  );
}
