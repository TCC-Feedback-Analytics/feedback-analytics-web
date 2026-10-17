import { useCallback, useEffect, useState } from 'react';
import { Link, useRouteLoaderData } from 'react-router-dom';
import { FaArrowsRotate, FaSpinner, FaTriangleExclamation } from 'react-icons/fa6';
import IaModelQuickSwitch from 'components/user/shared/IaModelQuickSwitch';
import { useCompanyQuestionsGenerationState } from 'src/lib/context/companyQuestionsGenerationContext';
import { useOnboarding } from 'src/lib/context/onboardingContext';
import { getCompanyQuestionsFailureNotice } from 'src/lib/hooks/useCompanyQuestionsGeneration';
import { questionsGenerationBlockedMessage } from 'src/lib/utils/questionsGeneration';
import {
  ServiceDismissCompanyQuestionsFailure,
  ServiceGetLatestCompanyQuestionsJob,
  ServiceRetryCompanyQuestions,
  type CompanyQuestionsJob,
  type QuestionsGenerationResult,
} from 'src/services/serviceFeedbacks';
import type { IaConfigResponse } from 'src/services/serviceIaConfig';

const IA_SETTINGS_PATH = '/user/edit/ia-settings';

/**
 * Aviso persistente quando a IA não conseguiu criar as perguntas da configuração
 * inicial. Vem do servidor (último pedido falhou, perguntas ainda padrão e aviso
 * não dispensado), então sobrevive a recarregar, sair e trocar de aparelho. Fica
 * no topo do layout até resolver: tentar de novo, trocar de modelo, revisar a
 * chave ou "Manter perguntas padrão".
 */
export default function CompanyQuestionsFailureBanner() {
  const routeData = useRouteLoaderData('user') as { iaConfig?: IaConfigResponse | null } | undefined;
  const iaConfig = routeData?.iaConfig ?? null;
  const { phase, track } = useCompanyQuestionsGenerationState();
  const { isInitialSetupRunning } = useOnboarding();
  const [failedJob, setFailedJob] = useState<CompanyQuestionsJob | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadLatest = useCallback(async () => {
    try {
      const { job, stillDefault } = await ServiceGetLatestCompanyQuestionsJob();
      const showNotice = job?.status === 'failed' && stillDefault === true && !job.dismissed;
      setFailedJob(showNotice ? job : null);
    } catch {
      // Sem a leitura agora; a próxima mudança de fase tenta de novo.
    }
  }, []);

  // Relê ao abrir e a cada fim de tentativa (falhou de novo ou deu certo).
  useEffect(() => {
    if (!iaConfig?.hasKey || phase === 'running') return;
    void loadLatest();
  }, [iaConfig?.hasKey, phase, loadLatest]);

  const follow = useCallback((result: QuestionsGenerationResult | undefined) => {
    const blocked = questionsGenerationBlockedMessage(result);
    setMessage(blocked);
    if (blocked) return;
    setSwitchOpen(false);
    void track();
  }, [track]);

  const retry = async () => {
    setRetrying(true);
    try {
      const { questionsGeneration } = await ServiceRetryCompanyQuestions();
      follow(questionsGeneration);
    } catch {
      setMessage('Não foi possível tentar de novo agora. Tente em instantes.');
    } finally {
      setRetrying(false);
    }
  };

  const keepDefaults = async () => {
    setDismissing(true);
    try {
      await ServiceDismissCompanyQuestionsFailure();
      setFailedJob(null);
    } catch {
      setMessage('Não foi possível salvar agora. Tente em instantes.');
    } finally {
      setDismissing(false);
    }
  };

  if (!iaConfig?.hasKey || isInitialSetupRunning) return null;

  // Nova tentativa andando a partir deste aviso.
  if (phase === 'running' && failedJob) {
    return (
      <div role="status" className="mb-5 flex items-center gap-3 rounded-xl border border-(--primary-color)/25 bg-(--primary-color)/10 px-4 py-3 text-sm text-(--text-secondary)">
        <FaSpinner className="shrink-0 animate-spin text-(--primary-color)" aria-hidden />
        <p>Gerando as perguntas de novo com {iaConfig.model || 'o modelo atual'}…</p>
      </div>
    );
  }

  if (!failedJob) return null;

  const notice = getCompanyQuestionsFailureNotice(failedJob.errorCode, iaConfig.model);
  const isAccountError = notice.actionLabel === 'Revisar chave';

  return (
    <div role="alert" className="mb-5 space-y-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FaTriangleExclamation className="mt-0.5 shrink-0 text-amber-400" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-400">As perguntas personalizadas não foram criadas</p>
            <p className="mt-0.5 break-words text-xs text-(--text-secondary)">{notice.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void retry()}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3 py-1.5 text-xs font-semibold text-(--primary-color) hover:bg-(--primary-color)/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {retrying ? <FaSpinner className="animate-spin" aria-hidden /> : <FaArrowsRotate aria-hidden />}
            {retrying ? 'Tentando…' : 'Tentar de novo'}
          </button>
          {isAccountError ? (
            <Link to={IA_SETTINGS_PATH} className="btn-ghost font-poppins px-3 py-1.5 text-xs">Revisar chave</Link>
          ) : (
            <button
              type="button"
              onClick={() => setSwitchOpen((open) => !open)}
              aria-expanded={switchOpen}
              className="btn-ghost font-poppins px-3 py-1.5 text-xs"
            >
              Trocar modelo
            </button>
          )}
          <button
            type="button"
            onClick={() => void keepDefaults()}
            disabled={dismissing}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-(--text-tertiary) hover:text-(--text-primary) disabled:opacity-60"
          >
            Manter perguntas padrão
          </button>
        </div>
      </div>
      {switchOpen && <IaModelQuickSwitch onChanged={(_model, result) => follow(result)} />}
      {message && <p role="status" className="text-xs text-amber-400">{message}</p>}
    </div>
  );
}
