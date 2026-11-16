import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../public/forgotPassword';

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('components/public/forms/formForgotPassword', () => ({
  default: () => <div data-testid="form-forgot-password">Forgot Password Form</div>,
}));

const EXPIRED_LINK_NOTICE = 'O link de redefinição expirou ou já foi usado. Peça um novo abaixo.';

function renderForgotPassword(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ForgotPassword />
    </MemoryRouter>,
  );
}

describe('[Unidade] ForgotPassword Page', () => {
  it('sem ?error, mostra só o formulário, sem aviso', () => {
    renderForgotPassword('/forgot-password');

    expect(screen.getByTestId('form-forgot-password')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('com ?error, avisa que o link venceu acima do formulário', () => {
    renderForgotPassword('/forgot-password?error=INVALID_TOKEN');

    const notice = screen.getByRole('alert');
    expect(notice).toHaveTextContent(EXPIRED_LINK_NOTICE);
    expect(screen.getByTestId('form-forgot-password')).toBeInTheDocument();
    expect(
      notice.compareDocumentPosition(screen.getByTestId('form-forgot-password'))
        & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
