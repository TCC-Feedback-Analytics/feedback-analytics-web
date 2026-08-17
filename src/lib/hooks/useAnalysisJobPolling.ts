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

    const poll = async () => {
      setIsPolling(true);
      try {
        const jobData = await ServiceGetAnalysisJob(jobId);
        if (!isMounted) return;

        setJob(jobData);

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
      } catch {
        if (!isMounted) return;
        setIsPolling(false);
        onFailedRef.current?.('unexpected_error');
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
  };
}
