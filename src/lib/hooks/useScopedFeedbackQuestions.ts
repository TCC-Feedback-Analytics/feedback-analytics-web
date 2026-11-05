import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';
import type { FeedbackQuestionsLoadData } from 'src/routes/load/loadFeedbackQuestions';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { ServiceGetFeedbackQuestions } from 'src/services/serviceFeedbacks';
import { hasMetricsPeriod, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import { useLatestRequest } from './useLatestRequest';

type UseScopedFeedbackQuestionsResult = {
  questions: QuestionMetric[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * Métricas por pergunta filtradas pelo escopo e pelo período selecionados em `useInsightsControls`.
 * Semeia com os dados do loader (escopo Empresa) e recarrega ao trocar de
 * escopo/item. Não depende da IA (perguntas são determinísticas), então não
 * reage a Analisar/Gerar.
 */
export function useScopedFeedbackQuestions(
  initialData: FeedbackQuestionsLoadData,
): UseScopedFeedbackQuestionsResult {
  const { scope, catalogItemId, period } = useInsightsControls();

  const didInitRef = useRef(false);
  const [questions, setQuestions] = useState<QuestionMetric[]>(initialData.questions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialData.error);
  const startRequest = useLatestRequest();

  const fetchQuestions = useCallback(async () => {
    const isLatest = startRequest();
    setLoading(true);
    setError(null);

    const catalogParam =
      scope !== 'COMPANY' ? catalogItemId || undefined : undefined;

    try {
      const data = await ServiceGetFeedbackQuestions({
        scope_type: scope,
        catalog_item_id: catalogParam,
        ...metricsPeriodParams(period),
      });
      if (!isLatest()) return;
      setQuestions(data.questions);
    } catch {
      if (!isLatest()) return;
      setQuestions([]);
      setError('Erro ao carregar métricas por pergunta');
    } finally {
      if (isLatest()) setLoading(false);
    }
  }, [scope, catalogItemId, period, startRequest]);

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      if (scope === 'COMPANY' && !catalogItemId && !hasMetricsPeriod(period)) {
        return;
      }
    }
    fetchQuestions();
  }, [fetchQuestions, scope, catalogItemId, period]);

  return { questions, loading, error, reload: fetchQuestions };
}
