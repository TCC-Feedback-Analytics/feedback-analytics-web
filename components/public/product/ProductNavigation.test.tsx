import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProductNavigation from './ProductNavigation';

vi.mock('react-router-dom', async () =>
  vi.importActual<typeof import('react-router-dom')>('react-router-dom'),
);

describe('navegação de produto', () => {
  it('atualiza o indicador ao navegar entre as páginas', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/produto/coleta']}><ProductNavigation /></MemoryRouter>);
    const nav = within(screen.getByRole('navigation', { name: 'Navegação principal' }));
    expect(nav.getByRole('link', { name: 'Coleta' })).toHaveAttribute('aria-current', 'page');
    await user.click(nav.getByRole('link', { name: 'Análise' }));
    expect(nav.getByRole('link', { name: 'Análise' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Coleta' })).not.toHaveAttribute('aria-current');
    await user.click(nav.getByRole('link', { name: 'Resultados' }));
    expect(nav.getByRole('link', { name: 'Resultados' })).toHaveAttribute('aria-current', 'page');
  });
});
