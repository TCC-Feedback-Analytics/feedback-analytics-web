import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import { useEffect, useState, useCallback, type ChangeEvent } from "react";
import { Link, useFetcher, useRouteLoaderData } from "react-router-dom";
import { useToast } from "components/public/forms/messages/useToast";
import { useDirtyTracker } from "src/lib/hooks/useDirtyTracker";
import FieldUsesCompanyProducts from "./fields/fieldUsesCompanyProducts";
import { FaWandMagicSparkles, FaUser, FaArrowRight } from "react-icons/fa6";

export default function FormCollectingDataEnterprise() {
  const { collecting } = useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
  };

  const fetcher = useFetcher();
  const toast = useToast();
  const isSaving = fetcher.state === "submitting";

  const [scopeValues, setScopeValues] = useState(() => ({
    uses_company_products: collecting?.uses_company_products ?? true,
    uses_company_services: collecting?.uses_company_services ?? false,
    uses_company_departments: collecting?.uses_company_departments ?? false,
  }));

  const { isDirty, markPristine } = useDirtyTracker(scopeValues);

  useEffect(() => {
    const data = fetcher.data as ActionData | undefined;
    if (!data) return;

    if (data.ok) {
      toast.success(
        "Escopo atualizado!",
        "Configurações de escopo da operação salvas com sucesso.",
      );
      markPristine();
    } else {
      toast.error(
        "Erro ao salvar escopo",
        data.message || "Tente novamente em instantes.",
      );
    }
  }, [fetcher.data, toast, markPristine]);

  const handleCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = event.target;
      setScopeValues((prev) => ({ ...prev, [name]: checked }));
    },
    [],
  );

  return (
    <div className="relative w-full space-y-6">
      {/* Banner Informativo sobre Contexto de IA no Perfil */}
      <div className="rounded-2xl border border-(--primary-color)/25 bg-gradient-to-r from-(--sixth-color) to-(--seventh-color) p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30">
              <FaWandMagicSparkles className="text-lg" />
            </div>
            <div>
              <h3 className="font-montserrat text-sm font-bold text-(--text-primary)">
                Contexto de Inteligência Artificial
              </h3>
              <p className="mt-1 text-xs text-(--text-secondary) max-w-xl leading-relaxed">
                As 3 etapas do contexto de IA (Resumo do Negócio, Objetivo da Empresa e Objetivo Analítico) foram movidas para a página de **Perfil**. Você pode visualizá-las e editá-las a qualquer momento por lá via Dialog.
              </p>
            </div>
          </div>

          <Link
            to="/user/profile"
            className="btn-primary font-poppins shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition-transform hover:scale-[1.02]"
          >
            <FaUser className="text-[11px]" />
            <span>Ir para o Perfil</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>

      {/* Formulário de Escopo Operacional da Empresa */}
      <fetcher.Form
        method="post"
        action="/user/edit/collecting-data-enterprise"
        className="space-y-6"
      >
        <FieldUsesCompanyProducts
          usesCompanyProducts={scopeValues.uses_company_products}
          usesCompanyServices={scopeValues.uses_company_services}
          usesCompanyDepartments={scopeValues.uses_company_departments}
          onChange={handleCheckboxChange}
        />

        <div className="flex justify-end border-t border-(--quaternary-color)/10 pt-5">
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="btn-primary font-poppins px-7 py-2.5 text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Salvando Escopo..." : "Salvar Configurações de Escopo"}
          </button>
        </div>
      </fetcher.Form>

      {isSaving && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/40 backdrop-blur-[1px] flex items-center justify-center">
          <span className="text-sm font-semibold text-(--primary-color) animate-pulse">
            Atualizando escopo operacional...
          </span>
        </div>
      )}
    </div>
  );
}
