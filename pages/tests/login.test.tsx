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

  it('deve exibir o nome completo da marca no cabeçalho', () => {
    renderLogin();

    expect(screen.getAllByText('Feedback Analytics')).toHaveLength(2);
  });

  it('centraliza o aviso de segurança no rodapé do formulário', () => {
    renderLogin();

    expect(screen.getByText('Seus dados são protegidos e usados com segurança.'))
      .toHaveClass('w-full', 'justify-center', 'text-center');
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
    const sidebar = container.querySelector('aside');
    const formRegion = container.querySelector('main');

    expect(mainDiv).toHaveClass('lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)]');
    expect(sidebar).toHaveClass('hidden', 'lg:flex', 'lg:col-start-1');
    expect(formRegion).toHaveClass('flex', 'justify-center', 'lg:col-start-2');
    expect(formRegion?.parentElement).toBe(mainDiv);
    expect(sidebar?.parentElement).toBe(mainDiv);
  });
});
