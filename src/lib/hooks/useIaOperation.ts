import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router-dom';
import { useAnalysisJobPolling } from './useAnalysisJobPolling';
import { getIaErrorMessage } from 'src/lib/utils/iaErrorMapper';
import type { IaOperationStatus } from 'src/lib/context/insightsControls.types';
import { ServiceGetActiveAnalysisJobs, type IaAnalysisJob } from 'src/services/serviceFeedbacks';

type Result = { analyzedCount?: number; reportGenerated?: boolean };
type Response = { ok?: boolean; jobId?: string; error?: string };

function readSavedJob(key: string | null) {
  try { return key ? localStorage.getItem(key) : null; } catch { return null; }
}

/** HTTP 202 inicia acompanhamento. Somente o job confirma o resultado. */
export function useIaOperation({ kind, onSuccess, onError, enterpriseId }: {
  kind: 'analyze_raw' | 'regenerate_insights';
  onSuccess: (result: Result) => void;
  onError: (message: string) => void;
  enterpriseId?: string;
}) {
  const fetcher = useFetcher();
  const storageKey = enterpriseId ? `feedback:ia-job:${enterpriseId}:${kind}` : null;
  const [status, setStatus] = useState<IaOperationStatus>(() => readSavedJob(storageKey) ? 'running' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(() => readSavedJob(storageKey));
  const [details, setDetails] = useState<IaAnalysisJob | null>(null);
  const [startedAt, setStartedAt] = useState(() => jobId ? Date.now() : 0);
  const activeRef = useRef(Boolean(jobId));
  const requestDetails = useRef<Pick<IaAnalysisJob, 'scopeType' | 'catalogItemId' | 'phase'>>({ scopeType: 'COMPANY', catalogItemId: null });
  const awaitingResponse = useRef(false);
  const callbacks = useRef({ onSuccess, onError });
  callbacks.current = { onSuccess, onError };

  const remember = useCallback((id: string | null) => {
    try {
      if (storageKey) {
        if (id) localStorage.setItem(storageKey, id);
        else localStorage.removeItem(storageKey);
      }
    } catch { /* O endpoint de recuperação continua disponível sem storage. */ }
  }, [storageKey]);

  useEffect(() => {
    if (!enterpriseId || activeRef.current) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const recover = async () => {
      try {
        const { jobs } = await ServiceGetActiveAnalysisJobs();
        if (cancelled || activeRef.current) return;
        const active = jobs.find(job => job.jobType === kind);
        if (!active) return;
        activeRef.current = true;
        setDetails(active);
        setStartedAt(Date.parse(active.updatedAt ?? '') || Date.now());
        setJobId(active.id);
        remember(active.id);
        setStatus('running');
      } catch {
        if (!cancelled) timer = setTimeout(recover, 5000);
      }
    };
    void recover();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [enterpriseId, kind, remember]);

  const fail = useCallback((message: string) => {
    activeRef.current = false;
    awaitingResponse.current = false;
    setJobId(null);
    remember(null);
    setError(message);
    setStatus('failed');
    callbacks.current.onError(message);
  }, [remember]);

  const succeed = useCallback((result: Result) => {
    activeRef.current = false;
    setJobId(null);
    remember(null);
    setStatus('succeeded');
    callbacks.current.onSuccess(result);
  }, [remember]);

  const polling = useAnalysisJobPolling({
    jobId,
    onCompleted: (job) => {
      setDetails(job);
      if (job.done < job.total) {
        fail('O processamento terminou sem concluir todos os itens. Tente novamente.');
        return;
      }
      succeed(kind === 'analyze_raw' ? { analyzedCount: job.done } : { reportGenerated: true });
    },
    onFailed: (code) => fail(getIaErrorMessage(code)),
  });

  useEffect(() => {
    if (fetcher.state !== 'idle' || !awaitingResponse.current) return;
    awaitingResponse.current = false;
    const data = fetcher.data as Response | undefined;
    if (!data?.ok) {
      fail(data?.error || 'Não foi possível concluir o processamento de IA. Tente novamente.');
    } else if (data.jobId) {
      // O HTTP 202 só confirma o enfileiramento, não o sucesso do processamento.
      setJobId(data.jobId);
      remember(data.jobId);
      setDetails({ id: data.jobId, jobType: kind, ...requestDetails.current,
        status: 'queued', done: 0, total: 0, errorCode: null, updatedAt: null });
    } else {
      fail(kind === 'regenerate_insights'
        ? 'Nenhum relatório foi gerado. Verifique se há feedbacks analisados suficientes e tente novamente.'
        : 'A análise não confirmou sua conclusão. Tente novamente.');
    }
  }, [fetcher.state, fetcher.data, kind, fail, remember]);

  const submit = useCallback((form: FormData) => {
    if (activeRef.current) return;
    activeRef.current = true;
    awaitingResponse.current = true;
    requestDetails.current = {
      scopeType: (String(form.get('scope_type') || 'COMPANY')) as IaAnalysisJob['scopeType'],
      catalogItemId: String(form.get('catalog_item_id') || '') || null,
      phase: kind === 'analyze_raw' || form.get('analyze_pending') === 'true' ? 'analyzing' : 'generating',
    };
    setDetails(null);
    setStartedAt(Date.now());
    setError(null);
    setStatus('running');
    // Também cobre falhas do router anteriores à resposta da action.
    try {
      void Promise.resolve(fetcher.submit(form, { method: 'post', action: '/user/insights/reports' }))
        .catch(() => fail('Não foi possível iniciar o processamento de IA. Tente novamente.'));
    } catch {
      fail('Não foi possível iniciar o processamento de IA. Tente novamente.');
    }
  }, [fetcher, fail, kind]);

  return {
    submit, status, error,
    progress: jobId ? { done: polling.done, total: polling.total } : null,
    job: polling.job?.id === jobId ? polling.job : details,
    connectionError: polling.connectionError,
    startedAt,
  };
}
