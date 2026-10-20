import { Link } from 'react-router-dom';
import { FaSpinner, FaWandMagicSparkles } from 'react-icons/fa6';
import MetricHelp from 'components/user/shared/MetricHelp';
import ScopeTag from 'components/user/shared/ScopeTag';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopeDiagnosis } from 'src/lib/hooks/useScopeDiagnosis';
import { MIN_FEEDBACKS_FOR_AI } from 'src/lib/utils/feedbackMilestones';
import { getIaErrorMessage, getIaFailureNotice } from 'src/lib/utils/iaErrorMapper';
import { metricsPeriodParams, periodText } from 'src/lib/utils/metricsPeriod';
import { countLabel } from 'src/lib/utils/plural';
import { scopeText } from 'src/lib/utils/scopeText';
import {
  diagnosisGeneratedLabel,
  diagnosisPeriodLabel,
  isSameDiagnosisPeriod,
} from 'src/lib/utils/scopeDiagnosis';
import type { DiagnosisFindingListProps, DiagnosisResultProps, SectionScopeDiagnosisProps } from './ui.types';

const IA_SETTINGS_PATH = '/user/edit/ia-settings';
const COMPANY_DATA_PATH = '/user/edit/collecting-data-enterprise';

function FindingList({ title, items, empty }: DiagnosisFindingListProps) {
  return (
    <div className="rounded-xl bg-(--seventh-color) p-4">
      <h3 className="text-sm font-semibold text-(--text-primary)">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-(--text-tertiary)">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-(--text-secondary)">
              {item.text}
              <span className="mt-0.5 block text-xs text-(--text-tertiary)">{item.evidence}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiagnosisResult({ diagnosis }: DiagnosisResultProps) {
  const { result } = diagnosis;
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-(--text-primary)">{result.summary}</p>

      <div className="rounded-xl border border-(--primary-color)/20 bg-(--primary-color)/5 p-4">
        <h3 className="text-sm font-semibold text-(--text-primary)">O que fazer, em ordem</h3>
        <ol className="mt-3 space-y-3">
          {result.recommendations.map((item) => (
            <li key={item.priority} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary-color) text-xs font-bold text-(--bg-primary)">
                {item.priority}
              </span>
              <div className="min-w-0 text-sm">
                <span
                  className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    item.kind === 'fix' ? 'bg-(--negative)/15 text-(--negative)' : 'bg-(--positive)/15 text-(--positive)'
                  }`}
                >
                  {item.kind === 'fix' ? 'Corrigir' : 'Manter'}
                </span>
                <span className="text-(--text-primary)">{item.action}</span>
                <span className="mt-0.5 block text-xs text-(--text-tertiary)">{item.evidence}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FindingList title="O que vai bem" items={result.going_well} empty="Nada se destacou para o bem." />
        <FindingList title="O que preocupa" items={result.concerns} empty="Nada preocupante nos números." />
        <FindingList
          title="O que mudou"
          items={result.changes}
          empty={diagnosis.previousPeriod ? 'Sem mudança que os números confirmem.' : 'Sem período anterior para comparar.'}
        />
      </div>

      {result.limitations.length > 0 && (
        <div className="text-xs text-(--text-tertiary)">
          <p className="font-medium text-(--text-secondary)">Limites dos dados</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {result.limitations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * "Diagnóstico do escopo ✨ IA": a IA junta estrelas, perguntas e comentários do
 * escopo no período, compara com o período anterior e diz o que fazer. Os
 * números vêm do backend; a IA só interpreta.
 */
export default function SectionScopeDiagnosis({
  hasConfiguredAI,
  hasCompanyContext,
  periodTotal,
  model,
}: SectionScopeDiagnosisProps) {
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const ready = hasConfiguredAI && hasCompanyContext;
  const { diagnosis, loading, loadFailed, generating, jobStatus, failureCode, generate } = useScopeDiagnosis({ enabled: ready });

  const enoughData = periodTotal === null || periodTotal >= MIN_FEEDBACKS_FOR_AI;
  const selectedPeriodLabel = periodText(period).label;
  const samePeriod = diagnosis ? isSameDiagnosisPeriod(diagnosis.period, metricsPeriodParams(period)) : false;

  let gate = null;
  if (!hasConfiguredAI) {
    gate = (
      <p className="text-sm text-(--text-secondary)">
        Configure a IA para receber o diagnóstico.{' '}
        <Link to={IA_SETTINGS_PATH} className="font-medium text-(--primary-color) hover:underline">
          Configurar a IA
        </Link>
      </p>
    );
  } else if (!hasCompanyContext) {
    gate = (
      <p className="text-sm text-(--text-secondary)">
        A IA precisa conhecer a empresa para recomendar.{' '}
        <Link to={COMPANY_DATA_PATH} className="font-medium text-(--primary-color) hover:underline">
          Preencher os dados da empresa
        </Link>
      </p>
    );
  }

  const failure = failureCode
    ? getIaFailureNotice({ errorCode: failureCode, model, task: 'gerar o diagnóstico' }) ?? {
        title: 'Não foi possível gerar o diagnóstico',
        description: getIaErrorMessage(failureCode),
        actionLabel: undefined,
      }
    : null;

  const action = (() => {
    if (generating) return null;
    if (!diagnosis) return { label: 'Gerar diagnóstico', force: false };
    if (!samePeriod) return { label: 'Gerar para o período selecionado', force: false };
    if (diagnosis.newFeedbacksSince > 0) return { label: 'Atualizar diagnóstico', force: false };
    return { label: 'Gerar de novo', force: true };
  })();

  return (
    <section
      className="font-work-sans space-y-4 rounded-2xl border border-(--primary-color)/20 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
      aria-labelledby="scope-diagnosis-title"
      data-tour="tour-dashboard-diagnosis"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="scope-diagnosis-title" className="flex items-center gap-1 font-montserrat text-lg font-semibold text-(--text-primary)">
          Diagnóstico do escopo <span className="text-sm font-medium text-(--primary-color)">✨ IA</span>
          <MetricHelp term="scopeDiagnosis" />
        </h2>
        <ScopeTag />
      </header>

      {gate ?? (
        <>
          {loading ? (
            <p className="text-sm text-(--text-tertiary)">Carregando o diagnóstico…</p>
          ) : loadFailed ? (
            <p className="text-sm text-(--text-tertiary)">Não foi possível carregar o diagnóstico agora.</p>
          ) : diagnosis ? (
            <>
              <p className="text-xs text-(--text-tertiary)">
                {diagnosisPeriodLabel(diagnosis.period)}
                {diagnosis.previousPeriod && ` · comparado com ${diagnosisPeriodLabel(diagnosis.previousPeriod)}`}
                {` · ${countLabel(diagnosis.feedbackCount, 'avaliações')}`}
                {` · ${diagnosisGeneratedLabel(diagnosis.createdAt)}`}
              </p>
              <DiagnosisResult diagnosis={diagnosis} />
            </>
          ) : (
            <p className="text-sm text-(--text-secondary)">
              A IA junta as estrelas, as perguntas e os comentários {scopeInfo.inScope}, compara com o período anterior e diz o que
              fazer primeiro.
            </p>
          )}

          {generating && (
            <p className="flex items-center gap-2 text-sm text-(--text-secondary)" role="status">
              <FaSpinner className="animate-spin text-(--primary-color)" aria-hidden />
              {jobStatus === 'waiting_budget'
                ? 'Aguardando a vez na cota da IA…'
                : 'A IA está lendo os números e os comentários. Leva alguns segundos.'}
            </p>
          )}

          {failure && !generating && (
            <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm" role="alert">
              <p className="font-semibold text-(--text-primary)">{failure.title}</p>
              <p className="mt-0.5 text-(--text-secondary)">{failure.description}</p>
              {failure.actionLabel && (
                <Link to={IA_SETTINGS_PATH} className="mt-1 inline-block font-medium text-(--primary-color) hover:underline">
                  {failure.actionLabel}
                </Link>
              )}
            </div>
          )}

          {!loading && !loadFailed && action && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--quaternary-color)/10 pt-4">
              <p className="text-xs text-(--text-tertiary)">
                {!enoughData
                  ? `São precisas pelo menos ${MIN_FEEDBACKS_FOR_AI} avaliações ${scopeInfo.inScope} (agora: ${periodTotal}).`
                  : diagnosis && !samePeriod
                    ? `Este diagnóstico é de outro período. O selecionado é ${selectedPeriodLabel.toLowerCase()}.`
                    : diagnosis && diagnosis.newFeedbacksSince > 0
                      ? `${countLabel(diagnosis.newFeedbacksSince, 'avaliações novas')} desde então.`
                      : diagnosis
                        ? 'Sem avaliações novas desde então.'
                        : `Uma análise de IA ${scopeInfo.inScope}.`}
              </p>
              <button
                type="button"
                onClick={() => void generate({ force: action.force })}
                disabled={!enoughData}
                className={`${diagnosis && action.force ? 'btn-ghost' : 'btn-primary'} font-poppins inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <FaWandMagicSparkles aria-hidden />
                {action.label}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
