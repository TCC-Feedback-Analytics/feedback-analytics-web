import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import InitialSetupProgressDialog, {
  INITIAL_SETUP_GIVE_UP_AFTER_MS,
  INITIAL_SETUP_SLOW_AFTER_MS,
} from './InitialSetupProgressDialog';
import type { CompanyQuestionsGenerationState } from 'src/lib/hooks/useCompanyQuestionsGeneration';

const mocks = vi.hoisted(() => ({
  state: null as unknown as CompanyQuestionsGenerationState,
  revalidate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({ useRevalidator: () => ({ revalidate: mocks.revalidate, state: 'idle' }) }));
// A troca rápida usa o router de dados; aqui basta simular a troca concluída.
vi.mock('components/user/shared/IaModelQuickSwitch', () => ({
  default: ({ onChanged }: { onChanged?: (model: string) => void }) => (
    <button type="button" onClick={() => onChanged?.('outro/modelo')}>Simular troca de modelo</button>
  ),
}));
vi.mock('src/lib/context/companyQuestionsGenerationContext', () => ({
  useCompanyQuestionsGenerationState: () => mocks.state,
}));

function setState(partial: Partial<CompanyQuestionsGenerationState>) {
  mocks.state = { phase: 'running', errorCode: null, applied: false, track: mocks.state.track, ...partial };
}

beforeEach(() => {
  vi.useFakeTimers();
  mocks.revalidate.mockReset();
  mocks.state = { phase: 'running', errorCode: null, applied: false, track: vi.fn().mockResolvedValue(undefined) };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function renderDialog() {
  const onFinish = vi.fn();
  const view = render(<InitialSetupProgressDialog open onFinish={onFinish} model="vendor/model" />);
  // Deixa a consulta da abertura (track) terminar.
  await act(async () => {});
  return { ...view, onFinish };
}

describe('[Unidade] InitialSetupProgressDialog', () => {
  it('consulta o pedido ao abrir e mostra o progresso com o modelo', async () => {
    await renderDialog();
    expect(mocks.state.track).toHaveBeenCalledOnce();
    expect(screen.getByText('Preparando sua conta')).toBeInTheDocument();
    expect(screen.getByText('Modelo vendor/model')).toBeInTheDocument();
    expect(screen.getByText('Criando as perguntas personalizadas do formulário')).toBeInTheDocument();
    expect(screen.getByTestId('setup-orb')).toHaveAttribute('data-state', 'running');
  });

  it('ao concluir, recarrega os dados e leva ao dashboard', async () => {
    setState({ phase: 'completed', applied: true });
    const { onFinish } = await renderDialog();
    expect(screen.getByText('Sua conta está pronta')).toBeInTheDocument();
    expect(screen.getByTestId('setup-orb')).toHaveAttribute('data-state', 'done');
    expect(mocks.revalidate).toHaveBeenCalledOnce();
    expect(onFinish).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(onFinish).toHaveBeenCalledExactlyOnceWith('dashboard');
  });

  it('não usa um resultado antigo antes da consulta da abertura terminar', async () => {
    let resolveTrack!: () => void;
    setState({ phase: 'completed', track: vi.fn(() => new Promise<void>(resolve => { resolveTrack = resolve; })) });
    const onFinish = vi.fn();
    render(<InitialSetupProgressDialog open onFinish={onFinish} model={null} />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('Preparando sua conta')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
    await act(async () => { resolveTrack(); });
    expect(screen.getByText('Sua conta está pronta')).toBeInTheDocument();
  });

  it('na falha do modelo mostra o motivo e oferece trocar o modelo ou seguir', async () => {
    setState({ phase: 'failed', errorCode: 'invalid_ai_response_schema' });
    const { onFinish } = await renderDialog();
    expect(screen.getByTestId('setup-orb')).toHaveAttribute('data-state', 'failed');
    expect(screen.getByRole('alert')).toHaveTextContent('Modelo com erro');
    expect(screen.getByRole('alert')).toHaveTextContent('O modelo vendor/model não conseguiu gerar as perguntas.');
    fireEvent.click(screen.getByRole('button', { name: 'Trocar modelo' }));
    expect(onFinish).toHaveBeenLastCalledWith('ia-settings');
    fireEvent.click(screen.getByRole('button', { name: /Continuar com as perguntas padrão/ }));
    expect(onFinish).toHaveBeenLastCalledWith('dashboard');
  });

  it(`aos ${INITIAL_SETUP_SLOW_AFTER_MS / 1000}s recomenda trocar de modelo, sem liberar seguir`, async () => {
    await renderDialog();
    act(() => { vi.advanceTimersByTime(INITIAL_SETUP_SLOW_AFTER_MS - 1); });
    expect(screen.queryByText('A IA está demorando')).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByText('A IA está demorando')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simular troca de modelo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Continuar/ })).not.toBeInTheDocument();
  });

  it('trocar o modelo na tela acompanha o pedido de novo e recomeça a espera', async () => {
    await renderDialog();
    act(() => { vi.advanceTimersByTime(INITIAL_SETUP_SLOW_AFTER_MS); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Simular troca de modelo' })); });
    expect(screen.getByText('Modelo outro/modelo')).toBeInTheDocument();
    expect(mocks.state.track).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('A IA está demorando')).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(INITIAL_SETUP_SLOW_AFTER_MS); });
    expect(screen.getByText('A IA está demorando')).toBeInTheDocument();
  });

  it(`só depois de ${INITIAL_SETUP_GIVE_UP_AFTER_MS / 60000} min sem resposta libera seguir com as perguntas padrão`, async () => {
    const { onFinish } = await renderDialog();
    act(() => { vi.advanceTimersByTime(INITIAL_SETUP_GIVE_UP_AFTER_MS - 1); });
    expect(screen.queryByRole('button', { name: /Continuar com as perguntas padrão/ })).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    fireEvent.click(screen.getByRole('button', { name: /Continuar com as perguntas padrão/ }));
    expect(onFinish).toHaveBeenCalledExactlyOnceWith('dashboard');
  });

  it('fechada não renderiza nem consulta', () => {
    render(<InitialSetupProgressDialog open={false} onFinish={vi.fn()} model={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.state.track).not.toHaveBeenCalled();
  });
});
