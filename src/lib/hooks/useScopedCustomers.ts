import { useEffect, useState } from 'react';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { metricsPeriodKey, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import { ServiceGetFeedbackCustomers, type FeedbackCustomersResponse } from 'src/services/serviceFeedbacks';

export type ScopedCustomers = {
  data: FeedbackCustomersResponse | null;
  loading: boolean;
  failed: boolean;
};

/** Clientes que voltam no escopo e no período do cabeçalho (métricas novas, 4). */
export function useScopedCustomers(): ScopedCustomers {
  const { scope, catalogItemId, period } = useInsightsControls();
  const key = `${scope}:${catalogItemId}:${metricsPeriodKey(period)}`;
  const [result, setResult] = useState<{ key: string; failed: boolean; data: FeedbackCustomersResponse | null }>({
    key: '',
    failed: false,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;
    ServiceGetFeedbackCustomers({
      scope_type: scope,
      catalog_item_id: scope !== 'COMPANY' ? catalogItemId || undefined : undefined,
      ...metricsPeriodParams(period),
    })
      .then((data) => {
        if (!cancelled) setResult({ key, failed: false, data });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, failed: true, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [key, scope, catalogItemId, period]);

  const fresh = result.key === key;
  return { data: fresh ? result.data : null, loading: !fresh, failed: fresh && result.failed };
}
