import { describe, expect, it } from 'vitest';
import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';
import { activeFormQuestions, orderFormQuestions, questionEntries } from './formQuestions';

function metric(question_id: string, text: string, status: QuestionMetric['status'], mean = 4): QuestionMetric {
  return {
    question_id,
    text,
    status,
    mean,
    count: 20,
    ci: { lower: mean - 0.3, upper: mean + 0.3 },
    satisfiedPct: 70,
    distribution: { PESSIMO: 1, RUIM: 1, MEDIANA: 4, BOA: 7, OTIMA: 7 },
    confidenceTier: 'low',
    subquestions: [],
  };
}

describe('activeFormQuestions', () => {
  it('só as ativas, na ordem do formulário', () => {
    expect(
      activeFormQuestions([
        { id: 'q3', question_order: 3, question_text: 'Preço?', is_active: true },
        { id: 'q1', question_order: 1, question_text: 'Atendimento?', is_active: true },
        { id: 'q2', question_order: 2, question_text: 'Qualidade?', is_active: false },
      ]),
    ).toEqual([
      { id: 'q1', order: 1, text: 'Atendimento?' },
      { id: 'q3', order: 3, text: 'Preço?' },
    ]);
  });

  it('sem configuração, lista vazia', () => {
    expect(activeFormQuestions(undefined)).toEqual([]);
  });
});

describe('orderFormQuestions', () => {
  const config = [
    { id: 'q1', order: 1, text: 'Atendimento?' },
    { id: 'q2', order: 2, text: 'Qualidade?' },
  ];

  it('casa cada pergunta do formulário com a métrica da redação atual, na ordem do formulário', () => {
    const metrics = [
      metric('q2', 'Qualidade?', 'current', 4.5),
      metric('q1', 'Atendimento?', 'current', 3.1),
      metric('q1', 'Como foi o atendimento?', 'past', 2),
    ];
    const { rows, removed } = orderFormQuestions(config, metrics);
    expect(rows.map((row) => [row.config.id, row.metric?.mean])).toEqual([
      ['q1', 3.1],
      ['q2', 4.5],
    ]);
    expect(removed).toEqual([]);
  });

  it('pergunta sem respostas fica com métrica nula', () => {
    expect(orderFormQuestions(config, [metric('q1', 'Atendimento?', 'current')]).rows[1].metric).toBeNull();
  });

  it('perguntas fora do formulário (desativadas ou excluídas) vão para "removidas", uma por pergunta', () => {
    const metrics = [
      metric('q1', 'Atendimento?', 'current'),
      metric('q9', 'Entrega?', 'deactivated'),
      metric('q9', 'Entrega rápida?', 'past'),
      metric('q8', 'Limpeza?', 'past'),
    ];
    const { removed } = orderFormQuestions(config, metrics);
    expect(removed.map((entry) => [entry.question_id, entry.status])).toEqual([
      ['q9', 'deactivated'],
      ['q8', 'past'],
    ]);
  });
});

describe('questionEntries', () => {
  it('separa a redação principal do histórico', () => {
    const metrics = [metric('q1', 'Antiga?', 'past'), metric('q1', 'Atual?', 'current'), metric('q2', 'Outra?', 'current')];
    const { main, history } = questionEntries(metrics, 'q1');
    expect(main?.text).toBe('Atual?');
    expect(history.map((entry) => entry.text)).toEqual(['Antiga?']);
  });

  it('pergunta sem respostas no escopo', () => {
    expect(questionEntries([], 'q1')).toEqual({ main: null, history: [] });
  });
});
