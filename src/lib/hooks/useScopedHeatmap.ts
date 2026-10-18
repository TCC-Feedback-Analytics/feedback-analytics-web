import { useEffect, useState } from 'react';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { metricsPeriodKey, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import { browserTimeZone } from 'src/lib/utils/timeline';
import { ServiceGetFeedbackHeatmap, type FeedbackHeatmapResponse } from 'src/services/serviceFeedbacks';

export type ScopedHeatmap = {
  data: FeedbackHeatmapResponse | null;
  loading: boolean;
  failed: boolean;
};

/** Dias e horários de pico do escopo e do período do cabeçalho (métricas novas, 3). */
export function useScopedHeatmap(): ScopedHeatmap {
  const { scope, catalogItemId, period } = useInsightsControls();
  const key = `${scope}:${catalogItemId}:${metricsPeriodKey(period)}`;
  const [result, setResult] = useState<{ key: string; failed: boolean; data: FeedbackHeatmapResponse | null }>({
    key: '',
    failed: false,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;
    ServiceGetFeedbackHeatmap({
      scope_type: scope,
      catalog_item_id: scope !== 'COMPANY' ? catalogItemId || undefined : undefined,
      ...metricsPeriodParams(period),
      tz: browserTimeZone(),
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
