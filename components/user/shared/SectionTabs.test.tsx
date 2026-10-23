import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.unmock('react-router-dom');

import { MemoryRouter } from 'react-router-dom';
import SectionTabs from './SectionTabs';

describe('navegação de seção', () => {
  afterEach(cleanup);

  it('mostra as três rotas de configuração em grade no mobile, sem rolagem lateral', () => {
    render(
      <MemoryRouter initialEntries={['/user/edit/types-feedback']}>
        <SectionTabs />
      </MemoryRouter>,
    );

    const nav = screen.getByRole('navigation', { name: 'Navegação da seção' });
    const tabs = nav.firstElementChild;

    expect(nav).not.toHaveClass('overflow-x-auto');
    expect(tabs).toHaveClass('grid-cols-3');
    expect(screen.getByRole('link', { name: 'Avaliação da empresa' })).toHaveAttribute('href', '/user/edit/feedback-general');
    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Configuração de IA' })).toHaveAttribute('href', '/user/edit/ia-settings');
  });
});
