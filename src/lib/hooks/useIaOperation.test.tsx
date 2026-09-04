import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useIaOperation } from './useIaOperation';
import { ServiceGetAnalysisJob, ServiceGetActiveAnalysisJobs, type IaAnalysisJob } from 'src/services/serviceFeedbacks';

const mock = vi.hoisted(() => ({ fetcher: { state: 'idle', data: undefined as unknown, submit: vi.fn() } }));
vi.mock('react-router-dom', () => ({ useFetcher: () => mock.fetcher }));
vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetAnalysisJob: vi.fn(), ServiceGetActiveAnalysisJobs: vi.fn() }));

function job(status: IaAnalysisJob['status']): IaAnalysisJob {
  return { id: 'job-1', jobType: 'analyze_raw', scopeType: 'COMPANY', catalogItemId: null,
    status, done: status === 'completed' ? 102 : 0, total: 102,
    errorCode: status === 'failed' ? 'ia_config_required' : null, updatedAt: null };
}

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  vi.mocked(ServiceGetActiveAnalysisJobs).mockResolvedValue({ jobs: [] });
  mock.fetcher.state = 'idle';
  mock.fetcher.data = undefined;
  mock.fetcher.submit.mockImplementation(() => { mock.fetcher.state = 'submitting'; });
});

function setup(kind: 'analyze_raw' | 'regenerate_insights' = 'analyze_raw', enterpriseId?: string) {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  const hook = renderHook(() => useIaOperation({ kind, onSuccess, onError, enterpriseId }));
  const start = () => act(() => { hook.result.current.submit(new FormData()); });
  const respond = (data: unknown) => {
    mock.fetcher.state = 'idle';
    mock.fetcher.data = data;
    hook.rerender();
  };
  return { ...hook, start, respond, onSuccess, onError };
}

describe('useIaOperation — somente jobs assíncronos', () => {
  it('recusa resposta síncrona legada, mesmo com contagem', () => {
    const t = setup();
    t.start();
    expect(t.result.current.status).toBe('running');
    t.respond({ ok: true, analyzedCount: 0 });
    expect(t.result.current.status).toBe('failed');
    expect(t.onSuccess).not.toHaveBeenCalled();
  });

  it.each([{ error: 'Falha na IA' }, undefined, { ok: true }])('resposta inválida/erro não vira sucesso: %j', data => {
    const t = setup();
    t.start();
    t.respond(data);
    expect(t.result.current.status).toBe('failed');
    expect(t.onSuccess).not.toHaveBeenCalled();
    expect(t.onError).toHaveBeenCalledOnce();
  });

  it('HTTP 202 mantém running durante a passagem do fetcher para o polling', async () => {
    let resolveJob!: (value: IaAnalysisJob) => void;
    vi.mocked(ServiceGetAnalysisJob).mockReturnValue(new Promise(resolve => { resolveJob = resolve; }));
    const t = setup();
    t.start();
    t.respond({ ok: true, jobId: 'job-1' });
    expect(t.result.current.status).toBe('running');
    expect(t.onSuccess).not.toHaveBeenCalled();
    expect(ServiceGetAnalysisJob).toHaveBeenCalledWith('job-1');
    await act(async () => { resolveJob(job('completed')); });
    expect(t.result.current.status).toBe('succeeded');
    expect(t.onSuccess).toHaveBeenCalledExactlyOnceWith({ analyzedCount: 102 });
  });

  it.each(['queued', 'running', 'waiting_budget'] as const)('%s não confirma sucesso', async status => {
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue(job(status));
    const t = setup();
    t.start();
    t.respond({ ok: true, jobId: 'job-1' });
    await waitFor(() => expect(t.result.current.progress?.total).toBe(102));
    expect(t.result.current.status).toBe('running');
    expect(t.onSuccess).not.toHaveBeenCalled();
    t.unmount();
  });

  it('job failed interrompe operação e permite tentar novamente sem reutilizar sucesso antigo', async () => {
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue(job('failed'));
    const t = setup();
    t.start();
    t.respond({ ok: true, jobId: 'job-1' });
    await waitFor(() => expect(t.result.current.status).toBe('failed'));
    expect(t.onSuccess).not.toHaveBeenCalled();
    t.start();
    expect(t.result.current.error).toBeNull();
    expect(t.result.current.status).toBe('running');
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue({ ...job('completed'), id: 'job-2' });
    t.respond({ ok: true, jobId: 'job-2' });
    await waitFor(() => expect(t.result.current.status).toBe('succeeded'));
  });

  it('falha de conexão no polling mantém acompanhamento e não declara o job falho', async () => {
    vi.mocked(ServiceGetAnalysisJob).mockRejectedValue(new Error('Network'));
    const t = setup();
    t.start();
    t.respond({ ok: true, jobId: 'job-1' });
    await waitFor(() => expect(t.result.current.connectionError).toBe(true));
    expect(t.result.current.status).toBe('running');
    expect(t.onError).not.toHaveBeenCalled();
    expect(t.onSuccess).not.toHaveBeenCalled();
  });

  it('relatório ausente não confirma conclusão', () => {
    const t = setup('regenerate_insights');
    t.start();
    t.respond({ ok: true, reportGenerated: false });
    expect(t.result.current.status).toBe('failed');
    expect(t.onSuccess).not.toHaveBeenCalled();
  });

  it('relatório só conclui quando o job confirma a conclusão', async () => {
    const t = setup('regenerate_insights');
    t.start();
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue({ ...job('completed'), jobType: 'regenerate_insights', total: 6, done: 6 });
    t.respond({ ok: true, jobId: 'job-1' });
    await waitFor(() => expect(t.result.current.status).toBe('succeeded'));
    expect(t.onSuccess).toHaveBeenCalledWith({ reportGenerated: true });
  });

  it('não duplica submissões durante uma execução', () => {
    const t = setup();
    t.start();
    t.start();
    expect(mock.fetcher.submit).toHaveBeenCalledOnce();
  });

  it('falha ao submeter pelo router sai de running', async () => {
    mock.fetcher.submit.mockRejectedValue(new Error('Router'));
    const t = setup();
    t.start();
    await waitFor(() => expect(t.result.current.status).toBe('failed'));
    expect(t.onSuccess).not.toHaveBeenCalled();
  });

  it('recarregar recupera job aceito e consulta a conclusão sem nova submissão', async () => {
    localStorage.setItem('feedback:ia-job:tenant-A:analyze_raw', 'job-1');
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue(job('completed'));
    const t = setup('analyze_raw', 'tenant-A');
    await waitFor(() => expect(t.result.current.status).toBe('succeeded'));
    expect(mock.fetcher.submit).not.toHaveBeenCalled();
    expect(localStorage.getItem('feedback:ia-job:tenant-A:analyze_raw')).toBeNull();
  });

  it('sem storage recupera pelo endpoint de jobs ativos', async () => {
    vi.mocked(ServiceGetActiveAnalysisJobs).mockResolvedValue({ jobs: [job('running')] });
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue(job('running'));
    const t = setup('analyze_raw', 'tenant-A');
    await waitFor(() => expect(t.result.current.status).toBe('running'));
    expect(localStorage.getItem('feedback:ia-job:tenant-A:analyze_raw')).toBe('job-1');
    expect(mock.fetcher.submit).not.toHaveBeenCalled();
  });

  it('não recupera id armazenado de outra empresa', async () => {
    localStorage.setItem('feedback:ia-job:tenant-B:analyze_raw', 'other-job');
    const t = setup('analyze_raw', 'tenant-A');
    await waitFor(() => expect(ServiceGetActiveAnalysisJobs).toHaveBeenCalled());
    expect(t.result.current.status).toBe('idle');
    expect(ServiceGetAnalysisJob).not.toHaveBeenCalled();
  });

  it('job incompleto nunca é sucesso', async () => {
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue({ ...job('completed'), done: 20 });
    const t = setup(); t.start(); t.respond({ ok: true, jobId: 'job-1' });
    await waitFor(() => expect(t.result.current.status).toBe('failed'));
    expect(t.onSuccess).not.toHaveBeenCalled();
  });
});
