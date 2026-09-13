export interface OnboardingContextValue {
  isTourActive: boolean;
  currentTourStep: number;
  hasCompletedAIContext: boolean;
  hasCompletedAISetup: boolean;
  isTourDismissed: boolean;
  startTour: () => void;
  skipTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToStep: (step: number) => void;
}

export const TOUR_STEPS_COUNT = 7;
