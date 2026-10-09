import type {
  CollectingDataEnterprise,
  CompanyFeedbackQuestionInput,
} from 'lib/interfaces/entities/enterprise.entity';

const TOTAL_QUESTIONS = 3;
const TOTAL_SUBQUESTIONS = 3;

const DEFAULT_COMPANY_QUESTIONS: Array<{
  question_order: 1 | 2 | 3;
  question_text: string;
}> = [
  { question_order: 1, question_text: 'Como foi sua experiência em relação ao atendimento?' },
  { question_order: 2, question_text: 'O que você achou da qualidade do produto/serviço?' },
  {
    question_order: 3,
    question_text: 'Como você avalia a relação entre o valor pago e a qualidade do produto/serviço?',
  },
];

function createEmptySubquestion(subquestionOrder: 1 | 2 | 3) {
  return {
    subquestion_order: subquestionOrder,
    subquestion_text: '',
    is_active: false,
  };
}
export function normalizeCompanyFeedbackQuestions(
  items: CollectingDataEnterprise['company_feedback_questions'] | undefined,
): CompanyFeedbackQuestionInput[] {
  const byOrder = new Map<number, CompanyFeedbackQuestionInput>();
  const hasSavedQuestions = (items ?? []).length > 0;

  (items ?? []).forEach((item) => {
    const order = Number(item.question_order);
    if (!Number.isInteger(order) || order < 1 || order > 3) return;

    const subquestionByOrder = new Map<number, { subquestion_text: string; is_active: boolean }>();
    (item.subquestions ?? []).forEach((subquestion) => {
      const subOrder = Number(subquestion.subquestion_order);
      if (!Number.isInteger(subOrder) || subOrder < 1 || subOrder > 3) return;
      subquestionByOrder.set(subOrder, {
        subquestion_text: String(subquestion.subquestion_text ?? ''),
        is_active: subquestion.is_active === true,
      });
    });

    byOrder.set(order, {
      question_order: order as 1 | 2 | 3,
      question_text: item.question_text ?? '',
      is_active: item.is_active ?? true,
      subquestions: Array.from({ length: TOTAL_SUBQUESTIONS }, (_, subIndex) => {
        const subOrder = (subIndex + 1) as 1 | 2 | 3;
        const current = subquestionByOrder.get(subOrder);
        return {
          subquestion_order: subOrder,
          subquestion_text: current?.subquestion_text ?? '',
          is_active: current?.is_active ?? false,
        };
      }),
    });
  });

  return Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
    const questionOrder = (index + 1) as 1 | 2 | 3;
    const current = byOrder.get(questionOrder);

    return {
      question_order: questionOrder,
      question_text:
        (current?.is_active === false ? '' : current?.question_text) ??
        (hasSavedQuestions ? '' : DEFAULT_COMPANY_QUESTIONS[index]?.question_text) ??
        '',
      is_active: current?.is_active === false ? false : current?.is_active ?? true,
      subquestions:
        current?.is_active === false
          ? []
          : current?.subquestions ?? [
              createEmptySubquestion(1),
              createEmptySubquestion(2),
              createEmptySubquestion(3),
            ],
    };
  });
}
