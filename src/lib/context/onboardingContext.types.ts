export interface OnboardingContextValue {
  isTourActive: boolean;
  isTourSaving: boolean;
  currentTourStep: number;
  hasCompletedAIContext: boolean;
  hasCompletedAISetup: boolean;
  isTourDismissed: boolean;
  tourSaveError: string | null;
  startTour: () => void;
  completeTour: () => Promise<void>;
  skipTour: () => Promise<void>;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToStep: (step: number) => void;
}

export const TOUR_STEPS_COUNT = 7;
