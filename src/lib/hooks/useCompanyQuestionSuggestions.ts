import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CompanyQuestionSuggestionsError,
  COMPANY_QUESTION_SUGGESTIONS_JOB_TYPE,
  ServiceGetCompanyQuestionSuggestions,
  ServiceRequestCompanyQuestionSuggestions,
  validateCompanyQuestionSuggestions,
  type CompanyQuestionSuggestion,
  type CompanyQuestionSuggestionsJob,
} from 'src/services/serviceCompanyQuestionSuggestions';

type SuggestionsStatus =
  | 'idle'
  | 'submitting'
  | 'queued'
  | 'running'
  | 'waiting_budget'
  | 'completed'
  | 'failed'
  | 'connection_error';

type StoredSuggestionJob = {
  jobId: string;
  contextHash: string;
  contextFingerprint: string;
  userId: string;
  enterpriseId: string;
};

function readStoredJob(key: string | null): StoredSuggestionJob | null {
  if (!key) return null;

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredSuggestionJob>;
    if (
      typeof parsed.jobId !== 'string' ||
      typeof parsed.contextHash !== 'string' ||
      typeof parsed.contextFingerprint !== 'string' ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.enterpriseId !== 'string'
    ) {
      return null;
    }

    return parsed as StoredSuggestionJob;
  } catch {
    return null;
  }
}

function writeStoredJob(key: string | null, value: StoredSuggestionJob | null) {
  if (!key) return;

  try {
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  } catch {
    // A consulta continua funcionando mesmo sem sessionStorage.
  }
}

export function clearCompanyQuestionSuggestionsSession(userId: string, enterpriseId: string) {
  writeStoredJob(`feedback:company-question-suggestions:${userId}:${enterpriseId}`, null);
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function useCompanyQuestionSuggestions({
  userId,
  enterpriseId,
  contextFingerprint,
  enabled = true,
}: {
  userId?: string | null;
  enterpriseId?: string | null;
  contextFingerprint: string;
  enabled?: boolean;
}) {
  const storageKey = useMemo(
    () =>
      userId && enterpriseId
        ? `feedback:company-question-suggestions:${userId}:${enterpriseId}`
        : null,
    [enterpriseId, userId],
  );
  const initialStoredJob = useMemo(() => readStoredJob(storageKey), [storageKey]);
  const [storedJob, setStoredJob] = useState<StoredSuggestionJob | null>(initialStoredJob);
  const [job, setJob] = useState<CompanyQuestionSuggestionsJob | null>(null);
  const [suggestions, setSuggestions] = useState<CompanyQuestionSuggestion[] | null>(null);
  const [status, setStatus] = useState<SuggestionsStatus>(initialStoredJob ? 'queued' : 'idle');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [resumeNonce, setResumeNonce] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const requestSequenceRef = useRef(0);

  const contextChanged = Boolean(
    storedJob && storedJob.contextFingerprint !== contextFingerprint,
  );

  const clearJob = useCallback(() => {
    writeStoredJob(storageKey, null);
    setStoredJob(null);
    setJob(null);
    setSuggestions(null);
    setErrorCode(null);
    setRetryAfterSeconds(null);
    setConnectionError(false);
    setStatus('idle');
  }, [storageKey]);

  useEffect(() => {
    requestSequenceRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;

    const nextStoredJob = readStoredJob(storageKey);
    setStoredJob(nextStoredJob);
    setJob(null);
    setSuggestions(null);
    setErrorCode(null);
    setRetryAfterSeconds(null);
    setConnectionError(false);
    setStatus(nextStoredJob ? 'queued' : 'idle');
  }, [storageKey]);

  useEffect(() => {
    if (!storedJob || !contextChanged) return;
    setConnectionError(false);
  }, [contextChanged, storedJob]);

  const request = useCallback(async () => {
    if (!enabled || !userId || !enterpriseId || requestRef.current || storedJob) return false;

    const requestSequence = ++requestSequenceRef.current;
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus('submitting');
    setErrorCode(null);
    setRetryAfterSeconds(null);
    setConnectionError(false);

    try {
      const response = await ServiceRequestCompanyQuestionSuggestions(controller.signal);
      if (requestSequence !== requestSequenceRef.current) return false;

      const nextStoredJob: StoredSuggestionJob = {
        jobId: response.jobId,
        contextHash: response.contextHash,
        contextFingerprint,
        userId,
        enterpriseId,
      };

      writeStoredJob(storageKey, nextStoredJob);
      setStoredJob(nextStoredJob);
      setStatus(response.status);
      return true;
    } catch (error) {
      if (isAbortError(error) || requestSequence !== requestSequenceRef.current) return false;

      const suggestionError = error as CompanyQuestionSuggestionsError;
      setErrorCode(suggestionError.code ?? 'request_failed');
      setRetryAfterSeconds(suggestionError.retryAfterSeconds ?? null);
      setStatus('failed');
      return false;
    } finally {
      if (requestSequence === requestSequenceRef.current) requestRef.current = null;
    }
  }, [contextFingerprint, enabled, enterpriseId, storageKey, storedJob, userId]);

  useEffect(() => {
    const jobId = storedJob?.jobId;
    if (!enabled || !jobId || contextChanged) return;

    let disposed = false;
    let timer: number | null = null;
    let inFlight = false;
    let failures = 0;
    let currentRequest: AbortController | null = null;

    const schedule = (delayMs: number) => {
      if (disposed) return;
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => void poll(), delayMs);
    };

    const poll = async () => {
      if (disposed || inFlight || document.visibilityState === 'hidden') return;

      inFlight = true;
      currentRequest = new AbortController();

      try {
        const nextJob = await ServiceGetCompanyQuestionSuggestions(jobId, currentRequest.signal);
        if (disposed) return;

        failures = 0;
        setJob(nextJob);
        setStatus(nextJob.status);
        setConnectionError(false);
        setErrorCode(nextJob.errorCode ?? null);

        if (
          nextJob.jobType !== COMPANY_QUESTION_SUGGESTIONS_JOB_TYPE ||
          (nextJob.scopeType && nextJob.scopeType !== 'COMPANY')
        ) {
          setErrorCode('invalid_question_generation_job');
          setStatus('failed');
          writeStoredJob(storageKey, null);
          setStoredJob(null);
          return;
        }

        if (nextJob.status === 'completed') {
          const validSuggestions = validateCompanyQuestionSuggestions(
            nextJob.result,
            storedJob.contextHash,
          );

          if (!validSuggestions) {
            setErrorCode('invalid_ai_response_schema');
            setStatus('failed');
          } else {
            setSuggestions(validSuggestions);
            setStatus('completed');
          }

          writeStoredJob(storageKey, null);
          setStoredJob(null);
          return;
        }

        if (nextJob.status === 'failed') {
          setErrorCode(nextJob.errorCode ?? 'unexpected_error');
          writeStoredJob(storageKey, null);
          setStoredJob(null);
          return;
        }

        schedule(nextJob.status === 'waiting_budget' ? 8000 : 3500);
      } catch (error) {
        if (disposed || isAbortError(error)) return;

        const suggestionError = error as CompanyQuestionSuggestionsError;
        if (suggestionError.status === 401 || suggestionError.status === 404) {
          setErrorCode(suggestionError.code || (suggestionError.status === 404 ? 'ia_job_not_found' : 'unauthorized'));
          setStatus('failed');
          writeStoredJob(storageKey, null);
          setStoredJob(null);
          return;
        }

        failures += 1;
        setConnectionError(true);
        setStatus('connection_error');
        setErrorCode(suggestionError.code ?? 'service_unavailable');
        schedule(
          suggestionError.retryAfterSeconds
            ? suggestionError.retryAfterSeconds * 1000
            : Math.min(30000, 3500 * 2 ** Math.min(failures, 4)),
        );
      } finally {
        inFlight = false;
        currentRequest = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void poll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void poll();

    return () => {
      disposed = true;
      if (timer !== null) window.clearTimeout(timer);
      currentRequest?.abort();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [contextChanged, enabled, resumeNonce, storageKey, storedJob]);

  useEffect(() => () => {
    requestSequenceRef.current += 1;
    requestRef.current?.abort();
  }, []);

  const resume = useCallback(() => {
    setConnectionError(false);
    setResumeNonce((current) => current + 1);
  }, []);

  return {
    request,
    resume,
    clearJob,
    job,
    suggestions,
    status,
    errorCode,
    retryAfterSeconds,
    connectionError,
    contextChanged,
    isRequesting: status === 'submitting',
    hasActiveJob: Boolean(storedJob),
  };
}
