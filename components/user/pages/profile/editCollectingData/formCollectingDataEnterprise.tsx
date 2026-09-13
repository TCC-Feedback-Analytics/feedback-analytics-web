import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import { useEffect, useState, useCallback, type ChangeEvent } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import { useToast } from "components/public/forms/messages/useToast";
import { useDirtyTracker } from "src/lib/hooks/useDirtyTracker";
import FieldUsesCompanyProducts from "./fields/fieldUsesCompanyProducts";

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
    <div className="relative w-full">
      <fetcher.Form
        method="post"
        action="/user/edit/collecting-data-enterprise"
        className="space-y-5"
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
