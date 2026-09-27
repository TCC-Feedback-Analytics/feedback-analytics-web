import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ActionResendConfirmation } from 'src/routes/actions/actionResendConfirmation';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';
import FormResendConfirmation from './formResendConfirmation';

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

const genericMessage =
  'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.';

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

function showForm() {
  const router = createMemoryRouter(
    [
      {
        path: '/resend-confirmation',
        element: <FormResendConfirmation />,
        action: ActionResendConfirmation,
      },
      { path: '/login', element: <p>Tela de login</p> },
    ],
    { initialEntries: ['/resend-confirmation'] },
  );

  render(<RouterProvider router={router} />);
  return router;
}

describe('reenvio de confirmação', () => {
  it('envia o e-mail e exibe somente a resposta genérica', async () => {
    const user = userEvent.setup();
    vi.mocked(ServiceResendConfirmation).mockResolvedValue({
      ok: true,
      message: genericMessage,
    });
    const router = showForm();

    try {
      await user.type(screen.getByLabelText('E-mail'), 'pendente@empresa.com');
      await user.click(screen.getByRole('button', { name: 'Reenviar confirmação' }));

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(genericMessage);
      });
      expect(ServiceResendConfirmation).toHaveBeenCalledExactlyOnceWith(
        'pendente@empresa.com',
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Solicitação recebida',
        genericMessage,
      );
      expect(screen.getByRole('link', { name: 'Voltar ao login' })).toHaveAttribute(
        'href',
        '/login',
      );
    } finally {
      router.dispose();
    }
  });

  it('mantém o formulário e orienta a aguardar quando o limite é atingido', async () => {
    const user = userEvent.setup();
    vi.mocked(ServiceResendConfirmation).mockResolvedValue({
      ok: false,
      error: 'rate_limited',
      message: 'Muitas solicitações. Aguarde e tente novamente.',
    });
    const router = showForm();

    try {
      await user.type(screen.getByLabelText('E-mail'), 'pessoa@empresa.com');
      await user.click(screen.getByRole('button', { name: 'Reenviar confirmação' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Muitas tentativas',
          'Muitas solicitações. Aguarde e tente novamente.',
        );
      });
      expect(screen.getByRole('button', { name: 'Reenviar confirmação' })).toBeEnabled();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally {
      router.dispose();
    }
  });
});
