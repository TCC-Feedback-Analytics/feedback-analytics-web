import { Link, useLoaderData } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';
import PageHeader from 'components/user/shared/PageHeader';
import ScopeTag from 'components/user/shared/ScopeTag';
import { QuestionScore, QuestionStatusTag } from 'components/user/pages/questions/QuestionParts';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useFormQuestionsConfig } from 'src/lib/hooks/useFormQuestionsConfig';
import { useScopedFeedbackQuestions } from 'src/lib/hooks/useScopedFeedbackQuestions';
import { orderFormQuestions } from 'src/lib/utils/formQuestions';
import { scopeText } from 'src/lib/utils/scopeText';
import type { LoaderFormQuestions } from 'src/routes/loaders/loaderFormQuestions';

/**
 * Perguntas que saíram do formulário (desativadas ou excluídas), mas têm
 * respostas no escopo. Cada uma leva à sua página, com o histórico.
 */
export default function RemovedQuestionsPage() {
  const initialData = useLoaderData<Awaited<ReturnType<typeof LoaderFormQuestions>>>();
  const { questions: metrics, loading, error } = useScopedFeedbackQuestions(initialData);
  const { scope, catalogItemId, catalogItemOptions } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions });
  const config = useFormQuestionsConfig();
  const { removed } = orderFormQuestions(config.questions, metrics);
  const waitingConfig = config.status === 'loading';

  return (
    <div className="font-work-sans space-y-6">
      <PageHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/user/dashboard" className="text-sm text-(--text-secondary) hover:text-(--text-primary)">
          ← Voltar às perguntas do formulário
        </Link>
        <ScopeTag />
      </div>

      {loading || waitingConfig ? (
        <p className="text-sm text-(--text-tertiary)">Carregando…</p>
      ) : error ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">{error}</div>
      ) : removed.length === 0 ? (
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-6 text-sm text-(--text-tertiary)">
          Nenhuma pergunta que saiu do formulário tem respostas {scopeInfo.inScope}.
        </div>
      ) : (
        <ul className="space-y-3">
          {removed.map((metric) => (
            <li key={metric.question_id} className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-(--text-primary)">
                “{metric.text}” <QuestionStatusTag status={metric.status} />
              </p>
              <div className="mt-3">
                <QuestionScore
                  metricName="Pergunta que saiu do formulário"
                  mean={metric.mean}
                  count={metric.count}
                  satisfiedPct={metric.satisfiedPct}
                  ci={metric.ci}
                  ofScope={scopeInfo.ofScope}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Link
                  to={`/user/questions/${metric.question_id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary) hover:text-(--text-primary)"
                >
                  Ver todas as métricas desta pergunta
                  <FaArrowRight className="text-xs" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
