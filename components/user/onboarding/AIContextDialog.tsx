import { useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import { useToast } from "components/public/forms/messages/useToast";
import HelpHint from "components/user/shared/HelpHint";
import {
  FaWandMagicSparkles,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaXmark,
  FaCircleInfo,
  FaShieldHalved,
} from "react-icons/fa6";

const STEPS = [
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

interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMandatory?: boolean;
}

function useCollectingData(): CollectingDataEnterprise | null {
  try {
    const data = useRouteLoaderData("user") as { collecting: CollectingDataEnterprise | null } | undefined;
    return data?.collecting ?? null;
  } catch {
    return null;
  }
}

export default function AIContextDialog({
  open,
  onOpenChange,
  isMandatory = false,
}: AIContextDialogProps) {
  const collecting = useCollectingData();

  let fetcher: ReturnType<typeof useFetcher>;
  try {
    fetcher = useFetcher();
  } catch {
    fetcher = { state: "idle", data: undefined, Form: (props: any) => <form {...props} />, submit: () => {} } as any;
  }
  if (!fetcher.Form) {
    fetcher = { ...fetcher, Form: (props: any) => <form {...props} /> };
  }

  const toast = useToast();
  const isSaving = fetcher.state === "submitting";

  const [values, setValues] = useState<
    Record<(typeof STEPS)[number]["key"], string>
  >(() => ({
    business_summary: collecting?.business_summary ?? "",
    company_objective: collecting?.company_objective ?? "",
    analytics_goal: collecting?.analytics_goal ?? "",
  }));
  const [step, setStep] = useState(0);

  // Sincroniza estado local quando o objeto collecting mudar no loader
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
    const data = fetcher.data as ActionData | undefined;
    if (!data) return;

    if (data.ok) {
      toast.success(
        "Configurações de IA salvas!",
        "Contexto atualizado com sucesso. As análises da IA foram liberadas.",
      );
      onOpenChange(false);
    } else {
      toast.error(
        "Erro ao salvar informações",
        data.message || "Tente novamente em instantes.",
      );
    }
  }, [fetcher.data, toast, onOpenChange]);

  if (!open) return null;

  const currentStepItem = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const setValue = (key: keyof typeof values, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleBackdropClick = () => {
    if (!isMandatory) {
      onOpenChange(false);
    }
  };

  const isFormValid =
    values.business_summary.trim().length > 0 &&
    values.company_objective.trim().length > 0 &&
    values.analytics_goal.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-context-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-(--primary-color)/30 bg-(--bg-secondary) p-6 sm:p-8 shadow-2xl transition-all duration-300"
      >
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-(--primary-color)/12 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-52 w-52 rounded-full bg-(--secondary-color)/12 blur-3xl" />

        {/* Topo do Dialog */}
        <div className="relative z-10 flex items-center justify-between border-b border-(--quaternary-color)/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30">
              <FaWandMagicSparkles className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="ai-context-dialog-title"
                  className="font-montserrat text-lg font-bold text-(--text-primary)"
                >
                  Contexto para Inteligência Artificial
                </h3>
                {isMandatory && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    <FaShieldHalved className="text-[9px]" />
                    Obrigatório
                  </span>
                )}
              </div>
              <p className="text-xs text-(--text-tertiary)">
                Passo {step + 1} de {STEPS.length} — Defina os parâmetros da sua empresa
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
              className="rounded-xl p-2 text-(--text-tertiary) hover:bg-(--seventh-color) hover:text-(--text-primary) transition-colors"
            >
              <FaXmark className="text-lg" />
            </button>
          )}
        </div>

        {/* Seletor visual dos 3 Passos (1 -> 2 -> 3) */}
        <div className="relative z-10 my-5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {STEPS.map((stepItem, index) => {
            const filled = values[stepItem.key].trim().length > 0;
            const active = index === step;

            return (
              <button
                key={stepItem.key}
                type="button"
                onClick={() => setStep(index)}
                className={`flex flex-1 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? "border-(--primary-color)/50 bg-(--primary-color)/12 ring-1 ring-(--primary-color)/30"
                    : "border-(--quaternary-color)/12 bg-(--seventh-color)/40 hover:border-(--primary-color)/25"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    active
                      ? "bg-(--primary-color) text-(--bg-primary)"
                      : filled
                        ? "bg-(--primary-color)/20 text-(--primary-color)"
                        : "bg-(--seventh-color) text-(--text-tertiary)"
                  }`}
                >
                  {filled && !active ? <FaCheck className="text-[9px]" /> : index + 1}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    active ? "text-(--text-primary)" : "text-(--text-secondary)"
                  }`}
                >
                  {stepItem.tab}
                </span>
              </button>
            );
          })}
        </div>

        {/* Formulário do Passo Ativo */}
        {(() => {
          const FormComponent = fetcher?.Form || "form";
          return (
            <FormComponent
              method="post"
              action="/user/edit/collecting-data-enterprise"
              className="relative z-10 space-y-4"
            >
          {/* Mantém todos os 3 campos renderizados (escondidos se não ativos) para submit único */}
          {STEPS.map((stepItem, index) => (
            <div
              key={stepItem.key}
              className={index === step ? "block space-y-3" : "hidden"}
            >
              <div>
                <h4 className="flex items-center gap-1.5 font-montserrat text-base font-bold text-(--text-primary)">
                  <span>{stepItem.title}</span>
                  <HelpHint topic="aiContextFields" />
                </h4>
                <p className="mt-1 text-xs text-(--text-secondary)">{stepItem.hint}</p>
              </div>

              {/* Dica de uso da IA */}
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
                  onChange={(e) => setValue(stepItem.key, e.target.value)}
                  rows={6}
                  className="min-h-[170px] w-full resize-y rounded-2xl border border-(--primary-color)/20 bg-(--seventh-color) p-4 text-sm leading-relaxed text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
                  placeholder={stepItem.placeholder}
                />
                <div className="flex items-center justify-between text-xs text-(--text-tertiary) px-1">
                  <span>
                    {values[stepItem.key].trim().length === 0 ? (
                      <span className="text-amber-400 font-medium">Campo obrigatório</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Pronto</span>
                    )}
                  </span>
                  <span>{values[stepItem.key].length} caracteres</span>
                </div>
              </div>
            </div>
          ))}

          {/* Rodapé com Navegação */}
          <div className="flex items-center justify-between border-t border-(--quaternary-color)/10 pt-4">
            <button
              type="button"
              onClick={() => setStep((curr) => Math.max(0, curr - 1))}
              disabled={step === 0}
              className="btn-ghost font-poppins flex items-center gap-1.5 px-4 py-2 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="text-[10px]" />
              Anterior
            </button>

            {isLast ? (
              <button
                key="submit-ai-context"
                type="submit"
                disabled={!isFormValid || isSaving}
                className="btn-primary font-poppins px-7 py-2.5 text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Salvar e Ativar IA..." : "Salvar e Concluir"}
              </button>
            ) : (
              <button
                key="next-ai-context-step"
                type="button"
                onClick={() => setStep((curr) => Math.min(STEPS.length - 1, curr + 1))}
                className="btn-primary font-poppins flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold shadow-md"
              >
                <span>Próximo Passo</span>
              </button>
            )}
          </div>
        </FormComponent>
      );
    })()}

        {isSaving && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl border border-(--quaternary-color)/12 bg-(--bg-primary)/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-sm font-semibold text-(--primary-color) animate-pulse">
              Atualizando contexto de IA...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
