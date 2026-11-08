import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Resultados from '../public/resultados';

vi.mock('react-router-dom', async () =>
  vi.importActual<typeof import('react-router-dom')>('react-router-dom'),
);

describe('Página de resultados', () => {
  it('apresenta as seções e direciona o cadastro', () => {
    render(
      <MemoryRouter>
        <Resultados />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Veja o sinal. Entenda o contexto. Decida o próximo passo.',
    );
    expect(screen.getByRole('link', { name: /ver como funciona/i })).toHaveAttribute(
      'href',
      '#tres-lentes',
    );
    expect(screen.getByRole('link', { name: /criar minha conta/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('usa a mesma navegação pública com acesso às páginas de produto', () => {
    render(
      <MemoryRouter>
        <Resultados />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(navigation.querySelector('a[href="/produto/coleta"]')).toBeInTheDocument();
    expect(navigation.querySelector('a[href="/produto/analise"]')).toBeInTheDocument();
    expect(navigation.querySelector('a[href="/produto/resultados"]')).toBeInTheDocument();
    expect(navigation.querySelector('a[href="/register"]')).toHaveTextContent('Começar grátis');
  });
});
