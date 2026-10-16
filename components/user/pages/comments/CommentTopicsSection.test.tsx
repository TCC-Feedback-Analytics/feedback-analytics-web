import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentTopicsSection from './CommentTopicsSection';
import type { FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';

const base: FeedbackAnalysisSummary = {
  totalAnalyzed: 12,
  sentiments: { positive: 6, neutral: 3, negative: 3 },
  topCategories: [{ name: 'Atendimento', count: 5, proportion: 0.42 }],
  topKeywords: [{ name: 'demora', count: 4 }],
};

describe('[Unidade] Assuntos que mais impactam', () => {
  afterEach(() => cleanup());

  it('mostra os assuntos com o saldo e sem palavras-chave', () => {
    render(
      <CommentTopicsSection
        summary={{
          ...base,
          aspectSentiments: [{ aspect: 'Entrega', positive: 1, neutral: 0, negative: 4, count: 5, netSentimentScore: -60 }],
        }}
      />,
    );
    expect(screen.getByText('Entrega')).toBeInTheDocument();
    expect(screen.getByText('Saldo -60')).toBeInTheDocument();
    expect(screen.queryByText('Atendimento')).not.toBeInTheDocument();
    expect(screen.queryByText('demora')).not.toBeInTheDocument();
  });

  it('sem assuntos com 3+ menções, usa as categorias como reserva', () => {
    render(<CommentTopicsSection summary={{ ...base, aspectSentiments: [] }} />);
    expect(screen.getByText(/Ainda não há assuntos com 3 ou mais menções/)).toBeInTheDocument();
    expect(screen.getByText('Atendimento')).toBeInTheDocument();
    expect(screen.getByText(/5x/)).toHaveTextContent('5x · 42%');
  });
});
