import type {
  ScopeDiagnosis,
  ScopeDiagnosisAccepted,
} from 'lib/interfaces/contracts/ia-analyze/scope-diagnosis.contract';
import type { FeedbackStatsOptions } from 'lib/interfaces/domain/feedback.domain';
import { getJson, postJson } from 'src/lib/utils/http';
import type { MetricsPeriodParams } from 'src/lib/utils/metricsPeriod';
import type { IaAnalysisJob } from './serviceFeedbacks';

/**
 * Diagnóstico do escopo com IA: a IA lê os números do escopo no período (e no
 * anterior) e diz o que vai bem, o que preocupa e o que fazer.
 */
export type ScopeDiagnosisRequestBody = FeedbackStatsOptions & MetricsPeriodParams & {
  tz: string;
  /** Gera de novo mesmo sem dados novos. */
  force?: boolean;
};

export type ScopeDiagnosisLatestResponse = {
  diagnosis: ScopeDiagnosis | null;
  /** Job em andamento do mesmo escopo, se houver. */
  job: IaAnalysisJob | null;
};

/** 202 com o job ou 200 com `cached` (o mesmo recorte e os mesmos dados já têm diagnóstico). */
export function ServiceRequestScopeDiagnosis(body: ScopeDiagnosisRequestBody) {
  return postJson<ScopeDiagnosisAccepted>('/api/protected/ia-analyze/scope-diagnosis', body);
}

export function ServiceGetLatestScopeDiagnosis(params: FeedbackStatsOptions) {
  const searchParams = new URLSearchParams();
  if (params.scope_type) searchParams.append('scope_type', params.scope_type);
  if (params.catalog_item_id) searchParams.append('catalog_item_id', params.catalog_item_id);
  const query = searchParams.toString();
  return getJson<ScopeDiagnosisLatestResponse>(
    `/api/protected/ia-analyze/scope-diagnosis/latest${query ? `?${query}` : ''}`,
  );
}
