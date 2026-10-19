import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaWandMagicSparkles, FaSpinner } from "react-icons/fa6";
import { useInsightsControls } from "src/lib/context/insightsControls";
import { isMatch } from "src/lib/utils/navMatch";
import InsightsControlsBar from "components/user/pages/feedbacksInsightsReport/InsightsControlsBar";
import GenerateInsightsDialog from "components/user/pages/feedbacksInsightsReport/GenerateInsightsDialog";
import IaModelQuickSwitch from "components/user/shared/IaModelQuickSwitch";
import { useIaSlowNoticePreference } from "src/lib/hooks/useIaSlowNoticePreference";
import { IA_SLOW_AFTER_MS } from "src/lib/utils/iaSlowNotice";

/**
 * Barra de controles de Insights no layout (abaixo do header): seletor de
 * escopo e período + botão "Analisar comentários com IA". O sino dos feedbacks
 * novos fica no cabeçalho (HeaderNotifications) e abre a mesma janela.
 * Os controles aparecem em Dashboard/Insights; o progresso acompanha todas as rotas.
 */
export default function InsightsActionBar() {
  const { pathname } = useLocation();

  // Rotas cujas métricas seguem o escopo do cabeçalho (o ScopeTag delas abre este seletor).
  const isScopeRoute =
    isMatch("/user/dashboard", pathname) ||
    isMatch("/user/ratings", pathname) ||
    isMatch("/user/questions", pathname) ||
    isMatch("/user/insights", pathname);

  const {
    isAnalyzingRaw,
    isRegeneratingInsights,
    rawStatus,
    insightsStatus,
    rawProgress,
    insightsProgress,
    pollingWarning,
    isGenerateDialogOpen,
    setGenerateDialogOpen,
  } = useInsightsControls();

  const isProcessing = isAnalyzingRaw || isRegeneratingInsights || rawStatus === 'running' || insightsStatus === 'running';
  const progress = isAnalyzingRaw ? rawProgress : insightsProgress;

  // Aviso de IA lenta: depois de 40s processando, recomenda trocar de modelo.
  const [slowNoticeEnabled, setSlowNoticeEnabled] = useIaSlowNoticePreference();
  const [slow, setSlow] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [slowAttempt, setSlowAttempt] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setSlow(false);
      setSwitchOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), IA_SLOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [isProcessing, slowAttempt]);

  const handleModelChanged = () => {
    setSwitchOpen(false);
    setSlow(false);
    setSlowAttempt((value) => value + 1);
  };

  return (
    <>
      {(isScopeRoute || isProcessing) && <div className="relative z-20 mb-5 flex w-full max-w-full flex-wrap items-center gap-3 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-3">
        {isScopeRoute && <>
        <InsightsControlsBar />
        </>}

        {isProcessing && <p role="status" className="text-xs text-(--text-secondary)">
          {pollingWarning ? 'Reconectando ao progresso...' : isAnalyzingRaw ? 'Analisando feedbacks em segundo plano' : 'Escrevendo o resumo dos comentários em segundo plano'}
          {progress && progress.total > 0 ? ` (${progress.done}/${progress.total})` : ''}
        </p>}

        <div className="sm:ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setGenerateDialogOpen(true)}
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
                <span>Analisar comentários com IA</span>
              </>
            )}
          </button>
        </div>
      </div>}

      {isProcessing && slow && slowNoticeEnabled && (
        <div role="status" className="-mt-3 mb-5 space-y-3 rounded-xl border border-(--primary-color)/20 bg-(--primary-color)/8 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-(--text-secondary)">
              A IA está demorando mais que o normal. Trocar de modelo costuma resolver.
            </p>
            <div className="sm:ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSwitchOpen((open) => !open)}
                aria-expanded={switchOpen}
                className="rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3 py-1.5 text-xs font-semibold text-(--primary-color) hover:bg-(--primary-color)/18"
              >
                Trocar modelo
              </button>
              <button
                type="button"
                onClick={() => setSlowNoticeEnabled(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-(--text-tertiary) hover:text-(--text-primary)"
              >
                Não recomendar de novo
              </button>
            </div>
          </div>
          {switchOpen && <IaModelQuickSwitch onChanged={handleModelChanged} />}
        </div>
      )}

      <GenerateInsightsDialog
        open={isGenerateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      />
    </>
  );
}


