import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

import HeaderNav from './HeaderNav';

function renderNav(path = '/user/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <HeaderNav />
    </MemoryRouter>,
  );
}

describe('menu do cabeçalho', () => {
  afterEach(cleanup);

  it('com largura de sobra, mostra todas as páginas e nenhum "Mais"', () => {
    renderNav();
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getByRole('link', { name: 'Configuração da coleta' })).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Mais/ })).not.toBeInTheDocument();
  });

  describe('em tela estreita', () => {
    // Cada item (e o "Mais") mede 100px e a barra tem 300px: cabe 1 item antes do "Mais".
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
    });
    afterEach(() => vi.restoreAllMocks());

    it('o que não cabe vai para o "Mais", sem cortar nenhum item', () => {
      renderNav('/user/compare');
      const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
      expect(within(nav).getByRole('link', { name: 'Visão geral' })).toBeInTheDocument();
      expect(within(nav).queryByRole('link', { name: 'Comparar itens' })).not.toBeInTheDocument();

      fireEvent.click(within(nav).getByRole('button', { name: /Mais/ }));
      const menu = screen.getByRole('menu');
      expect(within(menu).getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
        'Nota',
        'Clientes e canais',
        'Comparar itens',
        'Diagnósticos ✨',
        'Feedbacks',
        'Análise dos comentários ✨',
        'Configuração da coleta',
      ]);
      // A página aberta está dentro do "Mais".
      expect(within(menu).getByRole('menuitem', { name: 'Comparar itens' })).toHaveAttribute('aria-current', 'page');

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
