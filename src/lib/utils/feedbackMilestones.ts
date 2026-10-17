/**
 * Marcos da coleta comemorados no Dashboard (fase 2 das boas-vindas): o primeiro
 * feedback da conta e os 10 feedbacks de um escopo, quando a IA já pode analisar.
 *
 * Só comemora o que a pessoa viu acontecer: o primeiro feedback exige ter visto a
 * conta zerada antes; os 10 de um escopo exigem ter visto esse escopo abaixo de 10.
 * Assim, contas que já tinham feedbacks não recebem comemorações atrasadas.
 */

export const MIN_FEEDBACKS_FOR_AI = 10;

export type FeedbackMilestone = 'first' | 'ai';

export type MilestoneState = {
  seenEmpty: boolean;
  firstCelebrated: boolean;
  /** Escopos vistos com menos de 10 feedbacks. */
  belowAi: string[];
  /** Escopos em que os 10 feedbacks já foram comemorados. */
  aiCelebrated: string[];
};

export type MilestoneSnapshot = {
  /** Feedbacks da conta inteira; null quando não foi possível consultar. */
  accountTotal: number | null;
  scopeKey: string;
  /** Feedbacks do escopo; null enquanto o escopo atual não foi carregado. */
  scopeTotal: number | null;
};

export const EMPTY_MILESTONES: MilestoneState = {
  seenEmpty: false,
  firstCelebrated: false,
  belowAi: [],
  aiCelebrated: [],
};

export function nextMilestones(
  state: MilestoneState,
  { accountTotal, scopeKey, scopeTotal }: MilestoneSnapshot,
): { state: MilestoneState; celebrate: FeedbackMilestone[] } {
  const next: MilestoneState = {
    ...state,
    belowAi: [...state.belowAi],
    aiCelebrated: [...state.aiCelebrated],
  };
  const celebrate: FeedbackMilestone[] = [];

  if (accountTotal === 0) next.seenEmpty = true;
  if (accountTotal !== null && accountTotal > 0 && next.seenEmpty && !next.firstCelebrated) {
    next.firstCelebrated = true;
    celebrate.push('first');
  }

  if (scopeTotal !== null) {
    if (scopeTotal < MIN_FEEDBACKS_FOR_AI) {
      if (!next.belowAi.includes(scopeKey)) next.belowAi.push(scopeKey);
    } else if (next.belowAi.includes(scopeKey) && !next.aiCelebrated.includes(scopeKey)) {
      next.aiCelebrated.push(scopeKey);
      celebrate.push('ai');
    }
  }

  return { state: next, celebrate };
}

const storageKey = (enterpriseId: string) => `feedback-analytics:marcos:${enterpriseId}`;

/** Lê o estado salvo no navegador; em qualquer falha, começa do zero. */
export function readMilestones(enterpriseId: string): MilestoneState {
  try {
    const raw = window.localStorage.getItem(storageKey(enterpriseId));
    if (!raw) return EMPTY_MILESTONES;
    const parsed = JSON.parse(raw) as Partial<MilestoneState>;
    return {
      seenEmpty: parsed.seenEmpty === true,
      firstCelebrated: parsed.firstCelebrated === true,
      belowAi: Array.isArray(parsed.belowAi) ? parsed.belowAi.filter((key) => typeof key === 'string') : [],
      aiCelebrated: Array.isArray(parsed.aiCelebrated) ? parsed.aiCelebrated.filter((key) => typeof key === 'string') : [],
    };
  } catch {
    return EMPTY_MILESTONES;
  }
}

export function saveMilestones(enterpriseId: string, state: MilestoneState): void {
  try {
    window.localStorage.setItem(storageKey(enterpriseId), JSON.stringify(state));
  } catch {
    // Sem armazenamento (aba anônima, bloqueio): só deixa de lembrar os marcos.
  }
}
