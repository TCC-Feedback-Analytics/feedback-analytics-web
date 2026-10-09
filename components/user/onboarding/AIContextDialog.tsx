import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import type { IaSettingsActionResult } from "src/routes/actions/actionIaSettings";
import type { IaConfigResponse } from "src/services/serviceIaConfig";
import { INTENT_SAVE_IA_CONFIG, INTENT_UPDATE_IA_MODEL } from "src/lib/constants/routes/intents";
import { useIaModels } from "src/hooks/useIaModels";
import { useToast } from "components/public/forms/messages/useToast";
import { Select, type SelectOption } from "components/ui/select";
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
    tab: "Resumo do Negócio",
    title: "Resumo do Negócio",
    hint: "Descreva o que sua empresa faz e para quem. É o contexto primário que a IA usa em todas as análises.",
    aiImpact: "Com base neste texto, a IA compreende sua área de atuação e ajusta o tom dos diagnósticos aos seus produtos e serviços.",
    placeholder:
      "Ex: Rede de clínicas odontológicas focada em tratamentos estéticos e ortodontia de alta tecnologia.",
  },
  {
    key: "company_objective",
    tab: "Objetivo da Empresa",
    title: "Objetivo da Empresa",
    hint: "Seu foco estratégico atual. A IA priorizará pontos alinhados a esta meta.",
    aiImpact: "A IA prioriza a filtragem dos pontos fortes e fracos alinhados aos seus objetivos estratégicos.",
    placeholder:
      "Ex: Oferecer a melhor experiência de atendimento e aumentar a fidelização de clientes.",
  },
  {
    key: "analytics_goal",
    tab: "Objetivo Analítico",
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

const getContextValues = (collecting: CollectingDataEnterprise | null | undefined) => ({
  business_summary: collecting?.business_summary ?? "",
  company_objective: collecting?.company_objective ?? "",
  analytics_goal: collecting?.analytics_goal ?? "",
});

const areContextValuesEqual = (
  first: ReturnType<typeof getContextValues>,
  second: ReturnType<typeof getContextValues>,
) => (
  first.business_summary === second.business_summary &&
  first.company_objective === second.company_objective &&
  first.analytics_goal === second.analytics_goal
);

export default function AIContextDialog({
  open,
  onOpenChange,
  isMandatory = false,
  closeOnlyAfterSave = false,
}: AIContextDialogProps) {
  const routeData = useRouteLoaderData("user") as {
    user?: { id?: string | null };
    collecting: CollectingDataEnterprise | null;
    iaConfig?: IaConfigResponse | null;
  } | undefined;
  const collecting = routeData?.collecting ?? null;
  const sessionKey = routeData?.user?.id ?? null;
  const collectingFetcher = useFetcher<ActionData>();
  const iaFetcher = useFetcher<IaSettingsActionResult>();
  const toast = useToast();
  const [values, setValues] = useState(() => getContextValues(collecting));
  const [iaConfig, setIaConfig] = useState<IaConfigResponse | null>(routeData?.iaConfig ?? null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [step, setStep] = useState(0);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const serverValuesRef = useRef(getContextValues(collecting));
  const lastCollectingResult = useRef<ActionData | undefined>(undefined);
  const lastIaResult = useRef<IaSettingsActionResult | undefined>(undefined);
  const contextSubmitPendingRef = useRef(false);
  const iaSubmitPendingRef = useRef(false);
  const allowCloseRef = useRef(false);
  const isIaStep = step === LLM_STEP_INDEX;
  const { catalog, loading: isLoadingModels, error: modelsError, reload: reloadModels } = useIaModels(
    iaConfig ?? EMPTY_IA_CONFIG,
    open && isIaStep && Boolean(iaConfig),
  );

  useLayoutEffect(() => {
    if (open && dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0;
    }
  }, [open, step]);

  // O layout permanece montado durante a troca de sessão. Limpar aqui evita
  // que outro usuário veja, ainda que por um render, a etapa ou a chave da
  // sessão anterior.
  useLayoutEffect(() => {
    const nextValues = getContextValues(collecting);
    serverValuesRef.current = nextValues;
    setValues(nextValues);
    setIaConfig(routeData?.iaConfig ?? null);
    setApiKey("");
    setShowApiKey(false);
    setSelectedModelId("");
    setStep(0);
    contextSubmitPendingRef.current = false;
    iaSubmitPendingRef.current = false;
    allowCloseRef.current = false;
    lastCollectingResult.current = collectingFetcher.data;
    lastIaResult.current = iaFetcher.data;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  const isSaving = collectingFetcher.state !== "idle" || iaFetcher.state !== "idle";
  const models = catalog?.models ?? [];
  const modelOptions: SelectOption<string>[] = [
    ...(iaConfig?.model && !models.some((model) => model.id === iaConfig.model)
      ? [{
          value: iaConfig.model,
          label: `${iaConfig.model} — modelo atual indisponível`,
          disabled: true,
        }]
      : []),
    ...models.map((model) => ({
      value: model.id,
      label: `${model.isAutomatic ? "Roteamento automático" : model.name} (${model.id})`,
    })),
  ];
  const selectedModel = selectedModelId || iaConfig?.model || "";
  const selectedModelIsAvailable = models.some((model) => model.id === selectedModel);
  const isLlmConfigured = Boolean(iaConfig?.hasKey && iaConfig.model);
  const needsLlmUpdate = Boolean(
    iaConfig && (!isLlmConfigured || (selectedModelId && selectedModelId !== iaConfig.model)),
  );

  const hasCompleteContext =
    values.business_summary.trim().length > 0 &&
    values.company_objective.trim().length > 0 &&
    values.analytics_goal.trim().length > 0;
  const activeContextStep = isIaStep ? null : CONTEXT_STEPS[step];
  const canAdvanceFromCurrentContextStep = Boolean(
    !isIaStep && activeContextStep && values[activeContextStep.key].trim().length > 0,
  );
  const canConfigureLlm = Boolean(
    iaConfig &&
      (isLlmConfigured ||
        (selectedModelIsAvailable && (iaConfig.hasKey || apiKey.trim().length > 0))),
  );

  useEffect(() => {
    const nextServerValues = getContextValues(collecting);

    setValues((currentValues) => {
      const hasUnsavedChanges = !areContextValuesEqual(currentValues, serverValuesRef.current);
      serverValuesRef.current = nextServerValues;

      // Revalidações causadas por outras ações (como salvar a IA) podem trazer
      // o snapshot antigo do servidor. Nesse caso, a edição local é a fonte
      // correta até que o usuário salve o contexto.
      return hasUnsavedChanges ? currentValues : nextServerValues;
    });
  }, [collecting]);

  useEffect(() => {
    setIaConfig(routeData?.iaConfig ?? null);
  }, [routeData?.iaConfig]);

  const setValue = (key: keyof typeof values, value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const submitContext = useCallback(() => {
    contextSubmitPendingRef.current = true;
    const formData = new FormData();
    formData.set("business_summary", values.business_summary);
    formData.set("company_objective", values.company_objective);
    formData.set("analytics_goal", values.analytics_goal);
    collectingFetcher.submit(formData, {
      method: "post",
      action: "/user/edit/collecting-data-enterprise",
    });
  }, [collectingFetcher, values]);

  const requestClose = useCallback(() => {
    if (closeOnlyAfterSave && !allowCloseRef.current) return;

    allowCloseRef.current = false;
    onOpenChange(false);
  }, [closeOnlyAfterSave, onOpenChange]);

  useEffect(() => {
    const data = collectingFetcher.data;
    if (!data || lastCollectingResult.current === data) return;
    lastCollectingResult.current = data;

    const wasExplicitlySubmitted = contextSubmitPendingRef.current;
    contextSubmitPendingRef.current = false;

    if (data.ok) {
      toast.success(
        "Contexto salvo!",
        "As informações da sua empresa foram salvas e o onboarding foi concluído.",
      );
      if (wasExplicitlySubmitted) {
        allowCloseRef.current = true;
        requestClose();
      }
      return;
    }

    toast.error("Erro ao salvar informações", data.message || "Tente novamente em instantes.");
  }, [collectingFetcher.data, requestClose, toast]);

  useEffect(() => {
    const data = iaFetcher.data;
    if (!data || lastIaResult.current === data) return;
    lastIaResult.current = data;

    const wasExplicitlySubmitted = iaSubmitPendingRef.current;
    iaSubmitPendingRef.current = false;

    // Uma revalidação pode conservar o último resultado do fetcher. Ele não
    // deve navegar o dialog por conta própria; somente a ação atual do usuário
    // em "Configurar agora" pode avançar para o contexto.
    if (!wasExplicitlySubmitted) return;

    if (!data.ok || !data.iaConfig) {
      toast.error("Erro na configuração da LLM", data.message || "Tente novamente em instantes.");
      return;
    }

    setIaConfig(data.iaConfig);
    setApiKey("");
    setShowApiKey(false);
    setSelectedModelId("");
    toast.success("IA configurada!", "Agora complete o contexto da sua empresa.");
    submitContext();
  }, [iaFetcher.data, submitContext, toast]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (!isMandatory && !closeOnlyAfterSave) requestClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    if (isIaStep) {
      if (!hasCompleteContext) {
        toast.error("Complete os campos obrigatórios", "Preencha os três campos do contexto da empresa.");
        return;
      }

      if (!iaConfig || !canConfigureLlm || !needsLlmUpdate) {
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

      iaSubmitPendingRef.current = true;
      iaFetcher.submit(formData, { method: "post", action: "/user/edit/ia-settings" });
      return;
    }

    setStep((current) => Math.min(LLM_STEP_INDEX, current + 1));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-context-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black/70 p-4 backdrop-blur-md transition-opacity duration-300 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative h-fit min-h-0 min-w-[min(100%,20rem)] w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-hidden rounded-3xl border border-(--primary-color)/30 bg-(--bg-secondary) p-0 shadow-2xl transition-all duration-300 sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-(--primary-color)/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-(--secondary-color)/12 blur-3xl" />

        <div ref={dialogContentRef} className="relative z-10 min-h-0 max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-4 sm:max-h-[calc(100dvh-3rem)] sm:p-7">
        <div className="relative z-10 flex min-w-0 items-start justify-between gap-3 border-b border-(--quaternary-color)/10 pb-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30">
              <FaWandMagicSparkles className="text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="ai-context-dialog-title" className="min-w-0 break-words font-montserrat text-lg font-bold text-(--text-primary)">
                  Contexto e configuração de IA
                </h3>
                {isMandatory && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    <FaShieldHalved className="text-[9px]" />
                    Obrigatório
                  </span>
                )}
              </div>
              <p className="break-words text-xs text-(--text-tertiary)">
                Passo {step + 1} de {TOTAL_STEPS} — A IA é opcional; o contexto da empresa é obrigatório
              </p>
            </div>
          </div>

          {!isMandatory && !closeOnlyAfterSave && (
            <button
              type="button"
              onClick={requestClose}
              aria-label="Fechar"
              className="shrink-0 rounded-xl p-2 text-(--text-tertiary) transition-colors hover:bg-(--seventh-color) hover:text-(--text-primary)"
            >
              <FaXmark className="text-lg" />
            </button>
          )}
        </div>

        <div className="relative z-10 my-5 grid min-w-0 gap-2 sm:grid-cols-2">
          {CONTEXT_STEPS.map((stepItem, index) => {
            const contextStep = index;
            const filled = values[stepItem.key].trim().length > 0;
            const active = contextStep === step;

            return (
              <button
                key={stepItem.key}
                type="button"
                onClick={() => setStep(contextStep)}
                aria-label={`${contextStep + 1}. ${stepItem.tab}`}
                className={`flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
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
                  {filled && !active ? <FaCheck className="text-[9px]" /> : contextStep + 1}
                </span>
                <span className={`min-w-0 break-words text-xs font-semibold ${active ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>
                  {stepItem.tab}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setStep(LLM_STEP_INDEX)}
            aria-label="4. Modelo LLM"
            className={`flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
              isIaStep
                ? "border-(--primary-color)/50 bg-(--primary-color)/12 ring-1 ring-(--primary-color)/30"
                : "border-(--quaternary-color)/12 bg-(--seventh-color)/40 hover:border-(--primary-color)/25"
            }`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              isIaStep
                ? "bg-(--primary-color) text-(--bg-primary)"
                : isLlmConfigured
                  ? "bg-(--primary-color)/20 text-(--primary-color)"
                  : "bg-(--seventh-color) text-(--text-tertiary)"
            }`}>
              {!isIaStep && isLlmConfigured ? <FaCheck className="text-[9px]" /> : "4"}
            </span>
            <span className={`min-w-0 break-words text-xs font-semibold ${isIaStep ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>
              Modelo LLM
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="relative z-10 min-w-0 space-y-4" aria-busy={isSaving}>
          {isIaStep && (
            <div className="space-y-4">
              <div>
                <h4 className="flex flex-wrap items-center gap-1.5 font-montserrat text-base font-bold text-(--text-primary)">
                  Configure a IA da empresa <span className="text-xs font-normal text-(--text-tertiary)">(opcional)</span>
                  <HelpHint topic="aiContextFields" />
                </h4>
                <p className="mt-1 break-words text-xs text-(--text-secondary)">
                  Escolha a chave e o modelo que serão usados nas análises. Com a IA configurada, criamos automaticamente as 3 perguntas do seu feedback geral a partir do contexto da empresa. Você também pode salvar o contexto e configurar a IA depois no seu perfil.
                </p>
              </div>

              {iaConfig ? (
                <>
                  {iaConfig.hasKey ? (
                    <div className="min-w-0 break-words rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-xs text-(--text-secondary)">
                      <strong className="text-emerald-400">Chave OpenRouter configurada.</strong> Escolha ou atualize o modelo sem informar a chave novamente.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label htmlFor="onboarding-api-key" className="flex min-w-0 items-center gap-2 text-sm font-medium text-(--text-primary)">
                          <FaKey className="text-xs text-(--primary-color)" />
                          Chave da API OpenRouter
                        </label>
                        <a
                          href="https://openrouter.ai/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-(--primary-color) hover:underline"
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
                          className="h-12 w-full min-w-0 rounded-xl border border-(--quaternary-color)/20 bg-(--seventh-color) px-4 pr-12 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
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
                    <Select
                      id="onboarding-model"
                      value={selectedModel}
                      onChange={setSelectedModelId}
                      options={modelOptions}
                      placeholder={isLoadingModels ? "Carregando modelos..." : "Selecione um modelo"}
                      disabled={isLoadingModels || models.length === 0 || isSaving}
                      aria-describedby="onboarding-model-status"
                      searchable
                      searchLabel="Buscar modelo"
                      searchPlaceholder="Busque pelo nome ou identificador"
                      emptyMessage="Nenhum modelo encontrado."
                      noResultsMessage="Nenhum modelo corresponde à busca."
                      dropdownClassName="border-(--primary-color)/25 shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                    />
                    <div id="onboarding-model-status" role="status" className="min-w-0 space-y-1 break-words text-xs text-(--text-tertiary)">
                      {isLoadingModels && <p>Carregando modelos compatíveis...</p>}
                      {modelsError && <p className="text-amber-400">{modelsError}</p>}
                      {!isLoadingModels && catalog && models.length === 0 && <p className="text-amber-400">Nenhum modelo compatível está disponível. Você ainda pode continuar sem configurar a IA.</p>}
                      {selectedModel && selectedModelIsAvailable && <p className="text-emerald-400">Modelo selecionado e pronto para salvar.</p>}
                    </div>
                    <button type="button" onClick={reloadModels} disabled={isLoadingModels || isSaving} className="text-xs font-medium text-(--primary-color) hover:underline disabled:opacity-50">
                      Atualizar modelos
                    </button>
                  </div>
                </>
              ) : (
                <div className="min-w-0 break-words rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs text-(--text-secondary)">
                  <p>Não foi possível carregar a configuração atual da IA. Você pode continuar sem configurar e retomar pelo perfil.</p>
                  <button type="button" onClick={() => window.location.reload()} className="mt-2 font-semibold text-(--primary-color) hover:underline">Tentar novamente</button>
                </div>
              )}
            </div>
          )}

          {CONTEXT_STEPS.map((stepItem, index) => {
            const contextStep = index;
            return (
              <div key={stepItem.key} className={contextStep === step ? "block space-y-3" : "hidden"}>
                <div>
                  <h4 className="flex flex-wrap items-center gap-1.5 font-montserrat text-base font-bold text-(--text-primary)">
                    <span>{stepItem.title}</span>
                    <HelpHint topic="aiContextFields" />
                  </h4>
                  <p className="mt-1 break-words text-xs text-(--text-secondary)">{stepItem.hint}</p>
                </div>

                <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-(--primary-color)/20 bg-(--seventh-color)/40 p-3 text-xs text-(--text-secondary)">
                  <FaCircleInfo className="mt-0.5 shrink-0 text-(--primary-color)" />
                  <span className="min-w-0 break-words">
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
                    aria-required="true"
                    className="min-h-[170px] w-full min-w-0 resize-none rounded-2xl border border-(--primary-color)/20 bg-(--seventh-color) p-4 text-sm leading-relaxed text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
                    placeholder={stepItem.placeholder}
                  />
              <div className="flex min-w-0 items-center justify-between gap-3 px-1 text-xs text-(--text-tertiary)">
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
            );
          })}

          <div className="flex min-w-0 flex-col items-stretch gap-3 border-t border-(--quaternary-color)/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || isSaving}
              className="btn-ghost font-poppins flex h-[50px] shrink-0 items-center justify-center gap-1 self-start px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-30 sm:self-auto"
            >
              <FaChevronLeft className="text-[10px]" />
              Anterior
            </button>

            {isIaStep ? (
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <button
                  type="button"
                  onClick={submitContext}
                  disabled={!hasCompleteContext || isSaving}
                  className="btn-ghost font-poppins h-[50px] w-full max-w-full whitespace-normal px-4 text-center text-xs font-semibold disabled:opacity-50 sm:w-auto"
                >
                  Salvar sem configurar IA
                </button>
                <button
                  type="submit"
                  disabled={
                    !hasCompleteContext ||
                    isSaving ||
                    Boolean(iaConfig && needsLlmUpdate && !canConfigureLlm)
                  }
                  className="btn-primary font-poppins w-full max-w-full whitespace-normal px-6 py-2.5 text-center text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isSaving
                    ? "Salvando..."
                    : iaConfig && needsLlmUpdate
                      ? "Configurar IA e salvar"
                      : "Salvar e concluir"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!canAdvanceFromCurrentContextStep) return;
                  setStep((current) => Math.min(LLM_STEP_INDEX, current + 1));
                }}
                disabled={isSaving || !canAdvanceFromCurrentContextStep}
                className="btn-primary font-poppins flex w-full max-w-full items-center justify-center gap-1.5 whitespace-normal px-6 py-2.5 text-xs font-semibold shadow-md disabled:opacity-50 sm:w-auto"
              >
                <span>Próximo Passo</span>
              </button>
            )}
          </div>
        </form>
        </div>

        {isSaving && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl border border-(--quaternary-color)/12 bg-(--bg-primary)/40 backdrop-blur-[2px]">
            <span className="animate-pulse text-sm font-semibold text-(--primary-color)">Salvando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
