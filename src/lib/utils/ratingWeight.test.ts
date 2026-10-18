import { describe, expect, it } from 'vitest';
import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';
import { improveFirst, ratingWeightLevel, ratingWeightOf } from './ratingWeight';

function metric(mean: number, r: number | null, n = 40): QuestionMetric {
  return {
    question_id: `q-${mean}-${r}`,
    text: 'Pergunta',
    count: n,
    mean,
    ci: { lower: mean - 0.2, upper: mean + 0.2 },
    satisfiedPct: 50,
    distribution: { PESSIMO: 0, RUIM: 0, MEDIANA: 0, BOA: 0, OTIMA: 0 },
    confidenceTier: 'moderate',
    subquestions: [],
    status: 'current',
    ...(r === null ? {} : { ratingWeight: { r, ci: { lower: r - 0.1, upper: r + 0.1 }, n } }),
  } as QuestionMetric;
}

describe('ratingWeightLevel', () => {
  it('pesa muito, pesa, pesa pouco e poucas respostas', () => {
    expect(ratingWeightLevel(ratingWeightOf(metric(4, 0.62)))).toBe('strong');
    expect(ratingWeightLevel(ratingWeightOf(metric(4, 0.35)))).toBe('medium');
    expect(ratingWeightLevel(ratingWeightOf(metric(4, 0.1)))).toBe('weak');
    expect(ratingWeightLevel(ratingWeightOf(metric(4, -0.4)))).toBe('weak');
    expect(ratingWeightLevel(ratingWeightOf(metric(4, 0.9, 12)))).toBe('few');
    expect(ratingWeightLevel(ratingWeightOf(metric(4, null)))).toBe('few');
  });
});

describe('improveFirst', () => {
  it('a menor nota entre as que pesam, se ainda não for Ótima', () => {
    const rows = [
      { id: 'a', metric: metric(3.1, 0.6) },
      { id: 'b', metric: metric(2.5, 0.1) }, // nota menor, mas pesa pouco
      { id: 'c', metric: metric(3.8, 0.4) },
    ];
    expect(improveFirst(rows)).toMatchObject({ id: 'a', level: 'strong' });
  });

  it('nada se destaca: todas pesam pouco, poucas respostas ou já Ótimas', () => {
    expect(improveFirst([{ metric: metric(3, 0.1) }, { metric: metric(3, 0.8, 10) }])).toBeNull();
    expect(improveFirst([{ metric: metric(4.6, 0.7) }])).toBeNull();
  });
});
