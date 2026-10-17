import { describe, it, expect, beforeEach } from 'vitest';
import {
  EMPTY_MILESTONES,
  nextMilestones,
  readMilestones,
  saveMilestones,
} from './feedbackMilestones';

const geral = 'COMPANY:';

describe('nextMilestones', () => {
  it('comemora o primeiro feedback só depois de ter visto a conta zerada', () => {
    const empty = nextMilestones(EMPTY_MILESTONES, { accountTotal: 0, scopeKey: geral, scopeTotal: 0 });
    expect(empty.celebrate).toEqual([]);
    expect(empty.state.seenEmpty).toBe(true);

    const first = nextMilestones(empty.state, { accountTotal: 1, scopeKey: geral, scopeTotal: 1 });
    expect(first.celebrate).toEqual(['first']);

    const again = nextMilestones(first.state, { accountTotal: 2, scopeKey: geral, scopeTotal: 2 });
    expect(again.celebrate).toEqual([]);
  });

  it('conta que já tinha feedbacks não recebe comemoração atrasada', () => {
    const result = nextMilestones(EMPTY_MILESTONES, { accountTotal: 40, scopeKey: geral, scopeTotal: 40 });
    expect(result.celebrate).toEqual([]);
  });

  it('comemora os 10 do escopo uma vez, e só se o escopo foi visto abaixo de 10', () => {
    const below = nextMilestones(EMPTY_MILESTONES, { accountTotal: 9, scopeKey: geral, scopeTotal: 9 });
    expect(below.celebrate).toEqual([]);

    const ten = nextMilestones(below.state, { accountTotal: 10, scopeKey: geral, scopeTotal: 10 });
    expect(ten.celebrate).toEqual(['ai']);

    const later = nextMilestones(ten.state, { accountTotal: 11, scopeKey: geral, scopeTotal: 11 });
    expect(later.celebrate).toEqual([]);
  });

  it('cada escopo tem o seu marco de 10', () => {
    let state = nextMilestones(EMPTY_MILESTONES, { accountTotal: 12, scopeKey: 'PRODUCT:p1', scopeTotal: 3 }).state;
    const otherScope = nextMilestones(state, { accountTotal: 12, scopeKey: geral, scopeTotal: 10 });
    expect(otherScope.celebrate).toEqual([]);

    state = otherScope.state;
    expect(nextMilestones(state, { accountTotal: 19, scopeKey: 'PRODUCT:p1', scopeTotal: 10 }).celebrate).toEqual(['ai']);
  });

  it('sem os números (falha ou carregando), não muda nada', () => {
    const result = nextMilestones(EMPTY_MILESTONES, { accountTotal: null, scopeKey: geral, scopeTotal: null });
    expect(result).toEqual({ state: EMPTY_MILESTONES, celebrate: [] });
  });
});

describe('readMilestones / saveMilestones', () => {
  beforeEach(() => window.localStorage.clear());

  it('guarda por empresa e lê de volta', () => {
    const state = { seenEmpty: true, firstCelebrated: true, belowAi: [geral], aiCelebrated: [] };
    saveMilestones('ent-1', state);
    expect(readMilestones('ent-1')).toEqual(state);
    expect(readMilestones('ent-2')).toEqual(EMPTY_MILESTONES);
  });

  it('dado corrompido volta ao estado inicial', () => {
    window.localStorage.setItem('feedback-analytics:marcos:ent-1', '{quebrado');
    expect(readMilestones('ent-1')).toEqual(EMPTY_MILESTONES);
  });
});
