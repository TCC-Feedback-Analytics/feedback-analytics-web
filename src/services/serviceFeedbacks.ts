import type {
  FeedbacksResponse,
  FeedbackStats,
  FeedbackFilters,
  FeedbackAnalysisResponse,
  FeedbackInsightsReport,
  FeedbackAnalysisOptions,
  FeedbackInsightsReportOptions,
  FeedbackStatsOptions,
  FeedbackQuestionsOptions,
  FeedbackQuestionsResponse,
} from 'lib/interfaces/domain/feedback.domain';
import type {
  IaAnalyzeRawRunRequest,
  IaAnalyzeRawRunResponse,
  IaAnalyzeRegenerateInsightsRequest,
  IaAnalyzeRegenerateInsightsResponse,
} from 'lib/interfaces/contracts/ia-analyze/run.contract';
import { getJson, postJson } from 'src/lib/utils/http';

export function ServiceGetFeedbacks(filters: FeedbackFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.rating) params.append('rating', filters.rating.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.item) params.append('item', filters.item);

  const queryString = params.toString();
  const url = `/api/protected/user/feedbacks${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbacksResponse>(url);
}

export function ServiceGetFeedbackStats(params?: FeedbackStatsOptions) {
  const searchParams = new URLSearchParams();

  if (params?.scope_type) {
    searchParams.append('scope_type', params.scope_type);
  }

  if (params?.catalog_item_id) {
    searchParams.append('catalog_item_id', params.catalog_item_id);
  }

  const queryString = searchParams.toString();
  const url = `/api/protected/user/feedbacks/stats${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbackStats>(url);
}

export function ServiceGetFeedbackAnalysis(params?: FeedbackAnalysisOptions) {
  const searchParams = new URLSearchParams();

  if (params?.sentiment) {
    searchParams.append('sentiment', params.sentiment);
  }

  if (params?.scope_type) {
    searchParams.append('scope_type', params.scope_type);
  }

  if (params?.catalog_item_id) {
    searchParams.append('catalog_item_id', params.catalog_item_id);
  }

  const queryString = searchParams.toString();
  const url = `/api/protected/user/feedbacks/analysis${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbackAnalysisResponse>(url);
}

export function ServiceGetFeedbackQuestions(params?: FeedbackQuestionsOptions) {
  const searchParams = new URLSearchParams();

  if (params?.scope_type) {
    searchParams.append('scope_type', params.scope_type);
  }

  if (params?.catalog_item_id) {
    searchParams.append('catalog_item_id', params.catalog_item_id);
  }

  const queryString = searchParams.toString();
  const url = `/api/protected/user/feedbacks/questions${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbackQuestionsResponse>(url);
}

export function ServiceGetFeedbackInsightsReport(
  params?: FeedbackInsightsReportOptions,
) {
  const searchParams = new URLSearchParams();

  if (params?.scope_type) {
    searchParams.append('scope_type', params.scope_type);
  }

  if (params?.catalog_item_id) {
    searchParams.append('catalog_item_id', params.catalog_item_id);
  }

  const queryString = searchParams.toString();
  const url = `/api/protected/user/feedbacks/insights/report${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbackInsightsReport>(
    url,
  );
}

export type IaAnalysisJobStatus =
  | 'queued'
  | 'running'
  | 'waiting_budget'
  | 'completed'
  | 'failed';

export type IaAnalysisJobType = 'analyze_raw' | 'regenerate_insights';

export interface IaAnalysisJob {
  id: string;
  jobType: IaAnalysisJobType;
  scopeType: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
  catalogItemId: string | null;
  status: IaAnalysisJobStatus;
  total: number;
  done: number;
  errorCode: string | null;
  updatedAt: string | null;
  phase?: 'analyzing' | 'generating' | 'synthesizing';
}

export type FeedbackIaAsyncResponse = {
  jobId: string;
  status: IaAnalysisJobStatus;
};

export type FeedbackIaRawRunResult = IaAnalyzeRawRunResponse;
export type FeedbackIaRawRunOptions = IaAnalyzeRawRunRequest;

export type FeedbackIaRegenerateInsightsResult = IaAnalyzeRegenerateInsightsResponse;
export type FeedbackIaRegenerateInsightsOptions = IaAnalyzeRegenerateInsightsRequest & { analyze_pending?: boolean };

export function ServiceRunRawFeedbackAnalysis(options?: FeedbackIaRawRunOptions) {
  return postJson<FeedbackIaAsyncResponse>(
    '/api/protected/ia-analyze/analyze-raw',
    options ?? {},
  );
}

export function ServiceRunFeedbackIAAnalysis(options?: FeedbackIaRegenerateInsightsOptions) {
  return postJson<FeedbackIaAsyncResponse>(
    '/api/protected/ia-analyze/regenerate-insights',
    options ?? {},
  );
}

export function ServiceGetAnalysisJob(jobId: string) {
  return getJson<IaAnalysisJob>(`/api/protected/ia-analyze/jobs/${jobId}`);
}

export function ServiceGetActiveAnalysisJobs() {
  return getJson<{ jobs: IaAnalysisJob[] }>('/api/protected/ia-analyze/jobs');
}

/** Pedido mais recente de geração das perguntas da configuração inicial. */
export type CompanyQuestionsJob = {
  id: string;
  status: IaAnalysisJobStatus;
  errorCode: string | null;
  applied: boolean | null;
};

export function ServiceGetLatestCompanyQuestionsJob() {
  return getJson<{ job: CompanyQuestionsJob | null }>('/api/protected/ia-analyze/jobs/company-questions/latest');
}

/**
 * O que aconteceu ao pedir de novo a geração das perguntas (ao trocar o modelo ou
 * em "Tentar de novo"): queued/running seguem o pedido; os demais dizem por que não saiu.
 */
export type QuestionsGenerationResult =
  | { status: 'queued' | 'running' | 'completed' | 'customized' }
  | { status: 'rate_limited'; retryAfterSeconds: number }
  | { status: 'unavailable'; code: string };

/** "Tentar de novo" a geração das perguntas com o modelo atual. */
export function ServiceRetryCompanyQuestions() {
  return postJson<{ questionsGeneration: QuestionsGenerationResult }>(
    '/api/protected/ia-analyze/jobs/company-questions/retry',
    {},
  );
}

