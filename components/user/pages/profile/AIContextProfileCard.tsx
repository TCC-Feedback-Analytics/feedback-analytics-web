import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { IaConfigResponse } from "src/services/serviceIaConfig";
import AIContextDialog from "components/user/onboarding/AIContextDialog";
import { FaWandMagicSparkles, FaPen, FaCircleCheck, FaTriangleExclamation, FaKey } from "react-icons/fa6";

export default function AIContextProfileCard() {
  const { collecting, iaConfig } = (useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
    iaConfig?: IaConfigResponse | null;
  }) || { collecting: null, iaConfig: null };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const businessSummary = collecting?.business_summary?.trim() || "";
  const companyObjective = collecting?.company_objective?.trim() || "";
  const analyticsGoal = collecting?.analytics_goal?.trim() || "";

  const hasCompleteContext =
    businessSummary.length > 0 &&
    companyObjective.length > 0 &&
    analyticsGoal.length > 0;
  const hasConfiguredLlm = Boolean(iaConfig?.hasKey && iaConfig.model);
  const isComplete = hasCompleteContext && hasConfiguredLlm;

  return (
    <div className="font-work-sans rounded-2xl border border-(--quaternary-color)/12 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6 shadow-md transition-all duration-200 hover:border-(--quaternary-color)/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-(--quaternary-color)/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30 shadow-inner">
            <FaWandMagicSparkles className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-montserrat text-base font-bold text-(--text-primary)">
                Contexto e LLM da empresa
              </h3>
              {isComplete ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <FaCircleCheck className="text-[10px]" />
                  Configurado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
                  <FaTriangleExclamation className="text-[10px]" />
                  Incompleto
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-(--text-tertiary)">
              Contexto estratégico e modelo que orientam as análises e diagnósticos da IA.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="btn-primary font-poppins shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md transition-all duration-200 hover:scale-[1.02]"
        >
          <FaPen className="text-[10px]" />
          <span>Editar contexto e LLM</span>
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color)/40 p-4">
          <span className="text-[11px] font-semibold text-(--primary-color) uppercase tracking-wider">
            1. Resumo do Negócio
          </span>
          <p className="mt-2 text-xs leading-relaxed text-(--text-secondary) line-clamp-3">
            {businessSummary || <span className="italic text-(--text-tertiary)">Não preenchido</span>}
          </p>
        </div>

        <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color)/40 p-4">
          <span className="text-[11px] font-semibold text-(--primary-color) uppercase tracking-wider">
            2. Objetivo da Empresa
          </span>
          <p className="mt-2 text-xs leading-relaxed text-(--text-secondary) line-clamp-3">
            {companyObjective || <span className="italic text-(--text-tertiary)">Não preenchido</span>}
          </p>
        </div>

        <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color)/40 p-4">
          <span className="text-[11px] font-semibold text-(--primary-color) uppercase tracking-wider">
            3. Objetivo Analítico
          </span>
          <p className="mt-2 text-xs leading-relaxed text-(--text-secondary) line-clamp-3">
            {analyticsGoal || <span className="italic text-(--text-tertiary)">Não preenchido</span>}
          </p>
        </div>

        <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color)/40 p-4">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-(--primary-color)">
            <FaKey className="text-[10px]" />
            4. Modelo LLM
          </span>
          <p className="mt-2 text-xs leading-relaxed text-(--text-secondary) line-clamp-3">
            {hasConfiguredLlm
              ? `${iaConfig?.provider || "OpenRouter"} • ${iaConfig?.model}`
              : <span className="italic text-(--text-tertiary)">Chave e modelo não configurados</span>}
          </p>
        </div>
      </div>

      {/* Dialog Reutilizável em Modo de Edição Livre */}
      <AIContextDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isMandatory={false}
      />
    </div>
  );
}
