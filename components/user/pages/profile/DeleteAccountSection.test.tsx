import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  hasPassword: vi.fn(),
  requestDeletion: vi.fn(),
}));

vi.mock('src/services/serviceUser', () => ({
  ServiceAccountHasPassword: mocks.hasPassword,
  ServiceRequestAccountDeletion: mocks.requestDeletion,
}));

import DeleteAccountSection from './DeleteAccountSection';

beforeEach(() => {
  mocks.hasPassword.mockResolvedValue(true);
  mocks.requestDeletion.mockResolvedValue('email_sent');
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

async function openDialog() {
  render(<DeleteAccountSection />);
  fireEvent.click(screen.getByRole('button', { name: /Excluir minha conta/ }));
  return screen.findByRole('dialog');
}

const sendButton = () => screen.getByRole('button', { name: /Enviar link de confirmação/ });

describe('Excluir minha conta', () => {
  it('diz o que será apagado, avisa dos 15 dias e só libera com a senha e a palavra EXCLUIR', async () => {
    await openDialog();
    expect(screen.getByText(/todos os feedbacks recebidos/)).toBeInTheDocument();
    expect(screen.getByText(/fica parada por 15 dias\. Nesse prazo/)).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Sua senha'), { target: { value: 'segredo-123' } });
    expect(sendButton()).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'excluir' } });
    expect(sendButton()).toBeEnabled();
  });

  it('com a senha, manda o link ao e-mail e avisa que nada foi apagado ainda', async () => {
    await openDialog();
    fireEvent.change(screen.getByLabelText('Sua senha'), { target: { value: 'segredo-123' } });
    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'EXCLUIR' } });
    fireEvent.click(sendButton());

    expect(await screen.findByText('Confira o seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText(/Nada foi apagado ainda/)).toBeInTheDocument();
    expect(mocks.requestDeletion).toHaveBeenCalledWith('segredo-123');
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('senha errada avisa e deixa tentar de novo', async () => {
    mocks.requestDeletion.mockResolvedValue('wrong_password');
    await openDialog();
    fireEvent.change(screen.getByLabelText('Sua senha'), { target: { value: 'errada' } });
    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'EXCLUIR' } });
    fireEvent.click(sendButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Senha incorreta');
    expect(sendButton()).toBeEnabled();
  });

  it('muitos pedidos seguidos pedem para esperar', async () => {
    mocks.requestDeletion.mockResolvedValue('rate_limited');
    await openDialog();
    fireEvent.change(screen.getByLabelText('Sua senha'), { target: { value: 'chute' } });
    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'EXCLUIR' } });
    fireEvent.click(sendButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Aguarde um pouco');
  });

  it('quem só entra pelo Google não vê o campo de senha; com a entrada antiga, pede para entrar de novo', async () => {
    mocks.hasPassword.mockResolvedValue(false);
    mocks.requestDeletion.mockResolvedValue('login_again');
    await openDialog();
    await vi.waitFor(() => expect(screen.queryByLabelText('Sua senha')).not.toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'EXCLUIR' } });
    fireEvent.click(sendButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('entre de novo');
    expect(mocks.requestDeletion).toHaveBeenCalledWith(undefined);
  });

  it('cancelar fecha sem pedir nada', async () => {
    await openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.requestDeletion).not.toHaveBeenCalled();
  });
});
