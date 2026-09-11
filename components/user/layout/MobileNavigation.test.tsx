import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.unmock('react-router-dom');

import { MemoryRouter } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import MobileMenuDrawer from './MobileMenuDrawer';

function NavigationHarness() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <MobileBottomNav
        isDrawerOpen={isDrawerOpen}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />
      <MobileMenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}

describe('[Unidade] navegação móvel', () => {
  afterEach(() => {
    cleanup();
  });

  it('abre o menu completo ao tocar no botão central', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NavigationHarness />
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: 'Abrir menu de navegação completo' });
    expect(screen.queryByRole('dialog', { name: 'Mapa de Navegação' })).not.toBeInTheDocument();

    await user.click(button);

    expect(screen.getByRole('dialog', { name: 'Mapa de Navegação' })).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'mobile-navigation-drawer');
  });

  it('mantém as rotas adicionais acessíveis no drawer', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MobileMenuDrawer isOpen onClose={onClose} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('dialog', { name: 'Mapa de Navegação' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Recebidos' })).toHaveAttribute('href', '/user/feedbacks/all');
    expect(screen.getByRole('link', { name: 'Configuração de IA' })).toHaveAttribute('href', '/user/edit/ia-settings');

    await user.click(screen.getByRole('button', { name: 'Fechar menu' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
