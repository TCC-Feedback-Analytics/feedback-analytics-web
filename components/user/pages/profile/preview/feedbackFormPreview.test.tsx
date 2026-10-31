import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';
import FeedbackFormPreview from './feedbackFormPreview';

const questions: CompanyFeedbackQuestionInput[] = [
  {
    question_order: 1,
    question_text: 'Como foi o atendimento?',
    is_active: true,
    subquestions: [],
  },
];

describe('prévia do formulário de feedback', () => {
  it('aplica o mesmo escopo visual do formulário público', () => {
    render(<FeedbackFormPreview questions={questions} scopeType="COMPANY" />);

    const ratingGroup = screen.getByRole('radiogroup', { name: 'Nota geral' });
    expect(ratingGroup.closest('.feedback-form-experience')).toHaveClass(
      'feedback-form-experience',
    );
  });
});
