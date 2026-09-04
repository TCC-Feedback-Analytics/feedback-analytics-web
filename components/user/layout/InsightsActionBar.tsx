import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaWandMagicSparkles, FaSpinner } from "react-icons/fa6";
import { useInsightsControls } from "src/lib/context/insightsControls";
import { isMatch } from "src/lib/utils/navMatch";
import { useScopedPendingCount } from "src/lib/hooks/useScopedPendingCount";
import InsightsControlsBar from "components/user/pages/feedbacksInsightsReport/InsightsControlsBar";
import GenerateInsightsDialog from "components/user/pages/feedbacksInsightsReport/GenerateInsightsDialog";
import { NotificationBellDropdown } from "components/user/pages/feedbacksInsightsReport/NotificationBellDropdown";

/**
 * Barra de controles de Insights no layout (abaixo do header): seletor de
 * escopo + contador de feedbacks novos (com sino interativo) + Botão unificado "Gerar Insights com IA".
 * Os controles aparecem em Dashboard/Insights; o progresso acompanha todas as rotas.
 */
export default function InsightsActionBar() {
  const { pathname } = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isScopeRoute =
    isMatch("/user/dashboard", pathname) || isMatch("/user/insights", pathname);

  const {
    scope,
    catalogItemId,
    catalogItemOptions,
    isAnalyzingRaw,
    isRegeneratingInsights,
    rawStatus,
    insightsStatus,
    rawProgress,
    insightsProgress,
    pollingWarning,
  } = useInsightsControls();

  const { pendingCount, totalFeedbacks } = useScopedPendingCount(isScopeRoute);

  const isProcessing = isAnalyzingRaw || isRegeneratingInsights || rawStatus === 'running' || insightsStatus === 'running';
  const progress = isAnalyzingRaw ? rawProgress : insightsProgress;

  return (
    <>
      {(isScopeRoute || isProcessing) && <div className="relative z-20 mb-5 flex w-full max-w-full flex-wrap items-center gap-3 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-3">
        {isScopeRoute && <>
        <InsightsControlsBar />

        {/* Sino de Notificação Interativo */}
        <NotificationBellDropdown
          pendingCount={pendingCount}
          totalFeedbacks={totalFeedbacks}
          scope={scope}
          catalogItemId={catalogItemId}
          catalogItemOptions={catalogItemOptions}
          onOpenGenerateDialog={() => setIsDialogOpen(true)}
        />
        </>}

        {isProcessing && <p role="status" className="text-xs text-(--text-secondary)">
          {pollingWarning ? 'Reconectando ao progresso...' : isAnalyzingRaw ? 'Analisando feedbacks em segundo plano' : 'Gerando relatório em segundo plano'}
          {progress && progress.total > 0 ? ` (${progress.done}/${progress.total})` : ''}
        </p>}

        <div className="sm:ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="btn-primary font-poppins inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold shadow-md transition-all hover:scale-[1.02]"
          >
            {isProcessing ? (
              <>
                <FaSpinner aria-hidden className="animate-spin text-xs" />
                <span>Processando IA...</span>
              </>
            ) : (
              <>
                <FaWandMagicSparkles aria-hidden className="text-xs" />
                <span>Gerar Insights com IA</span>
              </>
            )}
          </button>
        </div>
      </div>}

      <GenerateInsightsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}


