import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  hasPassword: vi.fn(),
  forgotPassword: vi.fn(),
}));

vi.mock('src/services/serviceUser', () => ({
  ServiceAccountHasPassword: mocks.hasPassword,
}));

vi.mock('src/services/serviceAuth', () => ({
  ServiceForgotPassword: mocks.forgotPassword,
}));

import CreatePasswordSection from './CreatePasswordSection';

const EMAIL = 'gestor@exemplo.com';

beforeEach(() => {
  mocks.hasPassword.mockResolvedValue(false);
  mocks.forgotPassword.mockResolvedValue({ ok: true, message: 'ok' });
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('Entrar também com senha (Perfil)', () => {
  it('aparece para quem só entra pelo Google e envia o link para o e-mail da conta', async () => {
    render(<CreatePasswordSection email={EMAIL} />);
    fireEvent.click(await screen.findByRole('button', { name: /Enviar link para criar senha/ }));

    expect(await screen.findByRole('status')).toHaveTextContent(`Enviamos o link para ${EMAIL}`);
    expect(mocks.forgotPassword).toHaveBeenCalledWith(EMAIL);
    expect(screen.queryByRole('button', { name: /Enviar link/ })).not.toBeInTheDocument();
  });

  it('não aparece para quem já tem senha', async () => {
    mocks.hasPassword.mockResolvedValue(true);
    render(<CreatePasswordSection email={EMAIL} />);
    await vi.waitFor(() => expect(mocks.hasPassword).toHaveBeenCalled());
    expect(screen.queryByText('Entrar também com senha')).not.toBeInTheDocument();
  });

  it('não aparece quando não deu para saber se a conta tem senha', async () => {
    mocks.hasPassword.mockResolvedValue(null);
    render(<CreatePasswordSection email={EMAIL} />);
    await vi.waitFor(() => expect(mocks.hasPassword).toHaveBeenCalled());
    expect(screen.queryByText('Entrar também com senha')).not.toBeInTheDocument();
  });

  it('mostra o erro do envio e deixa tentar de novo', async () => {
    mocks.forgotPassword.mockResolvedValue({ ok: false, error: 'rate_limited', message: 'Muitos pedidos de nova senha. Aguarde e tente novamente.' });
    render(<CreatePasswordSection email={EMAIL} />);
    fireEvent.click(await screen.findByRole('button', { name: /Enviar link para criar senha/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Muitos pedidos de nova senha');
    expect(screen.getByRole('button', { name: /Enviar link para criar senha/ })).toBeEnabled();
  });
});
