import { Link, useLoaderData, useParams } from 'react-router-dom';
import PageHeader from 'components/user/shared/PageHeader';
import ScopeTag from 'components/user/shared/ScopeTag';
import { AnswerDistribution, QuestionScore, QuestionStatusTag } from 'components/user/pages/questions/QuestionParts';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useFormQuestionsConfig } from 'src/lib/hooks/useFormQuestionsConfig';
import { useScopedFeedbackQuestions } from 'src/lib/hooks/useScopedFeedbackQuestions';
import { questionEntries } from 'src/lib/utils/formQuestions';
import { scopeText } from 'src/lib/utils/scopeText';
import type { LoaderFormQuestions } from 'src/routes/loaders/loaderFormQuestions';

/**
 * Página de UMA pergunta (decisão de 16/10/2026): a pergunta escolhida e cada
 * subpergunta dela, com nota, distribuição, % de satisfeitos e precisão. O
 * histórico (redações antigas e subperguntas desativadas) fica recolhido no fim.
 */
export default function QuestionPage() {
  const { questionId = '' } = useParams();
  const initialData = useLoaderData<Awaited<ReturnType<typeof LoaderFormQuestions>>>();
  const { questions: metrics, loading, error } = useScopedFeedbackQuestions(initialData);
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const config = useFormQuestionsConfig();

  const { main, history } = questionEntries(metrics, questionId);
  const order = config.questions.find((question) => question.id === questionId)?.order;
  const title = order ? `Pergunta ${order}` : 'Pergunta';
  const currentSubs = main?.subquestions.filter((sub) => sub.status === 'current') ?? [];
  const oldSubs = main?.subquestions.filter((sub) => sub.status !== 'current') ?? [];

  return (
    <div className="font-work-sans space-y-6">
      <PageHeader
        title={main ? `${title} · ${main.text}` : title}
        description="A pergunta e cada subpergunta dela, com nota, respostas, % de satisfeitos e precisão."
        breadcrumb={[{ label: 'Visão geral', to: '/user/dashboard' }, { label: 'Perguntas do formulário' }, { label: title }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/user/dashboard" className="text-sm text-(--text-secondary) hover:text-(--text-primary)">
          ← Voltar às perguntas do formulário
        </Link>
        <ScopeTag />
      </div>

      {loading ? (
        <p className="text-sm text-(--text-tertiary)">Carregando as métricas da pergunta…</p>
      ) : error ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">{error}</div>
      ) : !main ? (
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-6 text-sm text-(--text-tertiary)">
          Esta pergunta ainda não tem respostas {scopeInfo.inScope}.
        </div>
      ) : (
        <>
          <section
            aria-labelledby="question-title"
            className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
          >
            <h2 id="question-title" className="flex flex-wrap items-center gap-2 font-montserrat text-lg font-semibold text-(--text-primary)">
              “{main.text}”
              <QuestionStatusTag status={main.status} />
            </h2>
            <div className="mt-4">
              <QuestionScore
                metricName={title}
                mean={main.mean}
                count={main.count}
                satisfiedPct={main.satisfiedPct}
                ci={main.ci}
                ofScope={scopeInfo.ofScope}
              />
            </div>
            <div className="mt-4">
              <AnswerDistribution distribution={main.distribution} total={main.count} showLegend />
            </div>
          </section>

          <section aria-labelledby="subquestions-title" className="space-y-3">
            <h2 id="subquestions-title" className="font-montserrat text-base font-semibold text-(--text-primary)">
              Subperguntas
            </h2>
            {currentSubs.length === 0 ? (
              <p className="text-sm text-(--text-tertiary)">Esta pergunta não tem subperguntas com respostas.</p>
            ) : (
              <ul className="space-y-3">
                {currentSubs.map((sub) => (
                  <li key={sub.subquestion_id} className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
                    <h3 className="text-sm font-semibold text-(--text-primary)">“{sub.text}”</h3>
                    <div className="mt-3">
                      <QuestionScore
                        metricName={`Subpergunta de ${title}`}
                        mean={sub.mean}
                        count={sub.count}
                        satisfiedPct={sub.satisfiedPct}
                        ci={sub.ci}
                        ofScope={scopeInfo.ofScope}
                      />
                    </div>
                    <div className="mt-3">
                      <AnswerDistribution distribution={sub.distribution} total={sub.count} showLegend />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(history.length > 0 || oldSubs.length > 0) && (
            <details className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary)/40">
              <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-(--text-secondary)">
                Histórico ({history.length + oldSubs.length}) · versões antigas do texto e subperguntas desativadas
              </summary>
              <ul className="space-y-3 px-4 pb-4">
                {history.map((entry, index) => (
                  <li key={`${entry.question_id}-${index}`} className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color)/40 p-4">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-(--text-secondary)">
                      “{entry.text}” <QuestionStatusTag status={entry.status} />
                    </p>
                    <div className="mt-2">
                      <QuestionScore
                        metricName={`${title} (versão anterior)`}
                        mean={entry.mean}
                        count={entry.count}
                        satisfiedPct={entry.satisfiedPct}
                        ci={entry.ci}
                        ofScope={scopeInfo.ofScope}
                      />
                    </div>
                  </li>
                ))}
                {oldSubs.map((sub, index) => (
                  <li key={`${sub.subquestion_id}-${index}`} className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color)/40 p-4">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-(--text-secondary)">
                      Subpergunta “{sub.text}” <QuestionStatusTag status={sub.status} />
                    </p>
                    <div className="mt-2">
                      <QuestionScore
                        metricName={`Subpergunta de ${title} (fora do formulário)`}
                        mean={sub.mean}
                        count={sub.count}
                        satisfiedPct={sub.satisfiedPct}
                        ci={sub.ci}
                        ofScope={scopeInfo.ofScope}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
