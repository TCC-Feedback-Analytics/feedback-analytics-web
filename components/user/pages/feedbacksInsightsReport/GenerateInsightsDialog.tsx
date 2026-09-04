import {
  FaWandMagicSparkles,
  FaChartLine,
  FaXmark,
  FaCheck,
  FaBuilding,
  FaBoxArchive,
  FaHandshake,
  FaSitemap,
  FaCircleInfo,
  FaArrowRight,
  FaSpinner,
  FaLayerGroup,
} from "react-icons/fa6";
import { useInsightsControls } from "src/lib/context/insightsControls";
import { useScopedPendingCount } from "src/lib/hooks/useScopedPendingCount";
import { useScopedInsightsReport } from "src/lib/hooks/useScopedInsightsReport";
import { getCatalogKindByKind } from "src/lib/constants/catalog";
import type { GenerateInsightsDialogProps, InsightScopeOption } from "./ui.types";

const MIN_FEEDBACKS_TO_ANALYZE = 10;

function getScopeInfo(scope: InsightScopeOption, catalogItemId: string, catalogItemOptions: Array<{ id: string; name: string; kind: string }>) {
  if (scope === "COMPANY") {
    return {
      title: "Empresa Toda (Visão Geral)",
      icon: FaBuilding,
      badge: "Geral",
    };
  }

  const catalogConfig = getCatalogKindByKind(scope);
  const selectedItem = catalogItemOptions.find((item) => item.id === catalogItemId && item.kind === scope);
  const itemName = selectedItem?.name || "Item não selecionado";

  let icon = FaLayerGroup;
  if (scope === "PRODUCT") icon = FaBoxArchive;
  if (scope === "SERVICE") icon = FaHandshake;
  if (scope === "DEPARTMENT") icon = FaSitemap;

  return {
    title: `${catalogConfig?.singular ? catalogConfig.singular.charAt(0).toUpperCase() + catalogConfig.singular.slice(1) : "Item"}: ${itemName}`,
    icon,
    badge: catalogConfig?.singular || "Catálogo",
  };
}

export default function GenerateInsightsDialog({
  open,
  onOpenChange,
}: GenerateInsightsDialogProps) {
  const {
    scope,
    catalogItemId,
    catalogItemOptions,
    canAnalyze,
    analyzeRaw,
    regenerateInsights,
    isAnalyzingRaw,
    isRegeneratingInsights,
    rawProgress,
    insightsProgress,
    rawStatus,
    insightsStatus,
    rawError,
    insightsError,
    activeJob,
    pollingWarning,
    operationStatus,
    operationError,
    operationScope,
  } = useInsightsControls();

  const { pendingCount, totalFeedbacks, totalAnalyzed, latestAnalysisAt, loading } =
    useScopedPendingCount(open);
  const { report } = useScopedInsightsReport();

  // O backend encadeia as etapas; este componente apenas acompanha o job.
  const isProcessing = isAnalyzingRaw || isRegeneratingInsights || rawStatus === "running" || insightsStatus === "running";
  const operationMatchesScope = !operationScope || operationScope.scopeType === scope && (operationScope.catalogItemId ?? "") === catalogItemId;
  const lastStatus = operationStatus ?? (insightsStatus !== 'idle' ? insightsStatus : rawStatus);
  const autoStage = isProcessing ? (isAnalyzingRaw ? "ANALYZING" : "GENERATING")
    : !operationMatchesScope ? "IDLE" : lastStatus === "failed" ? "FAILED"
    : lastStatus === "succeeded" ? "COMPLETED" : "IDLE";
  const flowError = operationStatus ? operationError : insightsError || rawError;
  const sameScope = !activeJob || activeJob.scopeType === scope && (activeJob.catalogItemId ?? "") === catalogItemId;

  if (!open) return null;

  const scopeInfo = getScopeInfo(activeJob?.scopeType ?? scope, activeJob?.catalogItemId ?? catalogItemId, catalogItemOptions);
  const ScopeIcon = scopeInfo.icon;
  const missingItem = scope !== "COMPANY" && !catalogItemId;
  const belowMinimum = totalFeedbacks < MIN_FEEDBACKS_TO_ANALYZE;
  const nothingNewToAnalyze = pendingCount === 0;

  const baseDisabled = loading || isProcessing || missingItem || !canAnalyze;
  const analyzeDisabled = baseDisabled || belowMinimum || nothingNewToAnalyze;

  const hasAnalysis = totalAnalyzed > 0;
  const reportTime = report?.updatedAt ? Date.parse(report.updatedAt) : NaN;
  const analysisTime = latestAnalysisAt ? Date.parse(latestAnalysisAt) : NaN;
  const insightsUpToDate =
    !Number.isNaN(reportTime) &&
    !Number.isNaN(analysisTime) &&
    reportTime >= analysisTime;

  // Um clique explícito pode refazer um relatório já atualizado. Isso permite
  // aplicar uma nova versão do prompt/sintetizador sem criar feedback artificial.
  const generateDisabled = baseDisabled || !hasAnalysis;

  // Botão unificado habilitado se houver algo para analisar OU gerar
  const unifiedDisabled = baseDisabled || (analyzeDisabled && generateDisabled);

  const handleStartUnifiedFlow = () => {
    if (unifiedDisabled) return;
    // Uma submissão durável para analisar pendentes + produzir relatório.
    regenerateInsights({ analyzePending: true, ...(insightsUpToDate ? { force: true } : {}) });
  };
  const handleBackdropClick = () => onOpenChange(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-insights-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-(--primary-color)/30 bg-(--bg-secondary) p-6 sm:p-8 shadow-2xl transition-all duration-300"
      >
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-(--primary-color)/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-(--secondary-color)/15 blur-3xl" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-(--quaternary-color)/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30">
              <FaWandMagicSparkles className="text-lg" />
            </div>
            <h3
              id="generate-insights-dialog-title"
              className="font-montserrat text-lg font-bold text-(--text-primary)"
            >
              Gerar Insights com IA
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="rounded-xl p-2 text-(--text-tertiary) hover:bg-(--seventh-color) hover:text-(--text-primary) transition-colors disabled:opacity-40"
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {/* Banner do Escopo Selecionado (Design Limpo) */}
        <div className="relative z-10 my-4 rounded-2xl border border-(--primary-color)/25 bg-linear-to-r from-(--primary-color)/10 via-(--seventh-color)/60 to-(--secondary-color)/10 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--primary-color) text-(--bg-primary)">
              <ScopeIcon className="text-base" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-(--primary-color)">
                  Escopo Selecionado
                </span>
                <span className="rounded-full bg-(--primary-color)/20 px-2 py-0.5 text-[10px] font-semibold text-(--primary-color)">
                  {scopeInfo.badge}
                </span>
              </div>
              <h4 className="font-montserrat text-base font-bold text-(--text-primary) truncate mt-0.5">
                {scopeInfo.title}
              </h4>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div role="status" className="relative z-10 mb-4 text-xs text-(--text-secondary)">
            {pollingWarning ? "Sem conexão para consultar o progresso. Tentando reconectar; o job continua no servidor."
              : activeJob?.status === "waiting_budget" ? "Aguardando a cota da IA. A retomada será automática."
              : "Processando em segundo plano. Você pode fechar esta janela e continuar navegando."}
          </div>
        )}

        {/* Alerta de Item Não Selecionado */}
        {missingItem && (
          <div className="relative z-10 mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
            <FaCircleInfo className="shrink-0 text-base" />
            <span>Selecione um item do catálogo no topo da página para este escopo.</span>
          </div>
        )}

        {/* Métricas do Escopo */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5 mb-5">
          <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color)/40 p-3 text-center">
            <span className="text-[11px] text-(--text-tertiary) block font-medium">Novos Feedbacks</span>
            <span className="font-montserrat text-lg font-bold text-(--text-primary)">
              {sameScope ? pendingCount : "—"}
            </span>
          </div>
          <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color)/40 p-3 text-center">
            <span className="text-[11px] text-(--text-tertiary) block font-medium">Já Analisados</span>
            <span className="font-montserrat text-lg font-bold text-(--text-primary)">
              {sameScope ? totalAnalyzed : "—"}
            </span>
          </div>
          <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color)/40 p-3 text-center">
            <span className="text-[11px] text-(--text-tertiary) block font-medium">Total no Escopo</span>
            <span className="font-montserrat text-lg font-bold text-(--text-primary)">
              {sameScope ? totalFeedbacks : "—"}
            </span>
          </div>
        </div>

        {/* Tracker das 2 Etapas do Pipeline */}
        <div className="relative z-10 space-y-2.5 mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Etapas do Processamento
          </span>

          {/* Passo 1: Analisar Feedbacks */}
          <div className={`flex items-center justify-between rounded-xl border px-3.5 py-3 transition-all ${
            isAnalyzingRaw || autoStage === "ANALYZING"
              ? "border-(--primary-color)/50 bg-(--primary-color)/10 ring-1 ring-(--primary-color)/30"
              : "border-(--quaternary-color)/12 bg-(--seventh-color)/30"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isAnalyzingRaw ? "bg-(--primary-color) text-(--bg-primary)" : "bg-(--seventh-color) text-(--text-secondary)"
              }`}>
                {isAnalyzingRaw ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : nothingNewToAnalyze && hasAnalysis ? (
                  <FaCheck className="text-xs text-emerald-400" />
                ) : (
                  <FaWandMagicSparkles className="text-xs" />
                )}
              </div>
              <div>
                <h5 className="text-xs font-bold text-(--text-primary)">1. Analisar novos feedbacks</h5>
                {isAnalyzingRaw && rawProgress && rawProgress.total > 0 && (
                  <p className="text-[11px] text-(--primary-color) font-medium">
                    Processando {rawProgress.done} de {rawProgress.total}...
                  </p>
                )}
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              isAnalyzingRaw
                ? "bg-(--primary-color)/20 text-(--primary-color)"
                : nothingNewToAnalyze && hasAnalysis
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-(--seventh-color) text-(--text-tertiary)"
            }`}>
              {isAnalyzingRaw ? "Em progresso" : nothingNewToAnalyze && hasAnalysis ? "Concluído" : "Aguardando"}
            </span>
          </div>

          {/* Passo 2: Gerar Síntese de Insights */}
          <div className={`flex items-center justify-between rounded-xl border px-3.5 py-3 transition-all ${
            isRegeneratingInsights || autoStage === "GENERATING"
              ? "border-(--primary-color)/50 bg-(--primary-color)/10 ring-1 ring-(--primary-color)/30"
              : "border-(--quaternary-color)/12 bg-(--seventh-color)/30"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isRegeneratingInsights ? "bg-(--primary-color) text-(--bg-primary)" : "bg-(--seventh-color) text-(--text-secondary)"
              }`}>
                {isRegeneratingInsights ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : insightsUpToDate ? (
                  <FaCheck className="text-xs text-emerald-400" />
                ) : (
                  <FaChartLine className="text-xs" />
                )}
              </div>
              <div>
                <h5 className="text-xs font-bold text-(--text-primary)">2. Sintetizar Relatório de IA</h5>
                {isRegeneratingInsights && insightsProgress && insightsProgress.total > 0 && (
                  <p className="text-[11px] text-(--primary-color) font-medium">
                    Gerando relatório ({insightsProgress.done} de {insightsProgress.total})...
                  </p>
                )}
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              isRegeneratingInsights
                ? "bg-(--primary-color)/20 text-(--primary-color)"
                : insightsUpToDate
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-(--seventh-color) text-(--text-tertiary)"
            }`}>
              {isRegeneratingInsights ? "Em progresso" : insightsUpToDate ? "Atualizado" : "Aguardando"}
            </span>
          </div>
        </div>

        {/* Feedback de Conclusão */}
        {autoStage === "FAILED" && (
          <div role="alert" className="relative z-10 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <p className="font-semibold">Processamento interrompido</p>
            <p className="mt-1">{flowError}</p>
          </div>
        )}
        {autoStage === "COMPLETED" && (
          <div className="relative z-10 mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCheck className="text-base shrink-0" />
              <span>Processamento de IA concluído com sucesso!</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="font-bold underline ml-2"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Botão Principal Unificado */}
        <div className="relative z-10 space-y-3 border-t border-(--quaternary-color)/10 pt-4">
          <button
            type="button"
            onClick={handleStartUnifiedFlow}
            disabled={unifiedDisabled}
            className="btn-primary font-poppins w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Processando IA...</span>
              </>
            ) : autoStage === "COMPLETED" && unifiedDisabled ? (
              <>
                <FaCheck className="text-sm" />
                <span>Processamento Concluído</span>
              </>
            ) : (
              <>
                <FaWandMagicSparkles className="text-sm" />
                <span>Processar e Gerar Insights com IA</span>
                <FaArrowRight className="text-[10px] ml-1" />
              </>
            )}
          </button>

          {/* Opções Individuais (Ações Avançadas Discretas) */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={analyzeRaw}
              disabled={analyzeDisabled}
              title={belowMinimum ? `Mínimo de ${MIN_FEEDBACKS_TO_ANALYZE} feedbacks` : nothingNewToAnalyze ? "Nenhum feedback novo" : undefined}
              className="text-xs font-medium text-(--text-secondary) hover:text-(--text-primary) hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              Apenas Analisar
            </button>
            <span className="text-(--quaternary-color)/40 text-xs">•</span>
            <button
              type="button"
              onClick={() => regenerateInsights(insightsUpToDate ? { force: true } : undefined)}
              disabled={generateDisabled}
              title={!hasAnalysis ? "Sem análises prévias" : insightsUpToDate ? "Gerar novamente usando as análises atuais" : undefined}
              className="text-xs font-medium text-(--text-secondary) hover:text-(--text-primary) hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              Apenas Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

