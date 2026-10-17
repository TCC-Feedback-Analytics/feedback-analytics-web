import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';

const mocks = vi.hoisted(() => ({
  questions: [] as unknown[],
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useLoaderData: () => ({ questions: [], error: null }) };
});
vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: () => ({ scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [] }),
}));
vi.mock('src/lib/hooks/useScopedFeedbackQuestions', () => ({
  useScopedFeedbackQuestions: () => ({ questions: mocks.questions, loading: false, error: null, reload: vi.fn() }),
}));
vi.mock('src/lib/hooks/useFormQuestionsConfig', () => ({
  useFormQuestionsConfig: () => ({ status: 'ready', questions: [{ id: 'q1', order: 1, text: 'Como foi o atendimento?' }] }),
}));

import QuestionPage from '../user/questions/question';

function entry(text: string, status: QuestionMetric['status'], mean: number, subquestions: QuestionMetric['subquestions'] = []): QuestionMetric {
  return {
    question_id: 'q1', text, status, mean, count: 40,
    ci: { lower: mean - 0.2, upper: mean + 0.2 },
    satisfiedPct: 45,
    distribution: { PESSIMO: 4, RUIM: 6, MEDIANA: 12, BOA: 10, OTIMA: 8 },
    confidenceTier: 'moderate', subquestions,
  };
}

function renderPage(id = 'q1') {
  return render(
    <MemoryRouter initialEntries={[`/user/questions/${id}`]}>
      <Routes>
        <Route path="/user/questions/:questionId" element={<QuestionPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('[Unidade] Página de uma pergunta', () => {
  beforeEach(() => {
    mocks.questions = [
      entry('Como foi o atendimento?', 'current', 3.1, [
        { subquestion_id: 's1', text: 'Tempo de espera?', status: 'current', mean: 2.4, count: 40, ci: { lower: 2.2, upper: 2.6 }, satisfiedPct: 20, distribution: { PESSIMO: 10, RUIM: 12, MEDIANA: 10, BOA: 5, OTIMA: 3 }, confidenceTier: 'moderate' },
        { subquestion_id: 's2', text: 'Simpatia?', status: 'deactivated', mean: 4.6, count: 12, ci: { lower: 4.3, upper: 4.9 }, satisfiedPct: 90, distribution: { PESSIMO: 0, RUIM: 0, MEDIANA: 1, BOA: 4, OTIMA: 7 }, confidenceTier: 'low' },
      ]),
      entry('Como você avalia o atendimento?', 'past', 2.8),
      { ...entry('Outra pergunta?', 'current', 4.9), question_id: 'q2' },
    ];
  });

  afterEach(cleanup);

  it('mostra só a pergunta escolhida, com nota, distribuição e as subperguntas atuais', () => {
    renderPage();
    const question = screen.getByRole('region', { name: /Como foi o atendimento/ });
    expect(within(question).getByText('3,1')).toBeInTheDocument();
    expect(within(question).getByText('Mediana')).toBeInTheDocument();
    expect(within(question).getByText('Ótimo: 8')).toBeInTheDocument();

    const subs = screen.getByRole('region', { name: 'Subperguntas' });
    expect(within(subs).getByText('“Tempo de espera?”')).toBeInTheDocument();
    expect(within(subs).queryByText(/Simpatia/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Outra pergunta/)).not.toBeInTheDocument();
  });

  it('versões antigas e subperguntas desativadas ficam no histórico recolhido', () => {
    renderPage();
    const history = screen.getByText(/Histórico \(2\)/).closest('details')!;
    expect(history).not.toHaveAttribute('open');
    expect(within(history).getByText(/Como você avalia o atendimento/)).toBeInTheDocument();
    expect(within(history).getByText(/Simpatia/)).toBeInTheDocument();
  });

  it('pergunta sem respostas no escopo', () => {
    renderPage('q404');
    expect(screen.getByText('Esta pergunta ainda não tem respostas na empresa (avaliação geral).')).toBeInTheDocument();
  });
});
