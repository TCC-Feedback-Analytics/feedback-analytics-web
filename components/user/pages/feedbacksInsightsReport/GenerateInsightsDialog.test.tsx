import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenerateInsightsDialog from './GenerateInsightsDialog';
import type { IaOperationStatus } from 'src/lib/context/insightsControls.types';

const mocks = vi.hoisted(() => ({
  controls: {
    scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [], canAnalyze: true,
    analyzeRaw: vi.fn(), regenerateInsights: vi.fn(),
    isAnalyzingRaw: false, isRegeneratingInsights: false,
    rawStatus: 'idle' as IaOperationStatus, insightsStatus: 'idle' as IaOperationStatus,
    rawError: null as string | null, insightsError: null as string | null,
    operationStatus: undefined as IaOperationStatus | undefined,
    operationError: null as string | null,
  },
  counts: { pendingCount: 102, totalFeedbacks: 105, totalAnalyzed: 3, latestAnalysisAt: null, loading: false },
  report: { current: null as null | { updatedAt: string } },
}));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));
vi.mock('src/lib/hooks/useScopedPendingCount', () => ({ useScopedPendingCount: () => mocks.counts }));
vi.mock('src/lib/hooks/useScopedInsightsReport', () => ({ useScopedInsightsReport: () => ({ report: mocks.report.current }) }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.controls.operationStatus = undefined;
  Object.assign(mocks.controls, { rawStatus: 'idle', insightsStatus: 'idle', rawError: null, insightsError: null, isAnalyzingRaw: false, isRegeneratingInsights: false });
  Object.assign(mocks.counts, { pendingCount: 102, totalFeedbacks: 105, totalAnalyzed: 3, latestAnalysisAt: null, loading: false });
  mocks.report.current = null;
  mocks.controls.analyzeRaw.mockImplementation(() => {
    mocks.controls.rawStatus = 'running'; mocks.controls.isAnalyzingRaw = true;
  });
  mocks.controls.regenerateInsights.mockImplementation(() => {
    mocks.controls.insightsStatus = 'running'; mocks.controls.isRegeneratingInsights = true;
  });
});

function setup() {
  const close = vi.fn();
  const t = render(<GenerateInsightsDialog open onOpenChange={close} />);
  const refresh = () => t.rerender(<GenerateInsightsDialog open onOpenChange={close} />);
  const start = () => fireEvent.click(screen.getByRole('button', { name: 'Processar e Gerar Insights com IA' }));
  return { ...t, refresh, start, close };
}

describe('fluxo unificado de análise e insights', () => {
  it('sucesso da última operação não reutiliza erro de uma análise anterior', () => {
    mocks.controls.rawStatus = 'failed';
    mocks.controls.rawError = 'Erro antigo';
    mocks.controls.insightsStatus = 'succeeded';
    mocks.controls.operationStatus = 'succeeded';
    setup();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(/concluído com sucesso/)).toBeInTheDocument();
  });
  it('abrir não executa IA; clique envia um único job com as duas etapas', () => {
    const t = setup();
    expect(mocks.controls.regenerateInsights).not.toHaveBeenCalled();
    t.start(); t.refresh();
    expect(mocks.controls.analyzeRaw).not.toHaveBeenCalled();
    expect(mocks.controls.regenerateInsights).toHaveBeenCalledExactlyOnceWith({ analyzePending: true });
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('continuar navegando');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(t.close).toHaveBeenCalledWith(false);
    mocks.controls.insightsStatus = 'succeeded'; mocks.controls.isRegeneratingInsights = false;
    t.refresh();
    expect(screen.getByText(/concluído com sucesso/)).toBeInTheDocument();
  });

  it('fechar e reabrir não inicia outra etapa nem outro job', () => {
    const t = setup(); t.start(); t.refresh();
    t.rerender(<GenerateInsightsDialog open={false} onOpenChange={t.close} />);
    mocks.controls.isRegeneratingInsights = true;
    t.refresh();
    expect(mocks.controls.regenerateInsights).toHaveBeenCalledOnce();
    expect(mocks.controls.analyzeRaw).not.toHaveBeenCalled();
  });

  it('falha do job é exibida sem disparar outra chamada de IA', () => {
    const t = setup(); t.start();
    mocks.controls.insightsStatus = 'failed';
    mocks.controls.isRegeneratingInsights = false;
    mocks.controls.insightsError = 'Chave inválida';
    t.refresh();
    expect(screen.getByRole('alert')).toHaveTextContent('Chave inválida');
    expect(mocks.controls.regenerateInsights).toHaveBeenCalledOnce();
    expect(mocks.controls.analyzeRaw).not.toHaveBeenCalled();
  });

  it('erro ao gerar relatório não mostra conclusão bem-sucedida', () => {
    const t = setup();
    t.start();
    mocks.controls.rawStatus = 'succeeded'; mocks.controls.isAnalyzingRaw = false;
    t.refresh();
    mocks.controls.insightsStatus = 'failed'; mocks.controls.isRegeneratingInsights = false;
    mocks.controls.insightsError = 'Nenhum relatório gerado';
    t.refresh();
    expect(screen.getByRole('alert')).toHaveTextContent('Nenhum relatório gerado');
    expect(screen.queryByText(/concluído com sucesso/)).not.toBeInTheDocument();
  });

  it('sem pendentes vai direto para relatório e aguarda confirmação de sucesso', () => {
    mocks.counts.pendingCount = 0; mocks.counts.totalAnalyzed = 105;
    const t = setup();
    t.start();
    expect(mocks.controls.analyzeRaw).not.toHaveBeenCalled();
    expect(mocks.controls.regenerateInsights).toHaveBeenCalledOnce();
    mocks.controls.isRegeneratingInsights = false;
    t.refresh();
    expect(screen.queryByText(/concluído com sucesso/)).not.toBeInTheDocument();
    mocks.controls.insightsStatus = 'succeeded';
    t.refresh();
    expect(screen.getByText(/concluído com sucesso/)).toBeInTheDocument();
  });

  it('permite refazer relatório atualizado e envia force sem criar feedback novo', () => {
    Object.assign(mocks.counts, {
      pendingCount: 0, totalAnalyzed: 105, latestAnalysisAt: '2026-09-01T12:00:00.000Z',
    });
    mocks.report.current = { updatedAt: '2026-09-02T12:00:00.000Z' };
    const t = setup();
    t.start();
    expect(mocks.controls.regenerateInsights).toHaveBeenCalledExactlyOnceWith({ analyzePending: true, force: true });
  });

  it('Apenas Analisar não encadeia relatório', () => {
    const t = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Apenas Analisar' }));
    mocks.controls.rawStatus = 'succeeded'; mocks.controls.isAnalyzingRaw = false;
    t.refresh();
    expect(mocks.controls.regenerateInsights).not.toHaveBeenCalled();
  });
});
