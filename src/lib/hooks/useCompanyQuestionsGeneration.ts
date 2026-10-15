import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalysisJobPolling } from './useAnalysisJobPolling';
import { getIaFailureNotice, type IaFailureNotice } from 'src/lib/utils/iaErrorMapper';
import {
  ServiceGetLatestCompanyQuestionsJob,
  type CompanyQuestionsJob,
  type IaAnalysisJob,
} from 'src/services/serviceFeedbacks';

const ACTIVE_STATUSES = new Set(['queued', 'running', 'waiting_budget']);
const POLL_INTERVAL_MS = 5000;

export type CompanyQuestionsGenerationPhase = 'idle' | 'running' | 'completed' | 'failed';

export type CompanyQuestionsGenerationState = {
  phase: CompanyQuestionsGenerationPhase;
  errorCode: string | null;
  /** As perguntas geradas foram gravadas (false: perguntas padrão ou já editadas mantidas). */
  applied: boolean;
  /** Consulta o pedido mais recente agora e passa a acompanhá-lo até o fim. */
  track: () => Promise<void>;
};

export type CompanyQuestionsFailureNotice = Omit<IaFailureNotice, 'category'>;

/** Aviso da falha terminal da geração: o motivo pela categoria do erro e o que fazer. */
export function getCompanyQuestionsFailureNotice(
  errorCode: string | null,
  model: string | null,
): CompanyQuestionsFailureNotice {
  return getIaFailureNotice({
    errorCode,
    model,
    task: 'gerar as perguntas',
    outcome: 'As perguntas padrão foram mantidas.',
  }) ?? {
    title: 'Perguntas padrão mantidas',
    description: 'A IA não conseguiu gerar as perguntas agora. Você pode personalizá-las em Configurar perguntas.',
  };
}

/**
 * Acompanha a geração automática das 3 perguntas da configuração inicial. O
 * gateway enfileira o pedido ao salvar o contexto ou a IA; aqui a Web descobre
 * o job a cada revalidação do layout (ou quando `track` é chamado) e faz o
 * polling, que também destrava a fila quando o provedor pede para esperar (429).
 * `onCompleted`/`onFailed` disparam só quando o fim foi acompanhado pelo polling.
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
}): CompanyQuestionsGenerationState {
  const [jobId, setJobId] = useState<string | null>(null);
  const [phase, setPhase] = useState<CompanyQuestionsGenerationPhase>('idle');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const callbacks = useRef({ onCompleted, onFailed });
  callbacks.current = { onCompleted, onFailed };
  // Job cujo fim o polling já acompanhou: uma leitura atrasada não o reabre.
  const finishedJobId = useRef<string | null>(null);
  const jobIdRef = useRef(jobId);
  jobIdRef.current = jobId;

  const follow = useCallback((job: CompanyQuestionsJob) => {
    if (job.id === finishedJobId.current) return;
    setJobId(job.id);
    setPhase('running');
    setErrorCode(null);
    setApplied(false);
  }, []);

  useEffect(() => {
    if (!enabled || jobId) return;
    let cancelled = false;
    ServiceGetLatestCompanyQuestionsJob()
      .then(({ job }) => {
        if (!cancelled && job && ACTIVE_STATUSES.has(job.status)) follow(job);
      })
      .catch(() => { /* Sem acompanhamento agora; a próxima revalidação tenta de novo. */ });
    return () => { cancelled = true; };
  }, [enabled, refreshKey, jobId, follow]);

  const track = useCallback(async () => {
    try {
      const { job } = await ServiceGetLatestCompanyQuestionsJob();
      if (job && ACTIVE_STATUSES.has(job.status)) {
        follow(job);
        return;
      }
      setJobId(null);
      if (job?.status === 'failed') {
        setPhase('failed');
        setErrorCode(job.errorCode);
        setApplied(false);
        return;
      }
      // Concluído antes da consulta ou nada enfileirado (cooldown, limite diário,
      // perguntas já editadas): não há o que esperar.
      setPhase('completed');
      setErrorCode(null);
      setApplied(job?.applied === true);
    } catch {
      setJobId(null);
      setPhase('failed');
      setErrorCode(null);
      setApplied(false);
    }
  }, [follow]);

  const handleCompleted = useCallback(async (job: IaAnalysisJob) => {
    let wasApplied = false;
    try {
      const { job: latest } = await ServiceGetLatestCompanyQuestionsJob();
      wasApplied = latest?.id === job.id && latest.applied === true;
    } catch { /* Sem a confirmação, só atualiza a tela. */ }
    finishedJobId.current = job.id;
    setJobId(null);
    setPhase('completed');
    setApplied(wasApplied);
    callbacks.current.onCompleted(wasApplied);
  }, []);

  const handleFailed = useCallback((code: string | null) => {
    finishedJobId.current = jobIdRef.current;
    setJobId(null);
    // 401/403/404: sessão trocada ou job inexistente; não é falha da geração.
    if (code === 'ia_job_not_found') {
      setPhase('idle');
      return;
    }
    setPhase('failed');
    setErrorCode(code);
    setApplied(false);
    callbacks.current.onFailed(code);
  }, []);

  useAnalysisJobPolling({
    jobId,
    enabled,
    pollIntervalMs: POLL_INTERVAL_MS,
    onCompleted: handleCompleted,
    onFailed: handleFailed,
  });

  return { phase, errorCode, applied, track };
}
