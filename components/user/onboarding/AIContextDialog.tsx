import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import type { IaSettingsActionResult } from "src/routes/actions/actionIaSettings";
import type { IaConfigResponse } from "src/services/serviceIaConfig";
import { INTENT_SAVE_IA_CONFIG, INTENT_UPDATE_IA_MODEL } from "src/lib/constants/routes/intents";
import { useIaModels } from "src/hooks/useIaModels";
import { useToast } from "components/public/forms/messages/useToast";
import { SelectNative } from "components/ui/select";
import HelpHint from "components/user/shared/HelpHint";
import {
  FaWandMagicSparkles,
  FaCheck,
  FaChevronLeft,
  FaXmark,
  FaCircleInfo,
  FaShieldHalved,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";
import type { AIContextDialogProps } from "./ui.types";

const CONTEXT_STEPS = [
  {
    key: "business_summary",
    tab: "1. Resumo do Negócio",
    title: "Resumo do Negócio",
    hint: "Descreva o que sua empresa faz e para quem. É o contexto primário que a IA usa em todas as análises.",
    aiImpact: "Com base neste texto, a IA compreende sua área de atuação e ajusta o tom dos diagnósticos aos seus produtos e serviços.",
    placeholder:
      "Ex: Rede de clínicas odontológicas focada em tratamentos estéticos e ortodontia de alta tecnologia.",
  },
  {
    key: "company_objective",
    tab: "2. Objetivo da Empresa",
    title: "Objetivo da Empresa",
    hint: "Seu foco estratégico atual. A IA priorizará pontos alinhados a esta meta.",
    aiImpact: "A IA prioriza a filtragem dos pontos fortes e fracos alinhados aos seus objetivos estratégicos.",
    placeholder:
      "Ex: Oferecer a melhor experiência de atendimento e aumentar a fidelização de clientes.",
  },
  {
    key: "analytics_goal",
    tab: "3. Objetivo Analítico",
    title: "Objetivo Analítico",
    hint: "O que você deseja descobrir investigando os feedbacks recebidos.",
    aiImpact: "Direciona as perguntas e padrões específicos que a inteligência artificial buscará identificar nas avaliações.",
    placeholder:
      "Ex: Identificar os principais motivos de reclamação no atendimento presencial e pós-venda.",
  },
] as const;

const LLM_STEP_INDEX = CONTEXT_STEPS.length;
const TOTAL_STEPS = CONTEXT_STEPS.length + 1;
const EMPTY_IA_CONFIG: IaConfigResponse = {
  hasKey: false,
  provider: null,
  model: null,
  keyHint: null,
};

export default function AIContextDialog({
  open,
  onOpenChange,
  isMandatory = false,
}: AIContextDialogProps) {
  const routeData = useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
    iaConfig?: IaConfigResponse | null;
  } | undefined;
  const collecting = routeData?.collecting ?? null;
  const collectingFetcher = useFetcher<ActionData>();
  const iaFetcher = useFetcher<IaSettingsActionResult>();
  const toast = useToast();
  const [values, setValues] = useState<Record<(typeof CONTEXT_STEPS)[number]["key"], string>>(() => ({
    business_summary: collecting?.business_summary ?? "",
    company_objective: collecting?.company_objective ?? "",
    analytics_goal: collecting?.analytics_goal ?? "",
  }));
  const [iaConfig, setIaConfig] = useState<IaConfigResponse | null>(routeData?.iaConfig ?? null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [step, setStep] = useState(0);
  const [saveContextAfterLlm, setSaveContextAfterLlm] = useState(false);
  const lastCollectingResult = useRef<ActionData | undefined>(undefined);
  const lastIaResult = useRef<IaSettingsActionResult | undefined>(undefined);
  const { catalog, loading: isLoadingModels, error: modelsError, reload: reloadModels } = useIaModels(
    iaConfig ?? EMPTY_IA_CONFIG,
    open && step === LLM_STEP_INDEX && Boolean(iaConfig),
  );

  const isSaving = collectingFetcher.state !== "idle" || iaFetcher.state !== "idle";
  const models = catalog?.models ?? [];
  const selectedModel = selectedModelId || iaConfig?.model || "";
  const selectedModelIsAvailable = models.some((model) => model.id === selectedModel);
  const isLlmConfigured = Boolean(iaConfig?.hasKey && iaConfig.model);
  const needsLlmUpdate = Boolean(
    iaConfig && (!isLlmConfigured || (selectedModelId && selectedModelId !== iaConfig.model)),
  );

  useEffect(() => {
    if (collecting) {
      setValues({
        business_summary: collecting.business_summary ?? "",
        company_objective: collecting.company_objective ?? "",
        analytics_goal: collecting.analytics_goal ?? "",
      });
    }
  }, [collecting]);

  useEffect(() => {
    setIaConfig(routeData?.iaConfig ?? null);
  }, [routeData?.iaConfig]);

  const setValue = (key: keyof typeof values, value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const submitContext = useCallback(() => {
    const formData = new FormData();
    formData.set("business_summary", values.business_summary);
    formData.set("company_objective", values.company_objective);
    formData.set("analytics_goal", values.analytics_goal);
    collectingFetcher.submit(formData, {
      method: "post",
      action: "/user/edit/collecting-data-enterprise",
    });
  }, [collectingFetcher, values]);

  useEffect(() => {
    const data = collectingFetcher.data;
    if (!data || lastCollectingResult.current === data) return;
    lastCollectingResult.current = data;

    if (data.ok) {
      toast.success(
        "Configurações de IA salvas!",
        "O contexto e a LLM foram configurados para suas análises.",
      );
      onOpenChange(false);
      return;
    }

    toast.error("Erro ao salvar informações", data.message || "Tente novamente em instantes.");
  }, [collectingFetcher.data, onOpenChange, toast]);

  useEffect(() => {
    const data = iaFetcher.data;
    if (!data || lastIaResult.current === data) return;
    lastIaResult.current = data;

    if (!data.ok || !data.iaConfig) {
      setSaveContextAfterLlm(false);
      toast.error("Erro na configuração da LLM", data.message || "Tente novamente em instantes.");
      return;
    }

    setIaConfig(data.iaConfig);
    setApiKey("");
    setShowApiKey(false);

    if (saveContextAfterLlm) {
      setSaveContextAfterLlm(false);
      submitContext();
    }
  }, [iaFetcher.data, saveContextAfterLlm, submitContext, toast]);

  if (!open) return null;

  const isLast = step === TOTAL_STEPS - 1;
  const hasCompleteContext =
    values.business_summary.trim().length > 0 &&
    values.company_objective.trim().length > 0 &&
    values.analytics_goal.trim().length > 0;
  const canConfigureLlm = Boolean(
    iaConfig &&
      (isLlmConfigured ||
        (selectedModelIsAvailable && (iaConfig.hasKey || apiKey.trim().length > 0))),
  );
  const isFormValid = hasCompleteContext && canConfigureLlm;

  const handleBackdropClick = () => {
    if (!isMandatory) onOpenChange(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || !iaConfig || isSaving) return;

    if (!needsLlmUpdate) {
      submitContext();
      return;
    }

    const formData = new FormData();
    formData.set(
      "intent",
      iaConfig.hasKey ? INTENT_UPDATE_IA_MODEL : INTENT_SAVE_IA_CONFIG,
    );
    formData.set("model", selectedModel);

    if (!iaConfig.hasKey) {
      formData.set("provider", "openrouter");
      formData.set("apiKey", apiKey.trim());
    }

    setSaveContextAfterLlm(true);
    iaFetcher.submit(formData, { method: "post", action: "/user/edit/ia-settings" });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-context-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-(--primary-color)/30 bg-(--bg-secondary) p-5 shadow-2xl transition-all duration-300 sm:p-7"
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-(--primary-color)/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-(--secondary-color)/12 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between border-b border-(--quaternary-color)/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30">
              <FaWandMagicSparkles className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-context-dialog-title" className="font-montserrat text-lg font-bold text-(--text-primary)">
                  Contexto e configuração de IA
                </h3>
                {isMandatory && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    <FaShieldHalved className="text-[9px]" />
                    Obrigatório
                  </span>
                )}
              </div>
              <p className="text-xs text-(--text-tertiary)">
                Passo {step + 1} de {TOTAL_STEPS} — Complete o contexto e escolha a LLM da empresa
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
              className="rounded-xl p-2 text-(--text-tertiary) transition-colors hover:bg-(--seventh-color) hover:text-(--text-primary)"
            >
              <FaXmark className="text-lg" />
            </button>
          )}
        </div>

        <div className="relative z-10 my-5 grid gap-2 sm:grid-cols-2">
          {CONTEXT_STEPS.map((stepItem, index) => {
            const filled = values[stepItem.key].trim().length > 0;
            const active = index === step;

            return (
              <button
                key={stepItem.key}
                type="button"
                onClick={() => setStep(index)}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? "border-(--primary-color)/50 bg-(--primary-color)/12 ring-1 ring-(--primary-color)/30"
                    : "border-(--quaternary-color)/12 bg-(--seventh-color)/40 hover:border-(--primary-color)/25"
                }`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  active
                    ? "bg-(--primary-color) text-(--bg-primary)"
                    : filled
                      ? "bg-(--primary-color)/20 text-(--primary-color)"
                      : "bg-(--seventh-color) text-(--text-tertiary)"
                }`}>
                  {filled && !active ? <FaCheck className="text-[9px]" /> : index + 1}
                </span>
                <span className={`text-xs font-semibold ${active ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>
                  {stepItem.tab}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setStep(LLM_STEP_INDEX)}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
              step === LLM_STEP_INDEX
                ? "border-(--primary-color)/50 bg-(--primary-color)/12 ring-1 ring-(--primary-color)/30"
                : "border-(--quaternary-color)/12 bg-(--seventh-color)/40 hover:border-(--primary-color)/25"
            }`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              step === LLM_STEP_INDEX
                ? "bg-(--primary-color) text-(--bg-primary)"
                : isLlmConfigured
                  ? "bg-(--primary-color)/20 text-(--primary-color)"
                  : "bg-(--seventh-color) text-(--text-tertiary)"
            }`}>
              {isLlmConfigured && step !== LLM_STEP_INDEX ? <FaCheck className="text-[9px]" /> : "4"}
            </span>
            <span className={`text-xs font-semibold ${step === LLM_STEP_INDEX ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>
              4. Modelo LLM
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4" aria-busy={isSaving}>
          {CONTEXT_STEPS.map((stepItem, index) => (
            <div key={stepItem.key} className={index === step ? "block space-y-3" : "hidden"}>
              <div>
                <h4 className="flex items-center gap-1.5 font-montserrat text-base font-bold text-(--text-primary)">
                  <span>{stepItem.title}</span>
                  <HelpHint topic="aiContextFields" />
                </h4>
                <p className="mt-1 text-xs text-(--text-secondary)">{stepItem.hint}</p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-(--primary-color)/20 bg-(--seventh-color)/40 p-3 text-xs text-(--text-secondary)">
                <FaCircleInfo className="mt-0.5 shrink-0 text-(--primary-color)" />
                <span>
                  <strong className="text-(--text-primary)">Como a IA usará: </strong>
                  {stepItem.aiImpact}
                </span>
              </div>

              <div className="space-y-1.5">
                <textarea
                  id={stepItem.key}
                  name={stepItem.key}
                  value={values[stepItem.key]}
                  onChange={(event) => setValue(stepItem.key, event.target.value)}
                  rows={6}
                  className="min-h-[170px] w-full resize-y rounded-2xl border border-(--primary-color)/20 bg-(--seventh-color) p-4 text-sm leading-relaxed text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
                  placeholder={stepItem.placeholder}
                />
                <div className="flex items-center justify-between px-1 text-xs text-(--text-tertiary)">
                  <span>
                    {values[stepItem.key].trim().length === 0 ? (
                      <span className="font-medium text-amber-400">Campo obrigatório</span>
                    ) : (
                      <span className="font-medium text-emerald-400">Pronto</span>
                    )}
                  </span>
                  <span>{values[stepItem.key].length} caracteres</span>
                </div>
              </div>
            </div>
          ))}

          {step === LLM_STEP_INDEX && (
            <div className="space-y-4">
              <div>
                <h4 className="flex items-center gap-1.5 font-montserrat text-base font-bold text-(--text-primary)">
                  Configure a LLM da empresa
                  <HelpHint topic="aiContextFields" />
                </h4>
                <p className="mt-1 text-xs text-(--text-secondary)">
                  Escolha o modelo que analisará os feedbacks. Uma chave OpenRouter e um modelo são necessários para concluir esta etapa.
                </p>
              </div>

              {iaConfig ? (
                <>
                  {iaConfig.hasKey ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-xs text-(--text-secondary)">
                      <strong className="text-emerald-400">Chave OpenRouter configurada.</strong> Escolha ou atualize o modelo LLM sem informar a chave novamente.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label htmlFor="onboarding-api-key" className="flex items-center gap-2 text-sm font-medium text-(--text-primary)">
                          <FaKey className="text-xs text-(--primary-color)" />
                          Chave da API OpenRouter
                        </label>
                        <a
                          href="https://openrouter.ai/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-(--primary-color) hover:underline"
                        >
                          Obter chave
                          <FaArrowUpRightFromSquare className="text-[10px]" />
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          id="onboarding-api-key"
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(event) => setApiKey(event.target.value)}
                          placeholder="sk-or-v1-..."
                          autoComplete="off"
                          className="h-12 w-full rounded-xl border border-(--quaternary-color)/20 bg-(--seventh-color) px-4 pr-12 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey((current) => !current)}
                          aria-label={showApiKey ? "Ocultar chave" : "Mostrar chave"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--text-tertiary) transition-colors hover:text-(--text-primary)"
                        >
                          {showApiKey ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-(--text-tertiary)">A chave é armazenada com criptografia e validada antes de ser salva.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="onboarding-model" className="block text-sm font-medium text-(--text-primary)">Modelo LLM</label>
                    <SelectNative
                      id="onboarding-model"
                      value={selectedModel}
                      onChange={(event) => setSelectedModelId(event.target.value)}
                      disabled={isLoadingModels || models.length === 0 || isSaving}
                      aria-describedby="onboarding-model-status"
                    >
                      <option value="" disabled>{isLoadingModels ? "Carregando modelos..." : "Selecione um modelo"}</option>
                      {iaConfig.model && !selectedModelIsAvailable && (
                        <option value={iaConfig.model}>{iaConfig.model} — modelo atual</option>
                      )}
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.isAutomatic ? "Roteamento automático" : model.name} ({model.id})
                        </option>
                      ))}
                    </SelectNative>
                    <div id="onboarding-model-status" role="status" className="space-y-1 text-xs text-(--text-tertiary)">
                      {isLoadingModels && <p>Carregando modelos compatíveis...</p>}
                      {modelsError && <p className="text-amber-400">{modelsError}</p>}
                      {!isLoadingModels && catalog && models.length === 0 && <p className="text-amber-400">Nenhum modelo compatível está disponível. Atualize a lista ou confira a chave.</p>}
                      {selectedModel && selectedModelIsAvailable && <p className="text-emerald-400">Modelo selecionado e pronto para salvar.</p>}
                    </div>
                    <button type="button" onClick={reloadModels} disabled={isLoadingModels || isSaving} className="text-xs font-medium text-(--primary-color) hover:underline disabled:opacity-50">
                      Atualizar modelos
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs text-(--text-secondary)">
                  <p>Não foi possível carregar a configuração atual da LLM.</p>
                  <button type="button" onClick={() => window.location.reload()} className="mt-2 font-semibold text-(--primary-color) hover:underline">Tentar novamente</button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-(--quaternary-color)/10 pt-4">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || isSaving}
              className="btn-ghost font-poppins flex items-center gap-1.5 px-4 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FaChevronLeft className="text-[10px]" />
              Anterior
            </button>

            {isLast ? (
              <button
                type="submit"
                disabled={!isFormValid || isSaving}
                className="btn-primary font-poppins px-7 py-2.5 text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Salvando configurações..." : "Salvar e concluir"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1))}
                disabled={isSaving}
                className="btn-primary font-poppins flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold shadow-md disabled:opacity-50"
              >
                <span>Próximo Passo</span>
              </button>
            )}
          </div>
        </form>

        {isSaving && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl border border-(--quaternary-color)/12 bg-(--bg-primary)/40 backdrop-blur-[2px]">
            <span className="animate-pulse text-sm font-semibold text-(--primary-color)">Salvando configurações de IA...</span>
          </div>
        )}
      </div>
    </div>
  );
}
