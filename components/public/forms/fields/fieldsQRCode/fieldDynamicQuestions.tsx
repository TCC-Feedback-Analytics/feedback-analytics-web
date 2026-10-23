import type { FeedbackAnswerValue } from 'lib/interfaces/contracts/qrcode/question.contract';
import type { FieldDynamicQuestionsProps } from './ui.types';

const ANSWER_OPTIONS: Array<{ value: FeedbackAnswerValue; label: string }> = [
  { value: 'PESSIMO', label: 'Péssimo' },
  { value: 'RUIM', label: 'Ruim' },
  { value: 'MEDIANA', label: 'Mediana' },
  { value: 'BOA', label: 'Boa' },
  { value: 'OTIMA', label: 'Ótima' },
];

const ANSWER_HELPER: Record<FeedbackAnswerValue, string> = {
  PESSIMO: 'Muito abaixo do esperado',
  RUIM: 'Abaixo do esperado',
  MEDIANA: 'Atendeu parcialmente',
  BOA: 'Boa experiência geral',
  OTIMA: 'Excelente experiência',
};

export default function FieldDynamicQuestions({
  questions,
  answers,
  subanswers,
  onAnswerChange,
  onSubanswerChange,
}: FieldDynamicQuestionsProps) {
  if (!questions.length) {
    return null;
  }

  const sortedQuestions = [...questions].sort(
    (left, right) => left.question_order - right.question_order,
  );

  return (
    <section className="overflow-hidden rounded-[20px] border border-(--quaternary-color)/15 bg-(--bg-secondary)">
      {sortedQuestions.map((question) => {
        const selectedAnswer =
          answers.find((answer) => answer.question_id === question.id)?.answer_value ?? '';
        const questionHelperId = `question-helper-${question.id}`;
        const sortedSubquestions = [...(question.subquestions ?? [])]
          .filter((subquestion) => subquestion.is_active)
          .sort((left, right) => left.subquestion_order - right.subquestion_order);

        return (
          <div
            key={question.id}
            className="border-b border-(--quaternary-color)/14 p-4 last:border-b-0 sm:p-[18px]"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-(--primary-color)/12 text-[10px] font-bold text-(--primary-color)">{question.question_order}</span>
              <p className="text-[13px] font-semibold text-(--text-primary)">{question.question_text}</p>
            </div>

            <div
              className="grid grid-cols-5 gap-1 sm:gap-1.5"
              role="radiogroup"
              aria-label={`Pergunta ${question.question_order}`}
              aria-describedby={selectedAnswer ? questionHelperId : undefined}
            >
              {ANSWER_OPTIONS.map((option) => {
                const isSelected = selectedAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onAnswerChange(question.id, option.value)}
                    className={`flex min-h-[52px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-0.5 py-2 text-center text-[9px] font-semibold leading-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) ${
                      isSelected
                        ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) shadow-[0_0_0_1px_var(--primary-color)]'
                        : 'border-(--quaternary-color)/20 bg-(--bg-tertiary) text-(--text-secondary) hover:border-(--primary-color)/45 hover:bg-(--primary-color)/8 hover:text-(--text-primary)'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-current' : 'bg-current/70'}`} aria-hidden />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {selectedAnswer ? (
              <p
                id={questionHelperId}
                className="mt-3 text-xs text-(--primary-color)"
              >
                {ANSWER_HELPER[selectedAnswer as FeedbackAnswerValue]}
              </p>
            ) : null}

            {sortedSubquestions.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-(--quaternary-color)/15 pt-4">
                {sortedSubquestions.map((subquestion) => {
                  const selectedSubanswer =
                    subanswers.find(
                      (answer) => answer.subquestion_id === subquestion.id,
                    )?.answer_value ?? '';
                  const subquestionHelperId = `subquestion-helper-${subquestion.id}`;

                  return (
                    <div
                      key={subquestion.id}
                      className="rounded-xl border border-(--quaternary-color)/12 bg-(--bg-tertiary) p-3"
                    >
                      <p className="mb-2 text-xs font-semibold text-(--text-primary) font-work-sans">
                        {question.question_order}.{subquestion.subquestion_order} {subquestion.subquestion_text}
                      </p>

                      <div
                        className="grid grid-cols-5 gap-1 sm:gap-1.5"
                        role="radiogroup"
                        aria-label={`Subpergunta ${question.question_order}.${subquestion.subquestion_order}`}
                        aria-describedby={selectedSubanswer ? subquestionHelperId : undefined}
                      >
                        {ANSWER_OPTIONS.map((option) => {
                          const isSelected = selectedSubanswer === option.value;

                          return (
                            <button
                              key={`${subquestion.id}-${option.value}`}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() =>
                                onSubanswerChange(subquestion.id, option.value)
                              }
                              className={`min-h-[44px] w-full cursor-pointer rounded-lg border px-0.5 py-1 text-[8px] font-semibold leading-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) ${
                                isSelected
                                  ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) shadow-[0_0_0_1px_var(--primary-color)]'
                                  : 'border-(--quaternary-color)/20 bg-(--bg-secondary) text-(--text-secondary) hover:border-(--primary-color)/45 hover:bg-(--primary-color)/8 hover:text-(--text-primary)'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>

                      {selectedSubanswer ? (
                        <p
                          id={subquestionHelperId}
                          className="mt-2 text-xs text-(--primary-color)"
                        >
                          {ANSWER_HELPER[selectedSubanswer as FeedbackAnswerValue]}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
