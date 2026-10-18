import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';

const mocks = vi.hoisted(() => ({
  controls: {
    scope: 'COMPANY',
    catalogItemId: '',
    catalogItemOptions: [] as Array<{ id: string; name: string; kind: string }>,
    setCatalogItemId: vi.fn(),
  },
  config: { status: 'ready', questions: [] as Array<{ id: string; order: number; text: string }> },
}));

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));
vi.mock('src/lib/hooks/useFormQuestionsConfig', () => ({ useFormQuestionsConfig: () => mocks.config }));

import SectionFormQuestions from './SectionFormQuestions';

function metric(question_id: string, text: string, mean: number, status: QuestionMetric['status'] = 'current'): QuestionMetric {
  return {
    question_id, text, status, mean,
    count: 64,
    ci: { lower: mean - 0.2, upper: mean + 0.2 },
    satisfiedPct: 40,
    distribution: { PESSIMO: 5, RUIM: 10, MEDIANA: 23, BOA: 16, OTIMA: 10 },
    confidenceTier: 'moderate',
    subquestions: [],
  };
}

function renderSection(metrics: QuestionMetric[] = []) {
  return render(
    <MemoryRouter>
      <SectionFormQuestions metrics={metrics} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.controls.scope = 'COMPANY';
  mocks.controls.catalogItemId = '';
  mocks.controls.catalogItemOptions = [];
  mocks.controls.setCatalogItemId.mockReset();
  mocks.config = {
    status: 'ready',
    questions: [
      { id: 'q1', order: 1, text: 'Como foi o atendimento?' },
      { id: 'q2', order: 2, text: 'O que achou da qualidade?' },
    ],
  };
});

afterEach(cleanup);

describe('[Unidade] SectionFormQuestions', () => {
  it('mostra as perguntas atuais na ordem do formulário, com nota, respostas e link', () => {
    renderSection([metric('q2', 'O que achou da qualidade?', 4.5), metric('q1', 'Como foi o atendimento?', 3.1)]);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText('“Como foi o atendimento?”')).toBeInTheDocument();
    expect(within(items[0]).getByText('3,1')).toBeInTheDocument();
    expect(within(items[0]).getByText('Mediana')).toBeInTheDocument();
    expect(within(items[0]).getByText('64 respostas · 40% satisfeitos')).toBeInTheDocument();
    expect(within(items[0]).getByText(/Menor nota/)).toBeInTheDocument();
    expect(within(items[0]).getByRole('link', { name: /Ver todas as métricas desta pergunta/ }))
      .toHaveAttribute('href', '/user/questions/q1');

    expect(within(items[1]).getByText('Ótima')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Avaliação geral da empresa/ })).toBeInTheDocument();
  });

  it('com a comparação ligada, mostra quanto a nota de cada pergunta mudou', () => {
    render(
      <MemoryRouter>
        <SectionFormQuestions
          metrics={[metric('q1', 'Como foi o atendimento?', 3.8), metric('q2', 'O que achou da qualidade?', 4.1)]}
          previous={{ reference: '7 dias anteriores', loading: false, failed: false, data: [metric('q1', 'Como foi o atendimento?', 3.0)] }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Pergunta 1: +0,8 vs. 7 dias anteriores, melhorou')).toBeInTheDocument();
    expect(screen.getByText('Sem dados no período anterior')).toBeInTheDocument();
  });

  it('mostra o peso de cada pergunta na nota e o que melhorar primeiro', () => {
    const espera = { ...metric('q1', 'Como foi o atendimento?', 3.1), ratingWeight: { r: 0.62, ci: { lower: 0.4, upper: 0.78 }, n: 64 } };
    const qualidade = { ...metric('q2', 'O que achou da qualidade?', 2.8), ratingWeight: { r: 0.12, ci: { lower: -0.1, upper: 0.35 }, n: 64 } };
    renderSection([espera, qualidade] as QuestionMetric[]);

    const [first, second] = screen.getAllByRole('listitem');
    expect(within(first).getByText('Pesa muito na nota')).toBeInTheDocument();
    expect(within(second).getByText('Pesa pouco na nota')).toBeInTheDocument();
    // A qualidade tem a menor nota, mas pesa pouco: o destaque vai para o atendimento.
    expect(screen.getByText(/Melhore primeiro:/).parentElement).toHaveTextContent('Pergunta 1, “Como foi o atendimento?”. Pesa muito na nota e tem a menor nota entre as que mais pesam (3,1).');
  });

  it('sem peso calculado, diz que ainda há poucas respostas e não sugere prioridade', () => {
    renderSection([metric('q1', 'Como foi o atendimento?', 3.1)]);
    expect(screen.getByText('Poucas respostas para saber o peso')).toBeInTheDocument();
    expect(screen.queryByText(/Melhore primeiro/)).not.toBeInTheDocument();
  });

  it('pergunta sem respostas diz isso, com o escopo', () => {
    renderSection([metric('q1', 'Como foi o atendimento?', 3.1)]);
    expect(screen.getByText('Ainda sem respostas na empresa (avaliação geral).')).toBeInTheDocument();
  });

  it('tipo sem item escolhido pede para escolher o item, em vez de misturar perguntas', () => {
    mocks.controls.scope = 'PRODUCT';
    mocks.controls.catalogItemOptions = [
      { id: 'p1', name: 'Pizza', kind: 'PRODUCT' },
      { id: 'p2', name: 'Refrigerante', kind: 'PRODUCT' },
    ];
    mocks.config = { status: 'pick-item', questions: [] };
    renderSection([metric('x', 'Sabor?', 4)]);

    expect(screen.getByText('Cada produto tem as suas perguntas. Escolha um para vê-las:')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refrigerante' }));
    expect(mocks.controls.setCatalogItemId).toHaveBeenCalledWith('p2');
  });

  it('item sem perguntas no formulário', () => {
    mocks.controls.scope = 'SERVICE';
    mocks.controls.catalogItemId = 's1';
    mocks.controls.catalogItemOptions = [{ id: 's1', name: 'Entrega', kind: 'SERVICE' }];
    mocks.config = { status: 'ready', questions: [] };
    renderSection();
    expect(screen.getByText('Este serviço não tem perguntas no formulário.')).toBeInTheDocument();
  });

  it('link para as perguntas que saíram do formulário só quando existem', () => {
    renderSection([metric('q1', 'Como foi o atendimento?', 3.1)]);
    expect(screen.queryByRole('link', { name: /saíram do formulário/ })).not.toBeInTheDocument();
    cleanup();

    renderSection([metric('q1', 'Como foi o atendimento?', 3.1), metric('q9', 'Entrega?', 2.5, 'deactivated')]);
    expect(screen.getByRole('link', { name: 'Perguntas que saíram do formulário (1)' }))
      .toHaveAttribute('href', '/user/questions/removed');
  });
});
