import { StrictMode, useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider, type ActionFunctionArgs, Link, Outlet } from 'react-router-dom';
import { InsightsControlsProvider, useInsightsControlsState } from 'src/lib/context/insightsControls';
import { useIaOperation } from 'src/lib/hooks/useIaOperation';
import { ServiceGetAnalysisJob, type IaAnalysisJob } from 'src/services/serviceFeedbacks';
import GenerateInsightsDialog from './GenerateInsightsDialog';

vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));
vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetAnalysisJob: vi.fn() }));
vi.mock('src/lib/hooks/useScopedPendingCount', () => ({ useScopedPendingCount: () => ({ pendingCount: 102, totalFeedbacks: 105, totalAnalyzed: 3, latestAnalysisAt: null, loading: false }) }));
vi.mock('src/lib/hooks/useScopedInsightsReport', () => ({ useScopedInsightsReport: () => ({ report: null }) }));

const onSuccess = vi.fn();
const onError = vi.fn();

function Harness() {
  const [open, setOpen] = useState(true);
  const state = useInsightsControlsState({ availableScopes: ['COMPANY'], catalogItemOptions: [], canAnalyze: true });
  const raw = useIaOperation({ kind: 'analyze_raw', onSuccess, onError });
  const insights = useIaOperation({ kind: 'regenerate_insights', onSuccess, onError });
  return <InsightsControlsProvider value={{
    ...state,
    analyzeRaw: () => { const form = new FormData(); form.set('intent', 'raw'); raw.submit(form); },
    regenerateInsights: (options) => { const form = new FormData(); form.set('intent', 'insights'); form.set('analyze_pending', String(options?.analyzePending === true)); insights.submit(form); },
    rawStatus: raw.status, insightsStatus: insights.status,
    rawError: raw.error, insightsError: insights.error,
    isAnalyzingRaw: raw.status === 'running', isRegeneratingInsights: insights.status === 'running',
    rawProgress: raw.progress, insightsProgress: insights.progress,
  }}>
    <Link to="/user/profile">Perfil</Link>
    <button onClick={() => setOpen(true)}>Acompanhar</button>
    <Outlet />
    <GenerateInsightsDialog open={open} onOpenChange={setOpen} />
  </InsightsControlsProvider>;
}

const routers: ReturnType<typeof createMemoryRouter>[] = [];
beforeEach(() => {
  vi.resetAllMocks();
});
afterEach(() => {
  cleanup();
  routers.splice(0).forEach(router => router.dispose());
});

describe('fluxo integrado com React Router real (IA simulada)', () => {
  it.each(['completed', 'failed'] as const)('um único 202 acompanha job %s sem encadear requisições no frontend', async status => {
    let finishJob!: (job: IaAnalysisJob) => void;
    vi.mocked(ServiceGetAnalysisJob).mockReturnValue(new Promise(resolve => { finishJob = resolve; }));
    const actions: string[] = [];
    const action = async ({ request }: ActionFunctionArgs) => {
      const form = await request.formData();
      actions.push(String(form.get('intent')));
      expect(form.get('analyze_pending')).toBe('true');
      return { ok: true, jobId: 'pipeline-job' };
    };
    const router = createMemoryRouter([{ path: '/user', element: <Harness />, children: [
      { path: 'insights/reports', element: <h1>Relatórios</h1>, action },
      { path: 'profile', element: <h1>Meu perfil</h1> },
    ] }], { initialEntries: ['/user/insights/reports'] });
    routers.push(router);
    render(<StrictMode><RouterProvider router={router} /></StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: 'Processar e Gerar Insights com IA' }));
    await waitFor(() => expect(ServiceGetAnalysisJob).toHaveBeenCalledOnce());
    expect(actions).toEqual(['insights']);
    expect(onSuccess).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Perfil' }));
    expect(await screen.findByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument();
    await act(async () => finishJob({ id: 'pipeline-job', jobType: 'regenerate_insights', scopeType: 'COMPANY',
      catalogItemId: null, phase: 'generating', status, total: 6, done: status === 'completed' ? 6 : 2,
      errorCode: status === 'failed' ? 'ia_config_required' : null, updatedAt: null }));
    expect(actions).toEqual(['insights']);
    fireEvent.click(screen.getByRole('button', { name: 'Acompanhar' }));
    if (status === 'completed') {
      expect(await screen.findByText(/concluído com sucesso/)).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalledExactlyOnceWith({ reportGenerated: true });
      expect(onError).not.toHaveBeenCalled();
    } else {
      expect(await screen.findByRole('alert')).toHaveTextContent('Processamento interrompido');
      expect(onSuccess).not.toHaveBeenCalled();
    }
  });

  it('falha ao enfileirar permite tentar de novo, sem reutilizar resposta anterior', async () => {
    let reject = true;
    const action = vi.fn(async () => reject ? { error: 'Fila indisponível' } : { ok: true, jobId: 'retry-job' });
    vi.mocked(ServiceGetAnalysisJob).mockResolvedValue({ id: 'retry-job', jobType: 'regenerate_insights', scopeType: 'COMPANY',
      catalogItemId: null, phase: 'generating', status: 'completed', total: 6, done: 6, errorCode: null, updatedAt: null });
    const router = createMemoryRouter([{ path: '/user/insights/reports', element: <Harness />, action }], { initialEntries: ['/user/insights/reports'] });
    routers.push(router);
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByRole('button', { name: 'Processar e Gerar Insights com IA' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Fila indisponível');
    reject = false;
    fireEvent.click(screen.getByRole('button', { name: 'Processar e Gerar Insights com IA' }));
    expect(await screen.findByText(/concluído com sucesso/)).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(2);
  });
});
