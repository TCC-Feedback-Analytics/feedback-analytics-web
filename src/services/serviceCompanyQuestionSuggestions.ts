import { requestApi } from 'src/lib/utils/http';

export const COMPANY_QUESTION_SUGGESTIONS_JOB_TYPE = 'generate_company_questions' as const;

export type CompanyQuestionSuggestionStatus =
  | 'queued'
  | 'running'
  | 'waiting_budget'
  | 'completed'
  | 'failed';

export type CompanyQuestionSuggestion = {
  question_order: number;
  question_text: string;
};

export type CompanyQuestionSuggestionsResult = {
  contextHash: string;
  questions: CompanyQuestionSuggestion[];
};

export type CompanyQuestionSuggestionsJob = {
  id: string;
  jobType: string;
  scopeType?: string | null;
  catalogItemId?: string | null;
  status: CompanyQuestionSuggestionStatus;
  total: number;
  done: number;
  errorCode: string | null;
  updatedAt: string | null;
  phase?: string | null;
  result?: CompanyQuestionSuggestionsResult | null;
};

export type EnqueueCompanyQuestionSuggestionsResponse = {
  jobId: string;
  status: Extract<CompanyQuestionSuggestionStatus, 'queued' | 'running' | 'waiting_budget'>;
  deduped: boolean;
  contextHash: string;
};

export class CompanyQuestionSuggestionsError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      retryAfterSeconds?: number;
    } = {},
  ) {
    super(message);
    this.name = 'CompanyQuestionSuggestionsError';
    this.status = options.status;
    this.code = options.code;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

type ErrorPayload = {
  error?: unknown;
  message?: unknown;
  retryAfterSeconds?: unknown;
};

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function readRetryAfter(response: Response, payload: ErrorPayload | null): number | undefined {
  if (typeof payload?.retryAfterSeconds === 'number' && Number.isFinite(payload.retryAfterSeconds)) {
    return Math.max(0, Math.ceil(payload.retryAfterSeconds));
  }

  const header = response.headers.get('Retry-After');
  if (!header) return undefined;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));

  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, Math.ceil((date - Date.now()) / 1000));

  return undefined;
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await requestApi(path, init);
  const payload = await readJson<T & ErrorPayload>(response);

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload | null;
    const code = typeof errorPayload?.error === 'string' ? errorPayload.error : undefined;
    const message =
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : code || 'Não foi possível processar as sugestões de perguntas.';

    throw new CompanyQuestionSuggestionsError(message, {
      status: response.status,
      code,
      retryAfterSeconds: readRetryAfter(response, errorPayload),
    });
  }

  if (!payload) {
    throw new CompanyQuestionSuggestionsError('A API retornou uma resposta vazia.', {
      status: response.status,
    });
  }

  return payload as T;
}

export function ServiceRequestCompanyQuestionSuggestions(signal?: AbortSignal) {
  return requestJson<EnqueueCompanyQuestionSuggestionsResponse>(
    '/api/protected/user/company-feedback-questions/suggestions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal,
    },
  );
}

export function ServiceGetCompanyQuestionSuggestions(jobId: string, signal?: AbortSignal) {
  return requestJson<CompanyQuestionSuggestionsJob>(
    `/api/protected/user/company-feedback-questions/suggestions/${encodeURIComponent(jobId)}`,
    { method: 'GET', signal },
  );
}

export function validateCompanyQuestionSuggestions(
  result: CompanyQuestionSuggestionsResult | null | undefined,
  expectedContextHash?: string | null,
): CompanyQuestionSuggestion[] | null {
  if (!result || typeof result.contextHash !== 'string' || !Array.isArray(result.questions)) {
    return null;
  }

  if (expectedContextHash && result.contextHash !== expectedContextHash) {
    return null;
  }

  if (result.questions.length !== 3) return null;

  const orders = new Set<number>();
  const normalized = result.questions.map((question) => {
    if (!question || typeof question !== 'object') return null;

    const order = Number(question.question_order);
    const text = typeof question.question_text === 'string' ? question.question_text.trim() : '';

    if (!Number.isInteger(order) || order < 1 || order > 3 || orders.has(order)) return null;
    if (text.length < 20 || text.length > 150) return null;

    orders.add(order);
    return { question_order: order, question_text: text };
  });

  if (normalized.some((question) => question === null) || orders.size !== 3) return null;

  const ordered = normalized as CompanyQuestionSuggestion[];
  return ordered.sort((left, right) => left.question_order - right.question_order);
}
