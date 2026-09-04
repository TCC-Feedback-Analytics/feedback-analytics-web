import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InsightsActionBar from './InsightsActionBar';
vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));
const m = vi.hoisted(() => ({ running: true }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => ({
  scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [],
  isAnalyzingRaw: m.running, isRegeneratingInsights: false,
  rawStatus: m.running ? 'running' : 'idle', insightsStatus: 'idle', rawProgress: { done: 20, total: 105 },
}) }));
vi.mock('src/lib/hooks/useScopedPendingCount', () => ({ useScopedPendingCount: () => ({ pendingCount: 85, totalFeedbacks: 105 }) }));
vi.mock('components/user/pages/feedbacksInsightsReport/GenerateInsightsDialog', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Acompanhamento</div> : null,
}));
beforeEach(() => { m.running = true; });
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
