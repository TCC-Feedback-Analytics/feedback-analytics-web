import { useEffect, useState } from 'react';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { hasMetricsPeriod, metricsPeriodKey, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import { ALL_TIME_MAX_WEEKS, browserTimeZone, chooseTimelineBucket } from 'src/lib/utils/timeline';
import { ServiceGetFeedbackTimeline, type FeedbackTimelineResponse } from 'src/services/serviceFeedbacks';

export type ScopedTimeline = {
  data: FeedbackTimelineResponse | null;
  loading: boolean;
  failed: boolean;
};

/**
 * Movimento no tempo do escopo e do período do cabeçalho (métricas novas, 1).
 * Sem período, pede por semana; se o histórico passar de 6 meses, pede de novo
 * por mês, para o gráfico não ficar com barras finas demais.
 */
export function useScopedTimeline(): ScopedTimeline {
  const { scope, catalogItemId, period } = useInsightsControls();
  const key = `${scope}:${catalogItemId}:${metricsPeriodKey(period)}`;
  const [result, setResult] = useState<{ key: string; failed: boolean; data: FeedbackTimelineResponse | null }>({
    key: '',
    failed: false,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;
    const base = {
      scope_type: scope,
      catalog_item_id: scope !== 'COMPANY' ? catalogItemId || undefined : undefined,
      ...metricsPeriodParams(period),
      tz: browserTimeZone(),
    };

    ServiceGetFeedbackTimeline({ ...base, bucket: chooseTimelineBucket(period) })
      .then((data) =>
        !hasMetricsPeriod(period) && data.bucket === 'week' && data.points.length > ALL_TIME_MAX_WEEKS
          ? ServiceGetFeedbackTimeline({ ...base, bucket: 'month' })
          : data,
      )
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
