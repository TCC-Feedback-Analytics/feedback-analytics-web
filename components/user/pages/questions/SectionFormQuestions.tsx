import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';
import ScopeTag from 'components/user/shared/ScopeTag';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useFormQuestionsConfig } from 'src/lib/hooks/useFormQuestionsConfig';
import { orderFormQuestions } from 'src/lib/utils/formQuestions';
import { scopeText } from 'src/lib/utils/scopeText';
import { QuestionDelta, QuestionScore } from './QuestionParts';
import type { SectionFormQuestionsProps } from './ui.types';

const KIND_SINGULAR = { PRODUCT: 'produto', SERVICE: 'serviço', DEPARTMENT: 'departamento' } as const;

/**
 * "Perguntas do formulário" no Dashboard (decisão de 16/10/2026): as perguntas
 * ATUAIS do escopo, na ordem do formulário, cada uma com nota, respostas, % de
 * satisfeitos e precisão — e o caminho para a página da pergunta. Toda pergunta
 * mostrada tem um dono claro: a empresa ou um item.
 */
export default function SectionFormQuestions({ metrics, previous = null }: SectionFormQuestionsProps) {
  const { scope, catalogItemId, catalogItemOptions, period, setCatalogItemId } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const config = useFormQuestionsConfig();
  const { rows, removed } = orderFormQuestions(config.questions, metrics);

  const answered = rows.filter((row) => row.metric);
  const worstId =
    answered.length > 1
      ? answered.reduce((worst, row) => (row.metric!.mean < worst.metric!.mean ? row : worst)).config.id
      : null;

  let body;
  if (config.status === 'pick-item' && scope !== 'COMPANY') {
    const items = catalogItemOptions.filter((item) => item.kind === scope);
    body = (
      <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-5 text-sm text-(--text-secondary)">
        <p>Cada {KIND_SINGULAR[scope]} tem as suas perguntas. Escolha um para vê-las:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCatalogItemId(item.id)}
              className="rounded-full border border-(--quaternary-color)/18 px-3 py-1 text-xs font-medium text-(--text-primary) transition-colors hover:border-(--primary-color)/40"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    );
  } else if (config.status === 'loading') {
    body = <p className="text-sm text-(--text-tertiary)">Carregando as perguntas do formulário…</p>;
  } else if (config.status === 'error') {
    body = <p className="text-sm text-(--text-tertiary)">Não foi possível carregar as perguntas deste formulário agora.</p>;
  } else if (rows.length === 0) {
    body = (
      <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-5 text-sm text-(--text-tertiary)">
        {scope === 'COMPANY' ? 'O formulário geral não tem perguntas ativas.' : `Este ${KIND_SINGULAR[scope]} não tem perguntas no formulário.`}
      </div>
    );
  } else {
    body = (
      <ol className="space-y-3">
        {rows.map(({ config: question, metric }) => (
          <li
            key={question.id}
            className={`rounded-2xl border bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5 ${
              question.id === worstId ? 'border-(--negative)/35' : 'border-(--quaternary-color)/10'
            }`}
          >
            <p className="text-xs text-(--text-tertiary)">
              Pergunta {question.order}
              {question.id === worstId && <span className="ml-2 font-semibold text-(--negative)">· Menor nota</span>}
            </p>
            <h3 className="mt-1 font-montserrat text-base font-semibold text-(--text-primary)">“{question.text}”</h3>
            <div className="mt-3">
              {metric ? (
                <QuestionScore
                  metricName={`Pergunta ${question.order}`}
                  mean={metric.mean}
                  count={metric.count}
                  satisfiedPct={metric.satisfiedPct}
                  ci={metric.ci}
                  ofScope={scopeInfo.ofScope}
                />
              ) : (
                <p className="text-sm text-(--text-tertiary)">Ainda sem respostas {scopeInfo.inScope}.</p>
              )}
              {metric && previous && (
                <div className="mt-2">
                  <QuestionDelta metricName={`Pergunta ${question.order}`} metric={metric} previous={previous} />
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Link
                to={`/user/questions/${question.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
              >
                Ver todas as métricas desta pergunta
                <FaArrowRight className="text-xs" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section className="font-work-sans space-y-4" aria-labelledby="form-questions-title" data-tour="tour-form-questions">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="form-questions-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
          Perguntas do formulário
        </h2>
        <ScopeTag />
      </header>

      {body}

      {removed.length > 0 && (
        <div className="flex justify-end">
          <Link
            to="/user/questions/removed"
            className="inline-flex items-center gap-1.5 text-sm text-(--text-tertiary) transition-colors hover:text-(--text-primary)"
          >
            Perguntas que saíram do formulário ({removed.length})
            <FaArrowRight className="text-xs" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
