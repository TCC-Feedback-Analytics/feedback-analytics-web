import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../public/register';

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('components/public/forms/formRegister', () => ({
  default: () => <div data-testid="form-register">Register Form</div>,
}));

function renderRegister() {
  return render(<Register />, { wrapper: MemoryRouter });
}

describe('[Unidade] Register Page', () => {
  it('deve renderizar a hierarquia principal da conta', () => {
    renderRegister();

    expect(screen.getByRole('heading', { name: 'Crie sua conta' })).toBeInTheDocument();
    expect(screen.getByText('NOVA CONTA')).toBeInTheDocument();
    expect(screen.getByText('Comece em minutos e transforme opiniões em decisões melhores.')).toBeInTheDocument();
  });

  it('deve renderizar o formulário de registro', () => {
    renderRegister();

    expect(screen.getByTestId('form-register')).toHaveTextContent('Register Form');
  });

  it('deve ter link para página de login', () => {
    renderRegister();

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
  });

  it('deve usar a estrutura responsiva compartilhada de autenticação', () => {
    const { container } = renderRegister();

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('login-experience', 'min-h-[100dvh]', 'relative');
    expect(container.querySelector('main')).toHaveClass('grid', 'lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.8fr)]');
  });
});
