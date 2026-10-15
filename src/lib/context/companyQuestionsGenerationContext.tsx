import { createContext, useContext, type ReactNode } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import { useToast } from "components/public/forms/messages/useToast";
import { useOnboarding } from "src/lib/context/onboardingContext";
import {
  getCompanyQuestionsFailureNotice,
  useCompanyQuestionsGeneration,
  type CompanyQuestionsGenerationState,
} from "src/lib/hooks/useCompanyQuestionsGeneration";

const CompanyQuestionsGenerationContext = createContext<CompanyQuestionsGenerationState | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useCompanyQuestionsGenerationState() {
  const context = useContext(CompanyQuestionsGenerationContext);
  if (!context) {
    throw new Error("useCompanyQuestionsGenerationState deve ser usado dentro de CompanyQuestionsGenerationProvider");
  }
  return context;
}

/** Só a fase, sem exigir o provider (telas que apenas mostram um aviso). */
// eslint-disable-next-line react-refresh/only-export-components
export function useCompanyQuestionsGenerationPhase() {
  return useContext(CompanyQuestionsGenerationContext)?.phase ?? "idle";
}

/**
 * Compartilha o andamento da geração das perguntas com a tela de configuração
 * inicial e com a página de perguntas. Fora da tela de configuração, avisa o
 * fim por toast; com a tela aberta, ela mesma mostra o resultado.
 */
export function CompanyQuestionsGenerationProvider({
  enabled,
  refreshKey,
  model,
  children,
}: {
  enabled: boolean;
  refreshKey: unknown;
  model: string | null;
  children: ReactNode;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { isInitialSetupRunning } = useOnboarding();

  const state = useCompanyQuestionsGeneration({
    enabled,
    refreshKey,
    onCompleted: (applied) => {
      revalidator.revalidate();
      if (applied && !isInitialSetupRunning) {
        toast.success("Perguntas personalizadas!", "A IA criou as perguntas do seu formulário. Você pode editá-las em Configurar perguntas.");
      }
    },
    onFailed: (errorCode) => {
      if (isInitialSetupRunning) return;
      const notice = getCompanyQuestionsFailureNotice(errorCode, model);
      toast.warning(notice.title, notice.description, notice.actionLabel
        ? { actionLabel: notice.actionLabel, onAction: () => navigate("/user/edit/ia-settings"), duration: 12000 }
        : { duration: 8000 });
    },
  });

  return (
    <CompanyQuestionsGenerationContext.Provider value={state}>
      {children}
    </CompanyQuestionsGenerationContext.Provider>
  );
}
