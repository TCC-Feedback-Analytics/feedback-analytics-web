import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom';
import type { CompanyQuestionsGenerationState } from 'src/lib/hooks/useCompanyQuestionsGeneration';

const mocks = vi.hoisted(() => ({
  generation: null as unknown as CompanyQuestionsGenerationState,
  setupRunning: false,
  latest: vi.fn(),
  retry: vi.fn(),
  dismiss: vi.fn(),
  switchResult: undefined as unknown,
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/lib/context/companyQuestionsGenerationContext', () => ({
  useCompanyQuestionsGenerationState: () => mocks.generation,
}));
vi.mock('src/lib/context/onboardingContext', () => ({
  useOnboarding: () => ({ isInitialSetupRunning: mocks.setupRunning }),
}));
vi.mock('src/services/serviceFeedbacks', () => ({
  ServiceGetLatestCompanyQuestionsJob: mocks.latest,
  ServiceRetryCompanyQuestions: mocks.retry,
  ServiceDismissCompanyQuestionsFailure: mocks.dismiss,
}));
vi.mock('components/user/shared/IaModelQuickSwitch', () => ({
  default: ({ onChanged }: { onChanged?: (model: string, result?: unknown) => void }) => (
    <button type="button" onClick={() => onChanged?.('outro/modelo', mocks.switchResult)}>Simular troca de modelo</button>
  ),
}));

import CompanyQuestionsFailureBanner from './CompanyQuestionsFailureBanner';

const failedJob = { id: 'job-1', status: 'failed', errorCode: 'invalid_ai_response_schema', applied: null, dismissed: false };

async function renderBanner(hasKey = true) {
  const router = createMemoryRouter([
    {
      id: 'user',
      path: '/user',
      loader: () => ({ iaConfig: { hasKey, provider: 'openrouter', model: 'vendor/model', keyHint: 'xyz9' } }),
      element: <Outlet />,
      children: [{ path: 'dashboard', element: <CompanyQuestionsFailureBanner /> }],
    },
  ], { initialEntries: ['/user/dashboard'] });
  const view = render(<RouterProvider router={router} />);
  await act(async () => {});
  return view;
}

describe('[Unidade] Aviso persistente de falha das perguntas', () => {
  beforeEach(() => {
    mocks.generation = { phase: 'idle', errorCode: null, applied: false, track: vi.fn().mockResolvedValue(undefined) };
    mocks.setupRunning = false;
    mocks.switchResult = undefined;
    mocks.latest.mockResolvedValue({ job: failedJob, stillDefault: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('com o último pedido falho e as perguntas padrão, mostra o aviso com o motivo', async () => {
    await renderBanner();
    expect(await screen.findByText('As perguntas personalizadas não foram criadas')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('O modelo vendor/model não conseguiu gerar as perguntas.');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trocar modelo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manter perguntas padrão' })).toBeInTheDocument();
  });

  it('não aparece com as perguntas já editadas, com o aviso dispensado, sem chave ou na tela de preparação', async () => {
    mocks.latest.mockResolvedValueOnce({ job: failedJob, stillDefault: false });
    const first = await renderBanner();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    first.unmount();

    mocks.latest.mockResolvedValueOnce({ job: { ...failedJob, dismissed: true }, stillDefault: true });
    const second = await renderBanner();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    second.unmount();

    const third = await renderBanner(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    third.unmount();

    mocks.setupRunning = true;
    await renderBanner();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('"Tentar de novo" volta a acompanhar o pedido; quando não sai, diz o motivo', async () => {
    mocks.retry.mockResolvedValueOnce({ questionsGeneration: { status: 'queued' } });
    await renderBanner();
    await act(async () => { fireEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' })); });
    expect(mocks.generation.track).toHaveBeenCalledOnce();

    mocks.retry.mockResolvedValueOnce({ questionsGeneration: { status: 'rate_limited', retryAfterSeconds: 30 } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' })); });
    expect(screen.getByText('Aguarde 30 segundos para tentar de novo.')).toBeInTheDocument();
    expect(mocks.generation.track).toHaveBeenCalledOnce();
  });

  it('trocar o modelo ali mesmo tenta de novo', async () => {
    mocks.switchResult = { status: 'queued' };
    await renderBanner();
    fireEvent.click(await screen.findByRole('button', { name: 'Trocar modelo' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Simular troca de modelo' })); });
    expect(mocks.generation.track).toHaveBeenCalledOnce();
  });

  it('"Manter perguntas padrão" dispensa o aviso no servidor', async () => {
    mocks.dismiss.mockResolvedValueOnce({ dismissed: true });
    await renderBanner();
    await act(async () => { fireEvent.click(await screen.findByRole('button', { name: 'Manter perguntas padrão' })); });
    expect(mocks.dismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('erro de conta leva para revisar a chave', async () => {
    mocks.latest.mockResolvedValueOnce({ job: { ...failedJob, errorCode: 'ia_provider_credits_exhausted' }, stillDefault: true });
    await renderBanner();
    expect(await screen.findByRole('link', { name: 'Revisar chave' })).toHaveAttribute('href', '/user/edit/ia-settings');
    expect(screen.queryByRole('button', { name: 'Trocar modelo' })).not.toBeInTheDocument();
  });

  it('durante a nova tentativa, mostra que está gerando de novo', async () => {
    mocks.retry.mockResolvedValueOnce({ questionsGeneration: { status: 'queued' } });
    // O acompanhamento passa a fase para running, como o provider faz.
    mocks.generation.track = vi.fn(async () => { mocks.generation = { ...mocks.generation, phase: 'running' }; });
    await renderBanner();
    await act(async () => { fireEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' })); });
    expect(screen.getByRole('status')).toHaveTextContent('Gerando as perguntas de novo com vendor/model…');
  });
});
