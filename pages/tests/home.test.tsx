import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock de react-router-dom para evitar erros de export no ambiente de testes do CI
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    MemoryRouter:
      actual.MemoryRouter ??
      (({ children }: { children: React.ReactNode }) => <>{children}</>),
    Link:
      actual.Link ??
      (({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
      )),
  };
});

import { MemoryRouter } from 'react-router-dom';
import Home from '../public/home';

describe('[Unidade] Home Page', () => {
  it('deve renderizar o conteúdo da página home', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('A melhor decisão começa onde a experiência acontece.'),
    ).toBeInTheDocument();
    expect(screen.getByText('O cliente faz pouco. O sistema faz o trabalho pesado.')).toBeInTheDocument();
    expect(screen.getByText('Veja a história por trás da média.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver o fluxo/i })).toHaveAttribute('href', '#coleta');
    expect(screen.getAllByRole('link', { name: /Começar teste grátis/i })[0]).toHaveAttribute('href', '/register');
  });

  it('deve ter a estrutura HTML correta', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv.tagName).toBe('DIV');
  });
});
