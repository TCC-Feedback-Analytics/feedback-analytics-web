import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InsightsActionBar from './InsightsActionBar';
import { IA_SLOW_AFTER_MS, isIaSlowNoticeEnabled } from 'src/lib/utils/iaSlowNotice';
vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));
const m = vi.hoisted(() => ({ running: true }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => ({
  scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [], period: { preset: 'ALL' }, setPeriod: () => {},
  isAnalyzingRaw: m.running, isRegeneratingInsights: false,
  rawStatus: m.running ? 'running' : 'idle', insightsStatus: 'idle', rawProgress: { done: 20, total: 105 },
}) }));
vi.mock('src/lib/hooks/useScopedPendingCount', () => ({ useScopedPendingCount: () => ({ pendingCount: 85, totalFeedbacks: 105 }) }));
vi.mock('components/user/pages/feedbacksInsightsReport/GenerateInsightsDialog', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Acompanhamento</div> : null,
}));
vi.mock('components/user/shared/IaModelQuickSwitch', () => ({
  default: ({ onChanged }: { onChanged?: (model: string) => void }) => (
    <button type="button" onClick={() => onChanged?.('outro/modelo')}>Simular troca de modelo</button>
  ),
}));
beforeEach(() => { m.running = true; window.localStorage.clear(); });
describe('progresso de IA fora da tela de insights', () => {
  it('permite acompanhar no perfil e reabrir o modal', () => {
    render(<MemoryRouter initialEntries={['/user/profile']}><InsightsActionBar /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('20/105');
    fireEvent.click(screen.getByRole('button', { name: 'Processando IA...' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Acompanhamento');
  });
  it('sem operação, não adiciona controles de insights ao perfil', () => {
    m.running = false;
    render(<MemoryRouter initialEntries={['/user/profile']}><InsightsActionBar /></MemoryRouter>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
describe('aviso de IA lenta', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  const renderBar = () => render(<MemoryRouter initialEntries={['/user/dashboard']}><InsightsActionBar /></MemoryRouter>);

  it('depois de 40s processando recomenda trocar de modelo, com o seletor ali mesmo', () => {
    renderBar();
    act(() => { vi.advanceTimersByTime(IA_SLOW_AFTER_MS - 1); });
    expect(screen.queryByText(/A IA está demorando mais que o normal/)).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByText(/A IA está demorando mais que o normal/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Trocar modelo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simular troca de modelo' }));
    // Depois da troca, a espera recomeça.
    expect(screen.queryByText(/A IA está demorando mais que o normal/)).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(IA_SLOW_AFTER_MS); });
    expect(screen.getByText(/A IA está demorando mais que o normal/)).toBeInTheDocument();
  });

  it('"Não recomendar de novo" esconde o aviso e guarda a escolha', () => {
    renderBar();
    act(() => { vi.advanceTimersByTime(IA_SLOW_AFTER_MS); });
    fireEvent.click(screen.getByRole('button', { name: 'Não recomendar de novo' }));
    expect(screen.queryByText(/A IA está demorando mais que o normal/)).not.toBeInTheDocument();
    expect(isIaSlowNoticeEnabled()).toBe(false);
  });

  it('com o aviso desligado, não recomenda nada', () => {
    window.localStorage.setItem('feedback-analytics:aviso-ia-lenta', 'off');
    renderBar();
    act(() => { vi.advanceTimersByTime(IA_SLOW_AFTER_MS * 2); });
    expect(screen.queryByText(/A IA está demorando mais que o normal/)).not.toBeInTheDocument();
  });

  it('sem processamento, não conta tempo', () => {
    m.running = false;
    renderBar();
    act(() => { vi.advanceTimersByTime(IA_SLOW_AFTER_MS * 2); });
    expect(screen.queryByText(/A IA está demorando mais que o normal/)).not.toBeInTheDocument();
  });
});
