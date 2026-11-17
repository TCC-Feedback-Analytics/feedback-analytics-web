import { useEffect, useState } from 'react';
import PageHeader from 'components/user/shared/PageHeader';
import SectionChannels from 'components/user/pages/dashboard/SectionChannels';
import SectionPeakTimes from 'components/user/pages/dashboard/SectionPeakTimes';
import SectionReturningCustomers from 'components/user/pages/dashboard/SectionReturningCustomers';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';
import { metricsPeriodKey, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';

/**
 * "Clientes e canais" (grupo "Quem avalia, quando e por onde?", decisão de
 * 12/11/2026), pelo escopo do cabeçalho: por onde as avaliações chegaram, os dias
 * e horários de pico e os clientes que voltam. O Dashboard mostra só os canais.
 */
export default function Customers() {
  const { scope, catalogItemId, period } = useInsightsControls();
  const key = `${scope}:${catalogItemId}:${metricsPeriodKey(period)}`;
  // A última resposta continua na tela até chegar a do recorte atual.
  const [result, setResult] = useState<{ key: string; stats: FeedbackStats | null; failed: boolean }>({
    key: '',
    stats: null,
    failed: false,
  });
  const { stats, failed } = result;

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
    // Alvo do passo "Clientes e canais" do guia.
    <div className="font-work-sans space-y-6" data-tour="tour-customers-page">
      <PageHeader />

      {/* Os canais vêm das métricas gerais; o pico e os clientes que voltam buscam os próprios dados. */}
      {failed ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">
          Não foi possível carregar os canais agora. Tente novamente em instantes.
        </div>
      ) : (
        <SectionChannels stats={stats} variant="detail" />
      )}
      <SectionPeakTimes />
      <SectionReturningCustomers />
    </div>
  );
}
