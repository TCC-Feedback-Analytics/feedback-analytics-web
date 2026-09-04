import { useEffect, useRef, useState } from 'react';
import {
  ServiceGetAnalysisJob,
  type IaAnalysisJob,
} from 'src/services/serviceFeedbacks';

export type UseAnalysisJobPollingOptions = {
  jobId: string | null;
  enabled?: boolean;
  pollIntervalMs?: number;
  onCompleted?: (job: IaAnalysisJob) => void;
  onFailed?: (errorCode: string | null) => void;
};

export function useAnalysisJobPolling({
  jobId,
  enabled = true,
  pollIntervalMs = 2500,
  onCompleted,
  onFailed,
}: UseAnalysisJobPollingOptions) {
  const [job, setJob] = useState<IaAnalysisJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  const onFailedRef = useRef(onFailed);
  onFailedRef.current = onFailed;

  useEffect(() => {
    if (!jobId || !enabled) {
      setJob(null);
      setIsPolling(false);
      return;
    }

    let isMounted = true;
    let timerId: number | null = null;
    let failures = 0;
    setConnectionError(false);

    const poll = async () => {
      setIsPolling(true);
      try {
        const jobData = await ServiceGetAnalysisJob(jobId);
        if (!isMounted) return;

        setJob(jobData);
        failures = 0;
        setConnectionError(false);

        if (jobData.status === 'completed') {
          setIsPolling(false);
          onCompletedRef.current?.(jobData);
          return;
        }

        if (jobData.status === 'failed') {
          setIsPolling(false);
          onFailedRef.current?.(jobData.errorCode);
          return;
        }

        // queued, running, waiting_budget -> agenda próxima chamada
        timerId = window.setTimeout(poll, pollIntervalMs);
      } catch (error) {
        if (!isMounted) return;
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 404) {
          setIsPolling(false);
          onFailedRef.current?.('ia_job_not_found');
          return;
        }
        // Uma falha de consulta não cancela nem perde o trabalho no servidor.
        failures += 1;
        setConnectionError(true);
        timerId = window.setTimeout(poll, Math.min(30_000, pollIntervalMs * 2 ** Math.min(failures, 4)));
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [jobId, enabled, pollIntervalMs]);

  return {
    job,
    status: job?.status ?? null,
    done: job?.done ?? 0,
    total: job?.total ?? 0,
    errorCode: job?.errorCode ?? null,
    isPolling,
    connectionError,
  };
}
