import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalysisJobPolling } from './useAnalysisJobPolling';
import {
  ServiceGetLatestCompanyQuestionsJob,
  type IaAnalysisJob,
} from 'src/services/serviceFeedbacks';

const ACTIVE_STATUSES = new Set(['queued', 'running', 'waiting_budget']);
const POLL_INTERVAL_MS = 5000;

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
