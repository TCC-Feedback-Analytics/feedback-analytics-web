import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";

const STORAGE_KEY = "feedback_onboarding_tour_seen";

export interface OnboardingContextValue {
  isTourActive: boolean;
  currentTourStep: number;
  hasCompletedAIContext: boolean;
  isTourDismissed: boolean;
  startTour: () => void;
  skipTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

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
}

export const TOUR_STEPS_COUNT = 4;

export function OnboardingProvider({ children, collecting }: OnboardingProviderProps) {
  const hasCompletedAIContext = Boolean(
    collecting &&
      String(collecting.business_summary ?? "").trim().length > 0 &&
      String(collecting.company_objective ?? "").trim().length > 0 &&
      String(collecting.analytics_goal ?? "").trim().length > 0,
  );

  const [isTourDismissed, setIsTourDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);

  // Inicia o tour automaticamente se o usuário nunca viu o tour nem recusou previamente
  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY) === "true";
      if (!seen) {
        setIsTourActive(true);
      }
    } catch {
      // Ignora falhas de localStorage se restrito
    }
  }, []);

  const startTour = () => {
    setCurrentTourStep(0);
    setIsTourActive(true);
  };

  const skipTour = () => {
    setIsTourActive(false);
    setIsTourDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignora falhas de localStorage
    }
  };

  const nextTourStep = () => {
    if (currentTourStep < TOUR_STEPS_COUNT - 1) {
      setCurrentTourStep((prev) => prev + 1);
    } else {
      skipTour(); // Conclui o tour
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
        isTourActive,
        currentTourStep,
        hasCompletedAIContext,
        isTourDismissed,
        startTour,
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
