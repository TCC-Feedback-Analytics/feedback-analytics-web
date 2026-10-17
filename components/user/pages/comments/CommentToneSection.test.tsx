import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import type { FeedbackAnalysisSummary, FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import CommentToneSection from './CommentToneSection';

afterEach(cleanup);

const summary = {
  totalAnalyzed: 100,
  sentiments: { positive: 70, neutral: 20, negative: 10 },
  topCategories: [],
  topKeywords: [],
  netSentimentScore: 60,
} as FeedbackAnalysisSummary;

function previousStats(aiSentiment: FeedbackStats['aiSentiment']) {
  return {
    reference: '30 dias anteriores',
    loading: false,
    failed: false,
    data: { totalFeedbacks: 100, averageRating: 4, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 }, aiSentiment } as FeedbackStats,
  };
}

describe('CommentToneSection — comparação com o período anterior', () => {
  it('mostra quanto o tom mudou', () => {
    render(
      <CommentToneSection
        summary={summary}
        inScope="na empresa"
        ofScope="da empresa"
        previous={previousStats({ positive: 30, neutral: 30, negative: 40, netSentimentScore: -10, confidenceTier: 'good' })}
      />,
    );

    expect(screen.getByLabelText('Tom dos comentários: +70 vs. 30 dias anteriores, melhorou')).toBeInTheDocument();
  });

  it('sem comentários analisados no período anterior, diz isso', () => {
    render(<CommentToneSection summary={summary} inScope="na empresa" ofScope="da empresa" previous={previousStats(undefined)} />);

    expect(screen.getByText('Sem dados no período anterior')).toBeInTheDocument();
  });

  it('sem a comparação, não mostra nada a mais', () => {
    render(<CommentToneSection summary={summary} inScope="na empresa" ofScope="da empresa" />);

    expect(screen.queryByText(/anteriores|período anterior/)).not.toBeInTheDocument();
  });
});
