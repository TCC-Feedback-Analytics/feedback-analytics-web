import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import type { CommentParticipation, FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import CommentParticipationSection from './CommentParticipationSection';
import { commentGroupsVerdict, isLowParticipation } from 'src/lib/utils/commentParticipation';

afterEach(() => cleanup());

function stats(participation: Partial<CommentParticipation>): FeedbackStats {
  return {
    totalFeedbacks: 50,
    commentParticipation: {
      total: 50, withComment: 10, pct: 20, ci: { lower: 11, upper: 33 }, confidenceTier: 'moderate',
      withCommentRating: { n: 10, mean: 2.8, ci: { lower: 2.2, upper: 3.4 } },
      withoutCommentRating: { n: 40, mean: 4.6, ci: { lower: 4.4, upper: 4.8 } },
      ...participation,
    },
  } as FeedbackStats;
}

const scope = { inScope: 'no produto Pizza', ofScope: 'do produto Pizza' };

describe('Quem escreve comentário', () => {
  it('mostra a taxa, as duas notas, quem está mais satisfeito e o aviso de poucos comentários', () => {
    render(<CommentParticipationSection stats={stats({})} {...scope} />);
    const section = screen.getByRole('region', { name: /Quem escreve comentário/ });
    expect(within(section).getByText('20%')).toBeInTheDocument();
    expect(within(section).getByText(/das avaliações trazem um comentário escrito/)).toHaveTextContent('(10 de 50 avaliações)');
    expect(within(section).getByText(/Quem comenta dá/)).toHaveTextContent('Quem comenta dá 2,8; quem só dá as estrelas, 4,6.');
    expect(within(section).getByText('Quem comenta está menos satisfeito')).toBeInTheDocument();
    expect(within(section).getByRole('note')).toHaveTextContent('falam de 20% das avaliações');
  });

  it('com bastante comentário, sem aviso', () => {
    render(<CommentParticipationSection stats={stats({ withComment: 30, pct: 60 })} {...scope} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('ninguém comentou: explica em vez de comparar', () => {
    render(<CommentParticipationSection stats={stats({ withComment: 0, pct: 0, withCommentRating: null })} {...scope} />);
    expect(screen.getByText('Ninguém escreveu comentário no produto Pizza.')).toBeInTheDocument();
  });

  it('sem avaliações', () => {
    render(<CommentParticipationSection stats={stats({ total: 0, withComment: 0, pct: 0, withCommentRating: null, withoutCommentRating: null })} {...scope} />);
    expect(screen.getByText('Ainda sem avaliações no produto Pizza.')).toBeInTheDocument();
  });

  it('no Dashboard, uma linha só com o aviso', () => {
    render(<CommentParticipationSection stats={stats({})} {...scope} variant="compact" />);
    const line = screen.getByTestId('comment-participation-compact');
    expect(line).toHaveTextContent('20% das avaliações trazem um comentário (10 de 50) · Quem comenta está menos satisfeito');
    expect(within(line).getByRole('note')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('no Dashboard, sem avaliações não mostra nada', () => {
    const { container } = render(<CommentParticipationSection stats={null} {...scope} variant="compact" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('regras da participação', () => {
  it('aviso só com 10 avaliações ou mais e menos de 30% comentando', () => {
    expect(isLowParticipation(20, 50)).toBe(true);
    expect(isLowParticipation(20, 9)).toBe(false);
    expect(isLowParticipation(30, 50)).toBe(false);
  });

  it('diferença pequena com poucas avaliações fica incerta', () => {
    const verdict = commentGroupsVerdict(
      { n: 3, mean: 4.0, ci: { lower: 2.5, upper: 5 } },
      { n: 4, mean: 4.4, ci: { lower: 3.2, upper: 5 } },
    );
    expect(verdict?.text).toMatch(/Diferença incerta/);
  });
});
