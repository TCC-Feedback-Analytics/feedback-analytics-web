/**
 * Rascunho da configuração inicial enquanto a pessoa vai ao OpenRouter e volta:
 * o contexto já digitado não pode se perder. sessionStorage (some ao fechar a
 * aba), preso ao usuário da sessão e de uso único.
 */
const STORAGE_KEY = 'feedback:onboarding-draft';
const MAX_AGE_MS = 30 * 60_000;

export type OnboardingDraftValues = {
  business_summary: string;
  company_objective: string;
  analytics_goal: string;
};

type StoredDraft = { sessionKey: string; values: OnboardingDraftValues; savedAt: number };

export function saveOnboardingDraft(sessionKey: string | null, values: OnboardingDraftValues): void {
  if (!sessionKey) return;
  try {
    const draft: StoredDraft = { sessionKey, values, savedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Sem storage, a pessoa só precisa digitar o contexto de novo.
  }
}

/** Lê e apaga o rascunho; `null` sem rascunho, de outro usuário ou vencido. */
export function takeOnboardingDraft(sessionKey: string | null, now = Date.now()): OnboardingDraftValues | null {
  if (!sessionKey) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const draft = JSON.parse(raw) as StoredDraft;
    if (draft.sessionKey !== sessionKey || now - Number(draft.savedAt) > MAX_AGE_MS) return null;
    const { business_summary, company_objective, analytics_goal } = draft.values ?? {};
    if ([business_summary, company_objective, analytics_goal].some((value) => typeof value !== 'string')) return null;
    return { business_summary, company_objective, analytics_goal };
  } catch {
    return null;
  }
}
