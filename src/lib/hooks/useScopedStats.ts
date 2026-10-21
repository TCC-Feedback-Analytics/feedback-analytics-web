import { useEffect, useState } from 'react';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { metricsPeriodKey, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';

export type ScopedStats = {
  data: FeedbackStats | null;
  loading: boolean;
  failed: boolean;
};

/** Stats do escopo e do período do cabeçalho (para as telas que não as recebem por loader). */
export function useScopedStats(): ScopedStats {
  const { scope, catalogItemId, period } = useInsightsControls();
  const key = `${scope}:${catalogItemId}:${metricsPeriodKey(period)}`;
  const [result, setResult] = useState<{ key: string; failed: boolean; data: FeedbackStats | null }>({
    key: '',
    failed: false,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;
    ServiceGetFeedbackStats({
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
