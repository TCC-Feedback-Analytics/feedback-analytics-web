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

  it('prioriza os diagnósticos na barra inferior e mantém o catálogo no menu', () => {
    render(
      <MemoryRouter>
        <NavigationHarness />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Diagnósticos' })).toHaveAttribute('href', '/user/insights/overview');
    expect(screen.getByRole('link', { name: 'Comentários' })).toHaveAttribute('href', '/user/insights/comments');
    expect(screen.queryByRole('link', { name: 'Catálogo' })).not.toBeInTheDocument();
  });

  it('posiciona o indicador de página acima do ícone ativo', () => {
    render(
      <MemoryRouter initialEntries={['/user/edit/feedback-general']}>
        <MobileBottomNav isDrawerOpen={false} onOpenDrawer={vi.fn()} />
      </MemoryRouter>,
    );

    const activeLink = screen.getByRole('link', { name: 'Avaliação' });
    const iconArea = activeLink.firstElementChild;
    expect(iconArea?.firstElementChild).toHaveClass('h-1', 'bg-(--primary-color)');
    expect(iconArea?.lastElementChild).toHaveClass('mt-1.5');
    expect(activeLink.lastElementChild).toHaveClass('mt-1.5');
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
    expect(screen.getByRole('link', { name: 'Comparar itens' })).toHaveAttribute('href', '/user/compare');
    expect(screen.getByRole('link', { name: 'Diagnósticos ✨' })).toHaveAttribute('href', '/user/diagnosis');
    // O menu abre num portal fora do layout: leva a classe do tema para não cair nas cores genéricas.
    expect(screen.getByRole('dialog', { name: 'Mapa de Navegação' }).closest('.private-user-theme')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Fechar menu' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
