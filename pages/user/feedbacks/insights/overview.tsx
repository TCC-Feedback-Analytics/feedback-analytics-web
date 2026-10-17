import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedInsightsReport } from 'src/lib/hooks/useScopedInsightsReport';
import { usePreviousPeriodStats } from 'src/lib/hooks/usePreviousPeriod';
import { scopeText } from 'src/lib/utils/scopeText';
import { hasMetricsPeriod } from 'src/lib/utils/metricsPeriod';
import { COMMENTS_SUMMARY_PERIOD_NOTE } from 'src/lib/constants/commentsSummary';
import InsightsReportSkeleton from 'components/user/pages/feedbacks/insights/InsightsReportSkeleton';
import InsightsReportErrorState from 'components/user/pages/feedbacksInsightsReport/InsightsReportErrorState';
import InsightsReportHeaderSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportHeaderSection';
import InsightsReportContent from 'components/user/pages/feedbacksInsightsReport/InsightsReportContent';
import CommentToneSection from 'components/user/pages/comments/CommentToneSection';
import CommentTopicsSection from 'components/user/pages/comments/CommentTopicsSection';
import PageHeader from 'components/user/shared/PageHeader';
import ScopeTag from 'components/user/shared/ScopeTag';

/**
 * "Análise dos comentários" › Visão geral (decisões de 16/10/2026): o que os
 * clientes ESCREVERAM, lido pela IA — tom dos comentários, assuntos que mais
 * impactam e o resumo com recomendações. Substitui Relatórios, Emocional e
 * Estatísticas, que repetiam a mesma contagem de tom.
 */
export default function CommentsOverview() {
  const { canAnalyze, isRegeneratingInsights, scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  const { report, summary, loading, error: fetchError } = useScopedInsightsReport({ withAnalysis: true });
  const previousStats = usePreviousPeriodStats();

  const refreshing = isRegeneratingInsights || loading;
  const errorKey = fetchError ? `fetch:${fetchError}` : null;
  const showErrorPopup = Boolean(errorKey && dismissedErrorKey !== errorKey);

  const analysisBlockedMessage = canAnalyze
    ? null
    : 'Para analisar os comentários, preencha as informações da empresa em Editar > Configuração de Coleta de Dados.';

  if (loading && !report && !summary && !fetchError) {
    return <InsightsReportSkeleton />;
  }

  const updatedLabel = report?.updatedAt != null ? new Date(report.updatedAt).toLocaleString('pt-BR') : null;

  return (
    <>
      <div className="font-work-sans space-y-6 pb-8">
        <PageHeader />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/user/insights/comments"
            className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary) hover:text-(--text-primary)"
          >
            Ver os comentários
            <FaArrowRight className="text-xs" aria-hidden />
          </Link>
          <ScopeTag />
        </div>

        <div className="relative space-y-6">
          <CommentToneSection summary={summary} inScope={scopeInfo.inScope} ofScope={scopeInfo.ofScope} previous={previousStats} />

          {summary && summary.totalAnalyzed > 0 && <CommentTopicsSection summary={summary} />}

          <section className="space-y-6 rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
            <InsightsReportHeaderSection
              updatedLabel={updatedLabel}
              canAnalyze={canAnalyze}
              analysisBlockedMessage={analysisBlockedMessage}
            />
            {hasMetricsPeriod(period) && (
              <p className="-mt-3 text-xs font-medium text-(--text-secondary)">{COMMENTS_SUMMARY_PERIOD_NOTE}</p>
            )}
            <InsightsReportContent report={report} />
          </section>

          {refreshing && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/38 backdrop-blur-[1px]" />
          )}
        </div>
      </div>

      {showErrorPopup && fetchError && (
        <InsightsReportErrorState error={fetchError} variant="error" onClose={() => setDismissedErrorKey(errorKey)} />
      )}
    </>
  );
}
