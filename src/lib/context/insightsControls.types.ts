import type {
  InsightScopeOption,
  InsightsCatalogItemOption,
} from 'components/user/pages/feedbacksInsightsReport/ui.types';
import type { IaAnalysisJob } from 'src/services/serviceFeedbacks';

export interface AnalysisProgress {
  done: number;
  total: number;
}

export type IaOperationStatus = 'idle' | 'running' | 'succeeded' | 'failed';

export interface InsightsControlsContextValue {
  scope: InsightScopeOption;
  setScope: (scope: InsightScopeOption) => void;
  catalogItemId: string;
  setCatalogItemId: (id: string) => void;
  catalogItemOptions: InsightsCatalogItemOption[];
  setCatalogItemOptions: (opts: InsightsCatalogItemOption[]) => void;
  availableScopes: InsightScopeOption[];
  setAvailableScopes: (scopes: InsightScopeOption[]) => void;
  canAnalyze: boolean;
  setCanAnalyze: (can: boolean) => void;
  analyzeRaw: () => void;
  regenerateInsights: (options?: { analyzePending?: boolean; force?: boolean }) => void;
  isAnalyzingRaw: boolean;
  isRegeneratingInsights: boolean;
  rawStatus: IaOperationStatus;
  insightsStatus: IaOperationStatus;
  rawError: string | null;
  insightsError: string | null;
  rawProgress?: AnalysisProgress | null;
  insightsProgress?: AnalysisProgress | null;
  activeJob?: IaAnalysisJob | null;
  pollingWarning?: boolean;
  operationStatus?: IaOperationStatus;
  operationError?: string | null;
  operationScope?: Pick<IaAnalysisJob, 'scopeType' | 'catalogItemId'> | null;
}

export interface InsightsControlsInitialData {
  availableScopes: InsightScopeOption[];
  catalogItemOptions: InsightsCatalogItemOption[];
  canAnalyze: boolean;
}

