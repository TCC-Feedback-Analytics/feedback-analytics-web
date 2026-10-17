/**
 * Convite do guia do sistema (o guia não abre sozinho). O Dashboard convida:
 * - no primeiro feedback da conta (vale o servidor: conta com 1 ou mais feedbacks);
 * - sem feedback, só numa PRÓXIMA sessão do navegador, nunca logo após o cadastro.
 * "Depois" adia: volta numa próxima sessão e, depois de 2 adiamentos, para de perguntar
 * (o guia segue no menu da conta). O guia continua "pendente" no servidor.
 */

export const MAX_GUIDE_POSTPONES = 2;

export type GuideInviteVariant = 'first-feedback' | 'later';

export type GuideInviteState = {
  /** Sessão em que a conta foi vista pela primeira vez com o guia pendente. */
  firstSessionId: string | null;
  postponed: number;
  /** Sessão em que o convite já foi mostrado (não repete na mesma sessão). */
  lastOfferSessionId: string | null;
};

export const EMPTY_GUIDE_INVITE: GuideInviteState = { firstSessionId: null, postponed: 0, lastOfferSessionId: null };

/** Decide se oferece o guia agora; devolve também o estado a salvar. */
export function nextGuideInvite(
  state: GuideInviteState,
  { sessionId, hasFeedback }: { sessionId: string; hasFeedback: boolean },
): { offer: GuideInviteVariant | null; state: GuideInviteState } {
  const firstSessionId = state.firstSessionId ?? sessionId;
  const next = { ...state, firstSessionId };
  if (state.postponed >= MAX_GUIDE_POSTPONES || state.lastOfferSessionId === sessionId) {
    return { offer: null, state: next };
  }
  if (hasFeedback) return { offer: 'first-feedback', state: next };
  if (firstSessionId !== sessionId) return { offer: 'later', state: next };
  return { offer: null, state: next };
}

/** Marca o convite como mostrado nesta sessão; `postponed` conta um "Depois". */
export function markGuideInvite(state: GuideInviteState, sessionId: string, postponed: boolean): GuideInviteState {
  return {
    ...state,
    lastOfferSessionId: sessionId,
    postponed: postponed ? state.postponed + 1 : state.postponed,
  };
}

const SESSION_KEY = 'feedback-analytics:sessao';
const storageKey = (enterpriseId: string) => `feedback-analytics:convite-guia:${enterpriseId}`;

/** Id desta sessão do navegador (sessionStorage); muda ao abrir o app de novo. */
export function currentBrowserSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Sem armazenamento: cada carregamento conta como a mesma sessão.
    return 'sem-sessao';
  }
}

export function readGuideInvite(enterpriseId: string): GuideInviteState {
  try {
    const raw = window.localStorage.getItem(storageKey(enterpriseId));
    if (!raw) return EMPTY_GUIDE_INVITE;
    const parsed = JSON.parse(raw) as Partial<GuideInviteState>;
    return {
      firstSessionId: typeof parsed.firstSessionId === 'string' ? parsed.firstSessionId : null,
      postponed: typeof parsed.postponed === 'number' && parsed.postponed >= 0 ? parsed.postponed : 0,
      lastOfferSessionId: typeof parsed.lastOfferSessionId === 'string' ? parsed.lastOfferSessionId : null,
    };
  } catch {
    return EMPTY_GUIDE_INVITE;
  }
}

export function saveGuideInvite(enterpriseId: string, state: GuideInviteState): void {
  try {
    window.localStorage.setItem(storageKey(enterpriseId), JSON.stringify(state));
  } catch {
    // Sem armazenamento: o convite só deixa de lembrar os adiamentos.
  }
}
