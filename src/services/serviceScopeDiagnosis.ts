import type {
  ScopeDiagnosis,
  ScopeDiagnosisAccepted,
  ScopeDiagnosisPeriod,
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

/** Uma linha do histórico: só o resumo; o diagnóstico completo vem por id. */
export type ScopeDiagnosisSummary = {
  id: string;
  period: ScopeDiagnosisPeriod;
  feedbackCount: number;
  model: string | null;
  createdAt: string;
  summary: string;
};

function scopeQuery(params: FeedbackStatsOptions): string {
  const searchParams = new URLSearchParams();
  if (params.scope_type) searchParams.append('scope_type', params.scope_type);
  if (params.catalog_item_id) searchParams.append('catalog_item_id', params.catalog_item_id);
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function ServiceGetLatestScopeDiagnosis(params: FeedbackStatsOptions) {
  return getJson<ScopeDiagnosisLatestResponse>(`/api/protected/ia-analyze/scope-diagnosis/latest${scopeQuery(params)}`);
}

/** Histórico do escopo, do mais novo ao mais antigo (os 20 últimos). */
export function ServiceListScopeDiagnoses(params: FeedbackStatsOptions) {
  return getJson<{ items: ScopeDiagnosisSummary[] }>(`/api/protected/ia-analyze/scope-diagnosis${scopeQuery(params)}`);
}

export function ServiceGetScopeDiagnosis(id: string) {
  return getJson<ScopeDiagnosis>(`/api/protected/ia-analyze/scope-diagnosis/${encodeURIComponent(id)}`);
}
