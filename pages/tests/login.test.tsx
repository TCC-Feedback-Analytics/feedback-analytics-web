import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../public/login';

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('components/public/forms/formLogin', () => ({
  default: () => <div data-testid="form-login">Login Form</div>,
}));

function renderLogin() {
  return render(<Login />, { wrapper: MemoryRouter });
}

describe('[Unidade] Login Page', () => {
  it('deve renderizar todos os elementos principais da página', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeInTheDocument();
    expect(screen.getByText(
      'Bem-vindo de volta',
    )).toBeInTheDocument();
    expect(screen.getByText(
      'Entre na sua conta para continuar.',
    )).toBeInTheDocument();
  });

  it('deve renderizar o formulário de login', () => {
    renderLogin();

    expect(screen.getByTestId('form-login')).toBeInTheDocument();
    expect(screen.getByTestId('form-login')).toHaveTextContent('Login Form');
  });

  it('deve ter link para página de registro', () => {
    renderLogin();

    const registerLink = screen.getByRole('link', { name: 'Cadastre-se' });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('deve usar um layout responsivo para a experiência de login', () => {
    const { container } = renderLogin();

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'login-experience',
      'min-h-[100dvh]',
      'bg-(--bg-primary)',
    );
    expect(container.querySelector('main')).toHaveClass(
      'grid',
      'lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.8fr)]',
    );
  });
});
