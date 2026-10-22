import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';
import RegisterEmailPendingNotice from './registerEmailPendingNotice';

vi.unmock('react-router-dom');
vi.mock('src/services/serviceAuth', () => ({
  ServiceResendConfirmation: vi.fn(),
}));

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('components/public/forms/messages/useToast', () => ({
  useToast: () => toast,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

function showNotice() {
  render(
    <MemoryRouter>
      <RegisterEmailPendingNotice email="pessoa@empresa.com" />
    </MemoryRouter>,
  );
}

describe('reenvio após o cadastro', () => {
  it('usa a mensagem genérica e inicia a espera retornada pela API', async () => {
    const user = userEvent.setup();
    vi.mocked(ServiceResendConfirmation).mockResolvedValue({
      ok: true,
      status: 200,
      message:
        'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.',
      retryAfterSeconds: 61,
    });

    showNotice();
    await user.click(
      screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' }),
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Solicitação recebida',
        'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.',
      );
      expect(
        screen.getByRole('button', { name: 'Solicitar novamente em 01:01' }),
      ).toBeDisabled();
    });
  });

  it('atualiza a espera com um 429 e bloqueia cliques adicionais', async () => {
    const user = userEvent.setup();
    vi.mocked(ServiceResendConfirmation).mockResolvedValue({
      ok: false,
      status: 429,
      error: 'rate_limited',
      message: 'Aguarde antes de solicitar outra confirmação.',
      retryAfterSeconds: 180,
    });

    showNotice();
    await user.click(
      screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Solicitar novamente em 03:00' }),
      ).toBeDisabled();
    });

    await user.click(
      screen.getByRole('button', { name: 'Solicitar novamente em 03:00' }),
    );
    expect(ServiceResendConfirmation).toHaveBeenCalledExactlyOnceWith(
      'pessoa@empresa.com',
    );
  });
});

describe('tela depois do cadastro', () => {
  it('e-mail do Gmail: botão que abre a caixa de entrada numa aba nova, sem o aviso longo', () => {
    render(
      <MemoryRouter>
        <RegisterEmailPendingNotice email="pessoa@gmail.com" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Confirme seu e-mail' })).toBeInTheDocument();
    const open = screen.getByRole('link', { name: /Abrir o Gmail/ });
    expect(open).toHaveAttribute('href', 'https://mail.google.com/mail/u/0/#inbox');
    expect(open).toHaveAttribute('target', '_blank');
    expect(open).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByText(/Atenção!/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Esqueceu a senha?' })).not.toBeInTheDocument();
  });

  it('e-mail de empresa: sem botão de provedor, com o reenvio e o login', () => {
    showNotice();
    expect(screen.queryByRole('link', { name: /Abrir o/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir para login/ })).toHaveAttribute('href', '/login');
  });
});
