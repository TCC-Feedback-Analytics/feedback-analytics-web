import { describe, it, expect, beforeEach } from 'vitest';
import {
  EMPTY_GUIDE_INVITE,
  MAX_GUIDE_POSTPONES,
  currentBrowserSessionId,
  markGuideInvite,
  nextGuideInvite,
  readGuideInvite,
  saveGuideInvite,
} from './guideInvite';

describe('nextGuideInvite', () => {
  it('com feedback, convida já na primeira sessão', () => {
    expect(nextGuideInvite(EMPTY_GUIDE_INVITE, { sessionId: 's1', hasFeedback: true }).offer).toBe('first-feedback');
  });

  it('sem feedback, guarda a primeira sessão e só convida numa próxima', () => {
    const first = nextGuideInvite(EMPTY_GUIDE_INVITE, { sessionId: 's1', hasFeedback: false });
    expect(first.offer).toBeNull();
    expect(first.state.firstSessionId).toBe('s1');
    expect(nextGuideInvite(first.state, { sessionId: 's1', hasFeedback: false }).offer).toBeNull();
    expect(nextGuideInvite(first.state, { sessionId: 's2', hasFeedback: false }).offer).toBe('later');
  });

  it('não repete na mesma sessão e para depois de 2 adiamentos', () => {
    let state = markGuideInvite({ ...EMPTY_GUIDE_INVITE, firstSessionId: 's1' }, 's1', true);
    expect(nextGuideInvite(state, { sessionId: 's1', hasFeedback: true }).offer).toBeNull();
    expect(nextGuideInvite(state, { sessionId: 's2', hasFeedback: true }).offer).toBe('first-feedback');

    state = markGuideInvite(state, 's2', true);
    expect(state.postponed).toBe(MAX_GUIDE_POSTPONES);
    expect(nextGuideInvite(state, { sessionId: 's3', hasFeedback: true }).offer).toBeNull();
  });

  it('começar o guia não conta como adiamento', () => {
    expect(markGuideInvite(EMPTY_GUIDE_INVITE, 's1', false).postponed).toBe(0);
  });
});

describe('armazenamento do convite', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('a sessão do navegador é estável até o app ser aberto de novo', () => {
    const id = currentBrowserSessionId();
    expect(currentBrowserSessionId()).toBe(id);
    window.sessionStorage.clear();
    expect(currentBrowserSessionId()).not.toBe(id);
  });

  it('guarda por empresa e ignora dado corrompido', () => {
    saveGuideInvite('ent-1', { firstSessionId: 's1', postponed: 1, lastOfferSessionId: 's1' });
    expect(readGuideInvite('ent-1')).toEqual({ firstSessionId: 's1', postponed: 1, lastOfferSessionId: 's1' });
    expect(readGuideInvite('ent-2')).toEqual(EMPTY_GUIDE_INVITE);
    window.localStorage.setItem('feedback-analytics:convite-guia:ent-1', '{quebrado');
    expect(readGuideInvite('ent-1')).toEqual(EMPTY_GUIDE_INVITE);
  });
});
