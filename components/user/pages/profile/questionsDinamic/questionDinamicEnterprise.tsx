import type {
  CollectingDataEnterprise,
} from "lib/interfaces/entities/enterprise.entity";
import { useRouteLoaderData } from "react-router-dom";
import { INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS } from "src/lib/constants/routes/intents";
import GuidedQuestionsEditor from "components/user/pages/profile/questionsDinamic/GuidedQuestionsEditor";
import { normalizeCompanyFeedbackQuestions } from "components/user/pages/profile/questionsDinamic/companyQuestionUtils";

/**
 * Perguntas do "Feedback geral" (escopo empresa). Fino wrapper do
 * QuestionsEditor compartilhado, configurado para o escopo COMPANY
 * (3 perguntas obrigatórias, salvas via collecting_data).
 */
export default function QuestionDinamicEnterprise() {
  const { collecting } = useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
  };

  const initialQuestions = normalizeCompanyFeedbackQuestions(
    collecting?.company_feedback_questions,
  );

  return (
    <div className="space-y-5">
      <GuidedQuestionsEditor
        initialQuestions={initialQuestions}
        hasSavedQuestions={(collecting?.company_feedback_questions ?? []).some(
          (question) => question.is_active !== false && question.question_text.trim().length > 0,
        )}
        action="/user/edit/feedback-general"
        intent={INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS}
        payloadFieldName="company_feedback_questions"
        scopeType="COMPANY"
        idPrefix="preview-company"
      />
    </div>
  );
}
