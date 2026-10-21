import { useCallback, useEffect, useState } from 'react';
import type { ScopeDiagnosis } from 'lib/interfaces/contracts/ia-analyze/scope-diagnosis.contract';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { metricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import { browserTimeZone } from 'src/lib/utils/timeline';
import { useAnalysisJobPolling } from './useAnalysisJobPolling';
import type { IaAnalysisJobStatus } from 'src/services/serviceFeedbacks';
import {
  ServiceGetLatestScopeDiagnosis,
  ServiceRequestScopeDiagnosis,
} from 'src/services/serviceScopeDiagnosis';

export type ScopeDiagnosisState = {
  diagnosis: ScopeDiagnosis | null;
  loading: boolean;
  loadFailed: boolean;
  /** Pedido enviado ou job em andamento. */
  generating: boolean;
  jobStatus: IaAnalysisJobStatus | null;
  /** Código da última falha (do pedido ou do job); `null` sem falha. */
  failureCode: string | null;
  generate: (options?: { force?: boolean }) => Promise<void>;
};

type Loaded = { key: string; diagnosis: ScopeDiagnosis | null; failed: boolean };

/**
 * Diagnóstico do escopo do cabeçalho: o último guardado, pedir um novo para o
 * período escolhido e acompanhar o job até o resultado. `enabled: false` (sem IA
 * ou conta zerada) não consulta nada.
 */
export function useScopeDiagnosis({ enabled }: { enabled: boolean }): ScopeDiagnosisState {
  const { scope, catalogItemId, period } = useInsightsControls();
  const itemId = scope !== 'COMPANY' ? catalogItemId || undefined : undefined;
  const key = `${scope}:${itemId ?? ''}`;

  const [loaded, setLoaded] = useState<Loaded>({ key: '', diagnosis: null, failed: false });
  const [reloadTick, setReloadTick] = useState(0);
  const [job, setJob] = useState<{ key: string; id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<{ key: string; code: string } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    ServiceGetLatestScopeDiagnosis({ scope_type: scope, catalog_item_id: itemId })
      .then((data) => {
        if (cancelled) return;
        setLoaded({ key, diagnosis: data.diagnosis, failed: false });
        // Um job em andamento (outra aba, recarregou a página) continua sendo acompanhado.
        if (data.job && data.job.status !== 'completed' && data.job.status !== 'failed') {
          setJob({ key, id: data.job.id });
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key, diagnosis: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, key, scope, itemId, reloadTick]);

  const reload = useCallback(() => setReloadTick((tick) => tick + 1), []);
  const activeJobId = job && job.key === key ? job.id : null;

  const polling = useAnalysisJobPolling({
    jobId: activeJobId,
    enabled: enabled && Boolean(activeJobId),
    onCompleted: () => {
      setJob(null);
      setFailure(null);
      reload();
    },
    onFailed: (errorCode) => {
      setJob(null);
      setFailure({ key, code: errorCode ?? 'unknown_error' });
    },
  });

  const generate = useCallback(async (options?: { force?: boolean }) => {
    setSubmitting(true);
    setFailure(null);
    try {
      const accepted = await ServiceRequestScopeDiagnosis({
        scope_type: scope,
        catalog_item_id: itemId,
        ...metricsPeriodParams(period),
        tz: browserTimeZone(),
        force: options?.force === true,
      });
      if (accepted.cached || !accepted.jobId) reload();
      else setJob({ key, id: accepted.jobId });
    } catch (error) {
      setFailure({ key, code: (error as { code?: string })?.code ?? 'unknown_error' });
    } finally {
      setSubmitting(false);
    }
  }, [scope, itemId, period, key, reload]);

  const fresh = loaded.key === key;
  return {
    diagnosis: fresh ? loaded.diagnosis : null,
    loading: enabled && !fresh,
    loadFailed: fresh && loaded.failed,
    generating: submitting || Boolean(activeJobId),
    jobStatus: activeJobId ? polling.status : null,
    failureCode: failure && failure.key === key ? failure.code : null,
    generate,
  };
}
