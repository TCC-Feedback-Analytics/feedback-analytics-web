import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCompanyQuestionsFailureNotice, useCompanyQuestionsGeneration } from './useCompanyQuestionsGeneration';
import {
  ServiceGetAnalysisJob,
  ServiceGetLatestCompanyQuestionsJob,
  type CompanyQuestionsJob,
  type IaAnalysisJob,
} from 'src/services/serviceFeedbacks';

vi.mock('src/services/serviceFeedbacks', () => ({
  ServiceGetAnalysisJob: vi.fn(),
  ServiceGetLatestCompanyQuestionsJob: vi.fn(),
}));

let latest: CompanyQuestionsJob | null = null;

function polled(status: IaAnalysisJob['status'], errorCode: string | null = null): IaAnalysisJob {
  return { id: 'job-q', jobType: 'analyze_raw', scopeType: 'COMPANY', catalogItemId: null,
    status, total: 1, done: status === 'completed' ? 1 : 0, errorCode, updatedAt: null };
}

beforeEach(() => {
  vi.resetAllMocks();
  latest = null;
  vi.mocked(ServiceGetLatestCompanyQuestionsJob).mockImplementation(async () => ({ job: latest }));
});

function setup() {
  const onCompleted = vi.fn();
  const onFailed = vi.fn();
  const hook = renderHook(() => useCompanyQuestionsGeneration({ enabled: true, refreshKey: 1, onCompleted, onFailed }));
  return { ...hook, onCompleted, onFailed };
}

describe('useCompanyQuestionsGeneration — track()', () => {
  it('sem pedido enfileirado conclui sem aplicar e sem avisar', async () => {
    const t = setup();
    await act(async () => { await t.result.current.track(); });
    expect(t.result.current.phase).toBe('completed');
    expect(t.result.current.applied).toBe(false);
    expect(t.onCompleted).not.toHaveBeenCalled();
  });

  it('pedido já concluído antes da consulta reporta as perguntas aplicadas', async () => {
    latest = { id: 'job-q', status: 'completed', errorCode: null, applied: true };
    const t = setup();
    await act(async () => { await t.result.current.track(); });
    expect(t.result.current).toMatchObject({ phase: 'completed', applied: true });
    expect(ServiceGetAnalysisJob).not.toHaveBeenCalled();
  });

  it('pedido já falho reporta a falha com o código', async () => {
    latest = { id: 'job-q', status: 'failed', errorCode: 'ia_provider_rate_limited', applied: null };
    const t = setup();
    await act(async () => { await t.result.current.track(); });
    expect(t.result.current).toMatchObject({ phase: 'failed', errorCode: 'ia_provider_rate_limited' });
  });

  it('pedido ativo é acompanhado pelo polling até concluir', async () => {
    latest = { id: 'job-q', status: 'queued', errorCode: null, applied: null };
    let resolvePoll!: (job: IaAnalysisJob) => void;
    vi.mocked(ServiceGetAnalysisJob).mockReturnValue(new Promise(resolve => { resolvePoll = resolve; }));
    const t = setup();
    await act(async () => { await t.result.current.track(); });
    expect(t.result.current.phase).toBe('running');
    await waitFor(() => expect(ServiceGetAnalysisJob).toHaveBeenCalledWith('job-q'));

    latest = { id: 'job-q', status: 'completed', errorCode: null, applied: true };
    await act(async () => { resolvePoll(polled('completed')); });
    await waitFor(() => expect(t.result.current.phase).toBe('completed'));
    expect(t.result.current.applied).toBe(true);
    expect(t.onCompleted).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('falha acompanhada pelo polling avisa com o código', async () => {
    latest = { id: 'job-q', status: 'running', errorCode: null, applied: null };
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue(polled('failed', 'invalid_ai_response_schema'));
    const t = setup();
    await act(async () => { await t.result.current.track(); });
    await waitFor(() => expect(t.result.current.phase).toBe('failed'));
    expect(t.result.current.errorCode).toBe('invalid_ai_response_schema');
    expect(t.onFailed).toHaveBeenCalledExactlyOnceWith('invalid_ai_response_schema');
  });

  it('falha ao consultar o pedido vira falha sem código', async () => {
    vi.mocked(ServiceGetLatestCompanyQuestionsJob).mockRejectedValue(new Error('network'));
    const t = setup();
    await act(async () => { await t.result.current.track(); });
    expect(t.result.current).toMatchObject({ phase: 'failed', errorCode: null });
  });
});

describe('getCompanyQuestionsFailureNotice', () => {
  it('erro do modelo avisa que as perguntas padrão foram mantidas', () => {
    const notice = getCompanyQuestionsFailureNotice('invalid_ai_response_schema', 'vendor/model');
    expect(notice.actionLabel).toBe('Trocar modelo');
    expect(notice.description).toContain('O modelo vendor/model não conseguiu gerar as perguntas.');
    expect(notice.description).toContain('As perguntas padrão foram mantidas.');
  });

  it('erro sem categoria usa o aviso genérico, sem botão', () => {
    expect(getCompanyQuestionsFailureNotice(null, null)).toEqual({
      title: 'Perguntas padrão mantidas',
      description: expect.stringContaining('Configurar perguntas'),
    });
  });
});
