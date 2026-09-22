import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { IaConfigResponse } from "src/services/serviceIaConfig";
import {
  ServiceGetSystemGuide,
  ServiceUpdateSystemGuide,
  type SystemGuideResponse,
  type SystemGuideStatus,
} from "src/services/serviceSystemGuide";
import { TOUR_STEPS_COUNT, type OnboardingContextValue } from "./onboardingContext.types";

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding deve ser usado dentro de OnboardingProvider");
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
  collecting: CollectingDataEnterprise | null;
  iaConfig?: IaConfigResponse | null;
  /** Identifica a sessão apenas no estado local; nunca é enviado à API. */
  sessionKey: string;
}

export function OnboardingProvider({ children, collecting, iaConfig = null, sessionKey }: OnboardingProviderProps) {

  const hasCompletedAIContext = Boolean(
    collecting &&
      String(collecting.business_summary ?? "").trim().length > 0 &&
      String(collecting.company_objective ?? "").trim().length > 0 &&
      String(collecting.analytics_goal ?? "").trim().length > 0,
  );
  const hasCompletedAISetup = hasCompletedAIContext && Boolean(iaConfig?.hasKey && iaConfig.model);

  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);
  const [guide, setGuide] = useState<SystemGuideResponse | null>(null);
  const [guideLoaded, setGuideLoaded] = useState(false);
  const [isTourSaving, setIsTourSaving] = useState(false);
  const [tourSaveError, setTourSaveError] = useState<string | null>(null);
  const requestEpoch = useRef(0);
  const currentSessionKey = useRef(sessionKey);
  const sessionChanged = currentSessionKey.current !== sessionKey;

  if (sessionChanged) {
    currentSessionKey.current = sessionKey;
    // Invalida imediatamente respostas pendentes antes mesmo do efeito de limpeza.
    requestEpoch.current += 1;
  }

  // A sessão pode mudar sem desmontar o layout. Cada troca invalida estado e
  // respostas anteriores para que um usuário nunca herde o tour de outro.
  useEffect(() => {
    const controller = new AbortController();
    const epoch = ++requestEpoch.current;

    setIsTourActive(false);
    setCurrentTourStep(0);
    setGuide(null);
    setGuideLoaded(false);
    setIsTourSaving(false);
    setTourSaveError(null);

    void ServiceGetSystemGuide(controller.signal)
      .then((response) => {
        if (requestEpoch.current !== epoch) return;
        setGuide(response);
        setGuideLoaded(true);
      })
      .catch(() => {
        // Não assumir pending em caso de falha: o restante da aplicação segue utilizável.
        if (requestEpoch.current !== epoch) return;
        setGuideLoaded(true);
      });

    return () => controller.abort();
  }, [sessionKey]);

  // Abre automaticamente somente depois da leitura bem-sucedida do estado remoto.
  useEffect(() => {
    if (guideLoaded && guide?.status === "pending" && hasCompletedAISetup) {
      setIsTourActive(true);
    }
  }, [guide, guideLoaded, hasCompletedAISetup]);

  const startTour = () => {
    setCurrentTourStep(0);
    setTourSaveError(null);
    setIsTourActive(true);
  };

  const persistTourStatus = async (status: Extract<SystemGuideStatus, "completed" | "skipped">) => {
    if (!guide || isTourSaving) {
      if (!guide) {
        setTourSaveError("O estado do guia não foi carregado. Recarregue a página e tente novamente.");
      }
      return;
    }

    const epoch = requestEpoch.current;
    setIsTourSaving(true);
    setTourSaveError(null);

    try {
      const response = await ServiceUpdateSystemGuide({ version: guide.version, status });
      if (requestEpoch.current !== epoch) return;
      setGuide(response);
      setIsTourActive(false);
    } catch {
      if (requestEpoch.current !== epoch) return;
      setTourSaveError("Não foi possível salvar o guia. Tente novamente.");
    } finally {
      if (requestEpoch.current === epoch) {
        setIsTourSaving(false);
      }
    }
  };

  const completeTour = () => persistTourStatus("completed");
  const skipTour = () => persistTourStatus("skipped");

  const nextTourStep = () => {
    if (currentTourStep < TOUR_STEPS_COUNT - 1) {
      setCurrentTourStep((prev) => prev + 1);
    } else {
      void completeTour();
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < TOUR_STEPS_COUNT) {
      setCurrentTourStep(step);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isTourActive: sessionChanged ? false : isTourActive,
        currentTourStep,
        isTourSaving: sessionChanged ? false : isTourSaving,
        hasCompletedAIContext,
        hasCompletedAISetup,
        isTourDismissed: !sessionChanged && guide ? guide.status !== "pending" : false,
        tourSaveError: sessionChanged ? null : tourSaveError,
        startTour,
        completeTour,
        skipTour,
        nextTourStep,
        prevTourStep,
        goToStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
