import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  getLatest: vi.fn(),
  request: vi.fn(),
  getJob: vi.fn(),
  controls: {
    scope: 'COMPANY',
    catalogItemId: '',
    catalogItemOptions: [],
    period: { preset: 'ALL' },
  } as Record<string, unknown>,
}));

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/services/serviceScopeDiagnosis', () => ({
  ServiceGetLatestScopeDiagnosis: mocks.getLatest,
  ServiceRequestScopeDiagnosis: mocks.request,
}));
vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetAnalysisJob: mocks.getJob }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));

import SectionScopeDiagnosis from './SectionScopeDiagnosis';

const DIAGNOSIS = {
  id: 'diag-1',
  scopeType: 'COMPANY',
  catalogItemId: null,
  period: { start: null, end: null },
  previousPeriod: null,
  feedbackCount: 42,
  newFeedbacksSince: 0,
  model: 'modelo/teste',
  createdAt: '2026-10-02T12:00:00.000Z',
  result: {
    summary: 'O escopo vai bem, mas a espera preocupa.',
    going_well: [{ text: 'Atendimento elogiado.', evidence: 'Nota 4,6 na pergunta de atendimento.' }],
    concerns: [{ text: 'A espera pesa na nota.', evidence: 'Nota 3,1 na pergunta de espera.' }],
    changes: [],
    recommendations: [
      { priority: 1, kind: 'fix', action: 'Rever o tempo de espera.', evidence: 'Nota 3,1.' },
      { priority: 2, kind: 'keep', action: 'Manter o atendimento.', evidence: 'Nota 4,6.' },
    ],
    limitations: ['Só 8 comentários foram analisados.'],
  },
};

const ready = { hasConfiguredAI: true, hasCompanyContext: true, periodTotal: 42, model: 'modelo/teste' };

function renderSection(props: Partial<typeof ready> = {}) {
  return render(
    <MemoryRouter>
      <SectionScopeDiagnosis {...ready} {...props} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.controls = { scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [], period: { preset: 'ALL' } };
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('SectionScopeDiagnosis', () => {
  it('sem IA configurada, leva à Configuração de IA e não consulta nada', () => {
    renderSection({ hasConfiguredAI: false });
    expect(screen.getByRole('link', { name: 'Configurar a IA' })).toHaveAttribute('href', '/user/edit/ia-settings');
    expect(mocks.getLatest).not.toHaveBeenCalled();
  });

  it('sem os dados da empresa, pede para preenchê-los', () => {
    renderSection({ hasCompanyContext: false });
    expect(screen.getByRole('link', { name: 'Preencher os dados da empresa' })).toBeInTheDocument();
    expect(mocks.getLatest).not.toHaveBeenCalled();
  });

  it('mostra o diagnóstico guardado com recomendações em ordem e evidências', async () => {
    mocks.getLatest.mockResolvedValue({ diagnosis: DIAGNOSIS, job: null });
    renderSection();

    const section = await screen.findByRole('region', { name: /Diagnóstico do escopo/ });
    expect(await within(section).findByText('O escopo vai bem, mas a espera preocupa.')).toBeInTheDocument();
    const steps = within(section).getAllByRole('listitem').filter((li) => /Corrigir|Manter/.test(li.textContent ?? ''));
    expect(steps[0]).toHaveTextContent('CorrigirRever o tempo de espera.Nota 3,1.');
    expect(steps[1]).toHaveTextContent('ManterManter o atendimento.');
    expect(within(section).getByText('Sem período anterior para comparar.')).toBeInTheDocument();
    expect(within(section).getByText('Só 8 comentários foram analisados.')).toBeInTheDocument();
    expect(within(section).getByText(/Todo o período · 42 avaliações · gerado em/)).toBeInTheDocument();
    expect(within(section).getByText('Sem avaliações novas desde então.')).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /Gerar de novo/ })).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: /Ver o histórico de diagnósticos/ })).toHaveAttribute('href', '/user/diagnosis');
    expect(mocks.getLatest).toHaveBeenCalledWith({ scope_type: 'COMPANY', catalog_item_id: undefined });
  });

  it('avisa as avaliações novas e oferece atualizar', async () => {
    mocks.getLatest.mockResolvedValue({ diagnosis: { ...DIAGNOSIS, newFeedbacksSince: 1 }, job: null });
    renderSection();
    expect(await screen.findByText('1 avaliação nova desde então.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atualizar diagnóstico/ })).toBeInTheDocument();
  });

  it('diagnóstico de outro período: oferece gerar para o selecionado', async () => {
    mocks.controls = { ...mocks.controls, period: { preset: 'LAST_30_DAYS' } };
    mocks.getLatest.mockResolvedValue({ diagnosis: DIAGNOSIS, job: null });
    renderSection();
    expect(await screen.findByText(/Este diagnóstico é de outro período/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerar para o período selecionado/ })).toBeInTheDocument();
  });

  it('com poucas avaliações no período, o botão fica desligado', async () => {
    mocks.getLatest.mockResolvedValue({ diagnosis: null, job: null });
    renderSection({ periodTotal: 4 });
    expect(await screen.findByText(/São precisas pelo menos 10 avaliações/)).toHaveTextContent('(agora: 4)');
    expect(screen.getByRole('button', { name: /Gerar diagnóstico/ })).toBeDisabled();
  });

  it('gera, acompanha o job e mostra o resultado', async () => {
    mocks.getLatest
      .mockResolvedValueOnce({ diagnosis: null, job: null })
      .mockResolvedValueOnce({ diagnosis: DIAGNOSIS, job: null });
    mocks.request.mockResolvedValue({ jobId: 'job-1', status: 'queued', deduped: false, cached: false, diagnosisId: null });
    mocks.getJob.mockResolvedValue({ id: 'job-1', status: 'completed', diagnosisId: 'diag-1' });
    renderSection();

    fireEvent.click(await screen.findByRole('button', { name: /Gerar diagnóstico/ }));

    expect(await screen.findByText('O escopo vai bem, mas a espera preocupa.')).toBeInTheDocument();
    expect(mocks.request).toHaveBeenCalledWith(expect.objectContaining({ scope_type: 'COMPANY', force: false, tz: expect.any(String) }));
    expect(mocks.getJob).toHaveBeenCalledWith('job-1');
  });

  it('com o diagnóstico já guardado, recarrega sem acompanhar job', async () => {
    mocks.getLatest
      .mockResolvedValueOnce({ diagnosis: null, job: null })
      .mockResolvedValueOnce({ diagnosis: DIAGNOSIS, job: null });
    mocks.request.mockResolvedValue({ jobId: null, status: 'completed', deduped: false, cached: true, diagnosisId: 'diag-1' });
    renderSection();

    fireEvent.click(await screen.findByRole('button', { name: /Gerar diagnóstico/ }));

    expect(await screen.findByText('O escopo vai bem, mas a espera preocupa.')).toBeInTheDocument();
    expect(mocks.getJob).not.toHaveBeenCalled();
  });

  it('falha do modelo mostra o motivo e o atalho para trocar de modelo', async () => {
    mocks.getLatest.mockResolvedValue({ diagnosis: null, job: null });
    mocks.request.mockResolvedValue({ jobId: 'job-1', status: 'queued', deduped: false, cached: false, diagnosisId: null });
    mocks.getJob.mockResolvedValue({ id: 'job-1', status: 'failed', errorCode: 'invalid_ai_response_schema' });
    renderSection();

    fireEvent.click(await screen.findByRole('button', { name: /Gerar diagnóstico/ }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Modelo com erro');
    expect(alert).toHaveTextContent('O modelo modelo/teste não conseguiu gerar o diagnóstico.');
    expect(within(alert).getByRole('link', { name: 'Trocar modelo' })).toHaveAttribute('href', '/user/edit/ia-settings');
  });

  it('erro do pedido (poucos dados no servidor) aparece sem job', async () => {
    mocks.getLatest.mockResolvedValue({ diagnosis: null, job: null });
    mocks.request.mockRejectedValue(Object.assign(new Error('422'), { status: 422, code: 'insufficient_feedbacks_for_analysis' }));
    renderSection();

    fireEvent.click(await screen.findByRole('button', { name: /Gerar diagnóstico/ }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Não foi possível gerar o diagnóstico');
    expect(alert).toHaveTextContent('no mínimo 10 feedbacks');
    expect(mocks.getJob).not.toHaveBeenCalled();
  });

  it('retoma um job em andamento ao abrir', async () => {
    mocks.getLatest.mockResolvedValue({ diagnosis: null, job: { id: 'job-9', status: 'waiting_budget' } });
    mocks.getJob.mockResolvedValue({ id: 'job-9', status: 'waiting_budget' });
    renderSection();

    expect(await screen.findByText('Aguardando a vez na cota da IA…')).toBeInTheDocument();
    await waitFor(() => expect(mocks.getJob).toHaveBeenCalledWith('job-9'));
    expect(screen.queryByRole('button', { name: /Gerar diagnóstico/ })).not.toBeInTheDocument();
  });
});
