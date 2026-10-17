export interface OnboardingContextValue {
  isTourActive: boolean;
  isTourSaving: boolean;
  currentTourStep: number;
  hasCompletedAIContext: boolean;
  hasConfiguredAI: boolean;
  hasCompletedAISetup: boolean;
  isTourDismissed: boolean;
  tourSaveError: string | null;
  /** A configuração inicial está em andamento (onboarding ou tela "Preparando sua conta"). */
  isInitialSetupRunning: boolean;
  setInitialSetupRunning: (running: boolean) => void;
  /** O usuário saiu da configuração inicial para a Configuração de IA: o tour espera. */
  isTourDeferred: boolean;
  setTourDeferred: (deferred: boolean) => void;
  startTour: () => void;
  /** Resolve true quando o servidor gravou o status do guia. */
  completeTour: () => Promise<boolean>;
  skipTour: () => Promise<boolean>;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToStep: (step: number) => void;
}

export const TOUR_STEPS_COUNT = 11;
