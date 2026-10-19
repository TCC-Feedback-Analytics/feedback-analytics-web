import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';

const mocks = vi.hoisted(() => ({ setGenerateDialogOpen: vi.fn() }));

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: () => ({
    scope: 'COMPANY',
    catalogItemId: '',
    catalogItemOptions: [],
    setGenerateDialogOpen: mocks.setGenerateDialogOpen,
  }),
}));
vi.mock('src/lib/hooks/useScopedPendingCount', () => ({
  useScopedPendingCount: () => ({ pendingCount: 12, totalFeedbacks: 40 }),
}));
vi.mock('src/lib/context/onboardingContext', () => ({ useOnboarding: () => ({ startTour: vi.fn() }) }));
vi.mock('components/user/shared/avatar', () => ({ default: () => <span>avatar</span> }));
vi.mock('./HeaderNav', () => ({ default: () => <nav>Páginas</nav> }));

import Header from './Header';

const enterprise = { full_name: 'Padaria da Vovô', email: 'contato@exemplo.com', subscription_status: 'ACTIVE' } as EnterpriseContext;

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('Header', () => {
  it('mostra de quem é a conta, com link para a Visão geral', () => {
    render(
      <MemoryRouter>
        <Header isSidebarOpen={false} onToggleSidebar={vi.fn()} enterprise={enterprise} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );

    const brand = screen.getByRole('link', { name: 'Ir para a Visão geral' });
    expect(brand).toHaveAttribute('href', '/user/dashboard');
    expect(brand).toHaveTextContent('Padaria da Vovô');
    expect(brand).toHaveTextContent('Feedback Analytics');
  });

  it('o sino dos feedbacks novos fica no cabeçalho e abre a janela de análise', () => {
    render(
      <MemoryRouter>
        <Header isSidebarOpen={false} onToggleSidebar={vi.fn()} enterprise={enterprise} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('12')).toBeInTheDocument();
    fireEvent.click(screen.getByText('12').closest('button')!);
    const analyze = screen.getAllByRole('button').find((button) => /analis/i.test(button.textContent ?? ''));
    expect(analyze).toBeDefined();
    fireEvent.click(analyze!);
    expect(mocks.setGenerateDialogOpen).toHaveBeenCalledWith(true);
  });
});
