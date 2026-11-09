import { useCallback, useEffect, useState } from 'react';
import type {
  FeedbackAnalysisSummary,
  FeedbackInsightsReport,
} from 'lib/interfaces/domain/feedback.domain';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import {
  ServiceGetFeedbackAnalysis,
  ServiceGetFeedbackInsightsReport,
} from 'src/services/serviceFeedbacks';
import { ALL_TIME_PERIOD, metricsPeriodKey, metricsPeriodParams } from 'src/lib/utils/metricsPeriod';

type UseScopedInsightsReportOptions = {
  /**
   * Quando `true`, busca também a análise (`ServiceGetFeedbackAnalysis`) e
   * retorna `summary` — usado pela página de relatório para o card de clima.
   * O `summary` segue o período escolhido; o relatório da IA, não (ele
   * considera todos os comentários analisados).
   * O dashboard não precisa (só resumo + recomendações), então deixa `false`.
   */
  withAnalysis?: boolean;
};

type UseScopedInsightsReportResult = {
  report: FeedbackInsightsReport | null;
  summary: FeedbackAnalysisSummary | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * Busca o relatório de insights filtrado pelo escopo selecionado no header
 * (`useInsightsControls`). Recarrega ao trocar de escopo e ao concluir uma
 * análise/geração de insights (botões "Analisar"/"Gerar insights" do header).
 *
 * Compartilhado pela página de relatório (`feedbackInsightsReport.tsx`) e pelo
 * dashboard, mantendo o mesmo critério de escopo (Geral = só o QR da empresa).
 */
export function useScopedInsightsReport(
  options: UseScopedInsightsReportOptions = {},
): UseScopedInsightsReportResult {
  const withAnalysis = options.withAnalysis === true;

  const { scope, catalogItemId, period, isAnalyzingRaw, isRegeneratingInsights } =
    useInsightsControls();

  // Sem a análise, o período não muda nada: não recarrega o relatório à toa.
  const analysisPeriod = withAnalysis ? period : ALL_TIME_PERIOD;

  // Recarrega quando a análise bruta ou a geração de insights conclui (true -> false),
  // ou quando a tela pede (`reload`).
  const [refreshCount, setRefreshCount] = useState(0);
  const [running, setRunning] = useState({ isAnalyzingRaw, isRegeneratingInsights });
  if (running.isAnalyzingRaw !== isAnalyzingRaw || running.isRegeneratingInsights !== isRegeneratingInsights) {
    const finished =
      (running.isAnalyzingRaw && !isAnalyzingRaw) ||
      (running.isRegeneratingInsights && !isRegeneratingInsights);
    setRunning({ isAnalyzingRaw, isRegeneratingInsights });
    if (finished) setRefreshCount((count) => count + 1);
  }
  const reload = useCallback(() => setRefreshCount((count) => count + 1), []);

  const key = `${scope}:${catalogItemId}:${withAnalysis}:${metricsPeriodKey(analysisPeriod)}:${refreshCount}`;
  // O relatório anterior continua na tela enquanto o novo carrega.
  const [result, setResult] = useState<{
    key: string;
    report: FeedbackInsightsReport | null;
    summary: FeedbackAnalysisSummary | null;
    error: string | null;
  }>({ key: '', report: null, summary: null, error: null });

  useEffect(() => {
    let cancelled = false;
    const catalogParam = scope !== 'COMPANY' ? catalogItemId || undefined : undefined;

    Promise.all([
      ServiceGetFeedbackInsightsReport({
        scope_type: scope,
        catalog_item_id: catalogParam,
      }).catch(() => null),
      withAnalysis
        ? ServiceGetFeedbackAnalysis({
            scope_type: scope,
            catalog_item_id: catalogParam,
            ...metricsPeriodParams(analysisPeriod),
          }).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([reportData, analysisData]) => {
        if (cancelled) return;
        const failed = reportData === null && (!withAnalysis || analysisData === null);
        setResult({
          key,
          report: reportData,
          summary: analysisData?.summary ?? null,
          error: failed ? 'Erro ao carregar relatório de insights' : null,
        });
      })
      .catch(() => {
        if (!cancelled) setResult((previous) => ({ ...previous, key, error: 'Erro ao carregar relatório de insights' }));
      });
    return () => {
      cancelled = true;
    };
  }, [key, scope, catalogItemId, withAnalysis, analysisPeriod]);

  const fresh = result.key === key;
  return {
    report: result.report,
    summary: result.summary,
    loading: !fresh,
    error: fresh ? result.error : null,
    reload,
  };
}
