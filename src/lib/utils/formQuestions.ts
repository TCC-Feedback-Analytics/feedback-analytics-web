import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';

/**
 * Perguntas do formulário (decisão de 16/10/2026): o Dashboard mostra as perguntas
 * ATUAIS na ordem do formulário, cada uma com suas métricas; as que saíram do
 * formulário ficam acessíveis por um link. As métricas (`/feedbacks/questions`)
 * vêm por pergunta e por redação; a ordem vem da configuração do formulário.
 */

export type FormQuestionConfig = {
  id: string;
  order: number;
  text: string;
};

/** Formato comum às perguntas da empresa e às de um item do catálogo. */
export type FormQuestionSource = {
  id: string;
  question_order: number;
  question_text: string;
  is_active: boolean;
};

export type FormQuestionRow = {
  config: FormQuestionConfig;
  /** Métrica da redação atual; null enquanto a pergunta não tiver respostas no escopo. */
  metric: QuestionMetric | null;
};

/** Só as perguntas ativas, na ordem do formulário. */
export function activeFormQuestions(source: FormQuestionSource[] | null | undefined): FormQuestionConfig[] {
  return (source ?? [])
    .filter((question) => question.is_active)
    .sort((a, b) => a.question_order - b.question_order)
    .map((question) => ({ id: question.id, order: question.question_order, text: question.question_text }));
}

/** Uma entrada por pergunta: a redação "viva" (atual ou desativada) ou, sem ela, a primeira. */
function representative(entries: QuestionMetric[]): QuestionMetric {
  return (
    entries.find((entry) => entry.status === 'current') ??
    entries.find((entry) => entry.status === 'deactivated') ??
    entries[0]
  );
}

export function orderFormQuestions(
  config: FormQuestionConfig[],
  metrics: QuestionMetric[],
): { rows: FormQuestionRow[]; removed: QuestionMetric[] } {
  const configIds = new Set(config.map((question) => question.id));

  const rows = config.map((question) => ({
    config: question,
    metric: metrics.find((metric) => metric.question_id === question.id && metric.status === 'current') ?? null,
  }));

  const removedById = new Map<string, QuestionMetric[]>();
  for (const metric of metrics) {
    if (configIds.has(metric.question_id)) continue;
    const list = removedById.get(metric.question_id) ?? [];
    list.push(metric);
    removedById.set(metric.question_id, list);
  }

  return { rows, removed: [...removedById.values()].map(representative) };
}

/** Página de uma pergunta: a redação principal e o histórico (redações antigas). */
export function questionEntries(
  metrics: QuestionMetric[],
  questionId: string,
): { main: QuestionMetric | null; history: QuestionMetric[] } {
  const entries = metrics.filter((metric) => metric.question_id === questionId);
  if (entries.length === 0) return { main: null, history: [] };
  const main = representative(entries);
  return { main, history: entries.filter((entry) => entry !== main) };
}
