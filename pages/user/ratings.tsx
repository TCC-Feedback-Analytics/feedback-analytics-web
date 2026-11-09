import { useEffect, useState } from 'react';
import PageHeader from 'components/user/shared/PageHeader';
import SectionRatings from 'components/user/pages/dashboard/SectionRatings';
import SectionEvaluationDistribution from 'components/user/pages/dashboard/SectionEvaluationDistribution';
import SectionMovement from 'components/user/pages/dashboard/SectionMovement';
import SectionPeakTimes from 'components/user/pages/dashboard/SectionPeakTimes';
import SectionReturningCustomers from 'components/user/pages/dashboard/SectionReturningCustomers';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';
import { metricsPeriodKey, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import { usePreviousPeriodStats } from 'src/lib/hooks/usePreviousPeriod';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';

/**
 * "Todas as métricas de estrelas": o detalhe da Avaliação por estrelas do
 * Dashboard, pelo escopo do cabeçalho — média, positivas, neutras e críticas, e a
 * distribuição de 1 a 5★, o movimento das avaliações no tempo, os dias e
 * horários de pico e os clientes que voltam.
 */
export default function Ratings() {
  const { scope, catalogItemId, period } = useInsightsControls();
  const key = `${scope}:${catalogItemId}:${metricsPeriodKey(period)}`;
  // A última resposta continua na tela até chegar a do recorte atual.
  const [result, setResult] = useState<{ key: string; stats: FeedbackStats | null; failed: boolean }>({
    key: '',
    stats: null,
    failed: false,
  });
  const { stats, failed } = result;
  const loading = result.key !== key;
  const previous = usePreviousPeriodStats();

  useEffect(() => {
    let cancelled = false;
    ServiceGetFeedbackStats({
      scope_type: scope,
      catalog_item_id: scope !== 'COMPANY' ? catalogItemId || undefined : undefined,
      ...metricsPeriodParams(period),
    })
      .then((data) => {
        if (!cancelled) setResult({ key, stats: data, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, stats: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [key, scope, catalogItemId, period]);

  return (
    // Alvo do passo "Todas as métricas de estrelas" do guia.
    <div className="font-work-sans space-y-6" data-tour="tour-ratings-page">
      <PageHeader />

      {failed ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">
          Não foi possível carregar as avaliações agora. Tente novamente em instantes.
        </div>
      ) : loading && !stats ? (
        <p className="text-sm text-(--text-tertiary)">Carregando avaliações…</p>
      ) : (
        <>
          <SectionRatings stats={stats} previous={previous} variant="detail" />
          {stats && stats.totalFeedbacks > 0 && <SectionEvaluationDistribution stats={stats} />}
          <SectionMovement variant="detail" />
          <SectionPeakTimes />
          <SectionReturningCustomers />
        </>
      )}
    </div>
  );
}
