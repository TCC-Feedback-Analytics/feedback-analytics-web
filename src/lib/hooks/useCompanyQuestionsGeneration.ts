import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalysisJobPolling } from './useAnalysisJobPolling';
import { getIaErrorCategory, getIaErrorMessage } from 'src/lib/utils/iaErrorMapper';
import {
  ServiceGetLatestCompanyQuestionsJob,
  type IaAnalysisJob,
} from 'src/services/serviceFeedbacks';

const ACTIVE_STATUSES = new Set(['queued', 'running', 'waiting_budget']);
const POLL_INTERVAL_MS = 5000;

export type CompanyQuestionsFailureNotice = {
  title: string;
  description: string;
  /** Presente quando o próximo passo é a Configuração de IA (trocar modelo ou revisar a chave). */
  actionLabel?: string;
};

/** Aviso da falha terminal da geração: o motivo pela categoria do erro e o que fazer. */
export function getCompanyQuestionsFailureNotice(
  errorCode: string | null,
  model: string | null,
): CompanyQuestionsFailureNotice {
  const reason = getIaErrorMessage(errorCode);
  const kept = 'As perguntas padrão foram mantidas.';
  const modelName = model ? `O modelo ${model}` : 'O modelo escolhido';

  switch (getIaErrorCategory(errorCode)) {
    case 'model':
      return {
        title: 'Modelo com erro',
        description: `${modelName} não conseguiu gerar as perguntas. ${reason} ${kept}`,
        actionLabel: 'Trocar modelo',
      };
    case 'account':
      return {
        title: 'Revise sua conta OpenRouter',
        description: `${reason} ${kept}`,
        actionLabel: 'Revisar chave',
      };
    case 'temporary':
      // Só falhas do provedor se resolvem trocando de modelo; queda do nosso serviço, não.
      return String(errorCode).startsWith('ia_provider_')
        ? {
            title: 'Provedor de IA indisponível',
            description: `${modelName} segue sem responder depois de várias tentativas. ${reason} ${kept} Se continuar, troque de modelo.`,
            actionLabel: 'Trocar modelo',
          }
        : { title: 'IA indisponível no momento', description: `${reason} ${kept}` };
    default:
      return {
        title: 'Perguntas padrão mantidas',
        description: 'A IA não conseguiu gerar as perguntas agora. Você pode personalizá-las em Configurar perguntas.',
      };
  }
}

/**
 * Acompanha a geração automática das 3 perguntas da configuração inicial. O
 * gateway enfileira o pedido ao salvar o contexto ou a IA; aqui a Web descobre
 * o job a cada revalidação do layout e faz o polling, que também destrava a
 * fila quando o provedor pede para esperar (429).
 */
export function useCompanyQuestionsGeneration({
  enabled,
  refreshKey,
  onCompleted,
  onFailed,
}: {
  enabled: boolean;
  /** Muda a cada revalidação do layout (ex.: o objeto `collecting`). */
  refreshKey: unknown;
  onCompleted: (applied: boolean) => void;
  onFailed: (errorCode: string | null) => void;
}) {
  const [jobId, setJobId] = useState<string | null>(null);
  const callbacks = useRef({ onCompleted, onFailed });
  callbacks.current = { onCompleted, onFailed };

  useEffect(() => {
    if (!enabled || jobId) return;
    let cancelled = false;
    ServiceGetLatestCompanyQuestionsJob()
      .then(({ job }) => {
        if (!cancelled && job && ACTIVE_STATUSES.has(job.status)) setJobId(job.id);
      })
      .catch(() => { /* Sem acompanhamento agora; a próxima revalidação tenta de novo. */ });
    return () => { cancelled = true; };
  }, [enabled, refreshKey, jobId]);

  const handleCompleted = useCallback(async (job: IaAnalysisJob) => {
    let applied = false;
    try {
      const { job: latest } = await ServiceGetLatestCompanyQuestionsJob();
      applied = latest?.id === job.id && latest.applied === true;
    } catch { /* Sem a confirmação, só atualiza a tela. */ }
    setJobId(null);
    callbacks.current.onCompleted(applied);
  }, []);

  const handleFailed = useCallback((errorCode: string | null) => {
    setJobId(null);
    // 401/403/404: sessão trocada ou job inexistente; não é falha da geração.
    if (errorCode === 'ia_job_not_found') return;
    callbacks.current.onFailed(errorCode);
  }, []);

  useAnalysisJobPolling({
    jobId,
    enabled,
    pollIntervalMs: POLL_INTERVAL_MS,
    onCompleted: handleCompleted,
    onFailed: handleFailed,
  });
}
