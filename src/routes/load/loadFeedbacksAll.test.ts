import { describe, expect, it } from 'vitest';
import { parseFeedbacksAllFilters } from './loadFeedbacksAll';

describe('[Unidade] parseFeedbacksAllFilters', () => {
  it('parseia os filtros padrões quando a URL não possui parâmetros', () => {
    const url = new URL('http://localhost/user/feedbacks/all');
    const filters = parseFeedbacksAllFilters(url);

    expect(filters).toEqual({
      page: 1,
      limit: 10,
      rating: undefined,
      search: '',
      category: undefined,
      item: '',
    });
  });

  it('extrai os parâmetros search e item de forma independente', () => {
    const url = new URL('http://localhost/user/feedbacks/all?search=atendimento&item=Financeiro&rating=5');
    const filters = parseFeedbacksAllFilters(url);

    expect(filters.search).toBe('atendimento');
    expect(filters.item).toBe('Financeiro');
    expect(filters.rating).toBe(5);
  });
});
