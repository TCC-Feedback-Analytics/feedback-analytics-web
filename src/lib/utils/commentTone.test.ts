import { describe, it, expect } from 'vitest';
import {
  commentToneShares,
  commentToneWord,
  filterComments,
  parseCommentFilter,
} from './commentTone';
import type { FeedbackAnalysisItem, FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';

const item = (id: string, overrides: Partial<FeedbackAnalysisItem>): FeedbackAnalysisItem => ({
  id,
  message: `Comentário ${id}`,
  rating: 4,
  created_at: '2026-10-16T12:00:00.000Z',
  sentiment: 'neutral',
  categories: [],
  keywords: [],
  discrepancy: null,
  ...overrides,
});

const items = [
  item('a', { sentiment: 'positive' }),
  item('b', { sentiment: 'negative', rating: 5, discrepancy: 'silent_detractor' }),
  item('c', { sentiment: 'neutral' }),
  item('d', { sentiment: 'positive', rating: 1, discrepancy: 'rating_misuse' }),
];

describe('commentToneWord', () => {
  it('usa a banda neutra de ±5', () => {
    expect(commentToneWord(45)).toBe('Positivo');
    expect(commentToneWord(5)).toBe('Neutro');
    expect(commentToneWord(-5)).toBe('Neutro');
    expect(commentToneWord(-6)).toBe('Atenção');
  });
});

describe('commentToneShares', () => {
  it('calcula a proporção de cada tom sobre os analisados', () => {
    const summary = {
      totalAnalyzed: 20,
      sentiments: { positive: 12, neutral: 5, negative: 3 },
      topCategories: [],
      topKeywords: [],
    } as FeedbackAnalysisSummary;
    expect(commentToneShares(summary)).toEqual({
      positive: { count: 12, pct: 60 },
      neutral: { count: 5, pct: 25 },
      negative: { count: 3, pct: 15 },
    });
  });

  it('sem comentários analisados devolve 0%', () => {
    const summary = {
      totalAnalyzed: 0,
      sentiments: { positive: 0, neutral: 0, negative: 0 },
      topCategories: [],
      topKeywords: [],
    } as FeedbackAnalysisSummary;
    expect(commentToneShares(summary).positive.pct).toBe(0);
  });
});

describe('parseCommentFilter', () => {
  it('aceita os filtros conhecidos e cai em "todos" no resto', () => {
    expect(parseCommentFilter('negativos')).toBe('negativos');
    expect(parseCommentFilter('divergentes')).toBe('divergentes');
    expect(parseCommentFilter('qualquer')).toBe('todos');
    expect(parseCommentFilter(null)).toBe('todos');
  });
});

describe('filterComments', () => {
  it('filtra pelo tom lido pela IA', () => {
    expect(filterComments(items, 'todos').map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(filterComments(items, 'positivos').map((i) => i.id)).toEqual(['a', 'd']);
    expect(filterComments(items, 'neutros').map((i) => i.id)).toEqual(['c']);
    expect(filterComments(items, 'negativos').map((i) => i.id)).toEqual(['b']);
  });

  it('"Nota e texto não combinam" pega as duas divergências', () => {
    expect(filterComments(items, 'divergentes').map((i) => i.id)).toEqual(['b', 'd']);
  });
});
