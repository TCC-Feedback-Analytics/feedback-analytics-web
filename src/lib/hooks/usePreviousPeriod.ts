import { useEffect, useState } from 'react';
import type { FeedbackStats, QuestionMetric } from 'lib/interfaces/domain/feedback.domain';
import type { InsightScopeOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import {
  hasMetricsPeriod,
  metricsPeriodKey,
  previousMetricsPeriodParams,
  previousPeriodLabel,
  type MetricsPeriodParams,
} from 'src/lib/utils/metricsPeriod';
import { ServiceGetFeedbackQuestions, ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';

/** Dados do período anterior para a comparação; `null` quando a comparação está desligada. */
export type PreviousPeriod<T> = {
  /** Como o período anterior aparece na tela: "30 dias anteriores". */
  reference: string;
  loading: boolean;
  /** Não deu para buscar: a comparação some em vez de dizer "sem dados". */
  failed: boolean;
  data: T | null;
};

type FetchParams = { scope_type: InsightScopeOption; catalog_item_id?: string } & MetricsPeriodParams;

const fetchStats = (params: FetchParams) => ServiceGetFeedbackStats(params);
const fetchQuestions = (params: FetchParams) => ServiceGetFeedbackQuestions(params).then((response) => response.questions);

/**
 * Busca o mesmo escopo no período anterior (do mesmo tamanho, logo antes do
 * escolhido) quando "Comparar com o período anterior" está ligado.
 */
function usePreviousPeriodData<T>(fetcher: (params: FetchParams) => Promise<T>): PreviousPeriod<T> | null {
  const { scope, catalogItemId, period, compare } = useInsightsControls();
  const active = compare && hasMetricsPeriod(period);
  const key = active ? `${scope}:${catalogItemId}:${metricsPeriodKey(period)}` : '';
  const [result, setResult] = useState<{ key: string; failed: boolean; data: T | null }>({ key: '', failed: false, data: null });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    fetcher({
      scope_type: scope,
      catalog_item_id: scope !== 'COMPANY' ? catalogItemId || undefined : undefined,
      ...previousMetricsPeriodParams(period),
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
  }, [active, key, scope, catalogItemId, period, fetcher]);

  if (!active) return null;
  const fresh = result.key === key;
  return {
    reference: previousPeriodLabel(period),
    loading: !fresh,
    failed: fresh && result.failed,
    data: fresh ? result.data : null,
  };
}

export function usePreviousPeriodStats(): PreviousPeriod<FeedbackStats> | null {
  return usePreviousPeriodData(fetchStats);
}

export function usePreviousPeriodQuestions(): PreviousPeriod<QuestionMetric[]> | null {
  return usePreviousPeriodData(fetchQuestions);
}
