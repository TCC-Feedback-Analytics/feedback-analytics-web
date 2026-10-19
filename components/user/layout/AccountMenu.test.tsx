import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/lib/context/onboardingContext', () => ({ useOnboarding: () => ({ startTour: vi.fn() }) }));
vi.mock('components/user/shared/avatar', () => ({ default: () => <span>avatar</span> }));

import AccountMenu from './AccountMenu';

const enterprise = { full_name: 'Pão de queijo bom', email: 'contato@exemplo.com', subscription_status: 'ACTIVE' } as EnterpriseContext;

function renderMenu() {
  return render(
    <MemoryRouter>
      <div>
        <p>Conteúdo da página</p>
        <AccountMenu enterprise={enterprise} onSignOut={vi.fn()} />
      </div>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('AccountMenu', () => {
  it('fecha ao tocar fora do menu, em qualquer parte da página', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Tocar dentro do menu não fecha.
    fireEvent.pointerDown(screen.getByText('Minha conta'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByText('Conteúdo da página'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('fecha com Esc', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
