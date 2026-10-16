import { useEffect, useState } from 'react';
import PageHeader from 'components/user/shared/PageHeader';
import SectionRatings from 'components/user/pages/dashboard/SectionRatings';
import SectionEvaluationDistribution from 'components/user/pages/dashboard/SectionEvaluationDistribution';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';

/**
 * "Todas as métricas de estrelas": o detalhe da Avaliação por estrelas do
 * Dashboard, pelo escopo do cabeçalho — média, positivas, neutras e críticas, e a
 * distribuição de 1 a 5★. Futuramente, a evolução da nota no tempo.
 */
export default function Ratings() {
  const { scope, catalogItemId } = useInsightsControls();
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ServiceGetFeedbackStats({
      scope_type: scope,
      catalog_item_id: scope !== 'COMPANY' ? catalogItemId || undefined : undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setFailed(false);
      })
      .catch(() => {
        if (cancelled) return;
        setStats(null);
        setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope, catalogItemId]);

  return (
    <div className="font-work-sans space-y-6">
      <PageHeader />

      {failed ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">
          Não foi possível carregar as avaliações agora. Tente novamente em instantes.
        </div>
      ) : loading && !stats ? (
        <p className="text-sm text-(--text-tertiary)">Carregando avaliações…</p>
      ) : (
        <>
          <SectionRatings stats={stats} variant="detail" />
          {stats && stats.totalFeedbacks > 0 && <SectionEvaluationDistribution stats={stats} />}
        </>
      )}
    </div>
  );
}
