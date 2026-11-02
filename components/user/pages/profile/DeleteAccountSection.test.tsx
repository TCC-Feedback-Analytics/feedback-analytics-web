import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  hasPassword: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock('src/services/serviceUser', () => ({
  ServiceAccountHasPassword: mocks.hasPassword,
  ServiceDeleteAccount: mocks.deleteAccount,
}));

import DeleteAccountSection from './DeleteAccountSection';

beforeEach(() => {
  mocks.hasPassword.mockResolvedValue(true);
  mocks.deleteAccount.mockResolvedValue('deleted');
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

const deleteButton = () => screen.getByRole('button', { name: /Excluir para sempre/ });

describe('Excluir minha conta', () => {
  it('diz o que será apagado e só libera com a senha e a palavra EXCLUIR', async () => {
    await openDialog();
    expect(screen.getByText(/todos os feedbacks recebidos/)).toBeInTheDocument();
    expect(deleteButton()).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Sua senha'), { target: { value: 'segredo-123' } });
    expect(deleteButton()).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'excluir' } });
    expect(deleteButton()).toBeEnabled();
  });

  it('exclui com a senha e mostra que a conta foi excluída, sem deixar fechar', async () => {
    await openDialog();
    fireEvent.change(screen.getByLabelText('Sua senha'), { target: { value: 'segredo-123' } });
    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'EXCLUIR' } });
    fireEvent.click(deleteButton());

    expect(await screen.findByText('Sua conta foi excluída.')).toBeInTheDocument();
    expect(mocks.deleteAccount).toHaveBeenCalledWith('segredo-123');
    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para o início' })).toBeInTheDocument();
  });

  it('senha errada avisa e deixa tentar de novo', async () => {
    mocks.deleteAccount.mockResolvedValue('wrong_password');
    await openDialog();
    fireEvent.change(screen.getByLabelText('Sua senha'), { target: { value: 'errada' } });
    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'EXCLUIR' } });
    fireEvent.click(deleteButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Senha incorreta');
    expect(deleteButton()).toBeEnabled();
  });

  it('quem só entra pelo Google não vê o campo de senha; com a entrada antiga, pede para entrar de novo', async () => {
    mocks.hasPassword.mockResolvedValue(false);
    mocks.deleteAccount.mockResolvedValue('login_again');
    await openDialog();
    await vi.waitFor(() => expect(screen.queryByLabelText('Sua senha')).not.toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Para confirmar, digite/), { target: { value: 'EXCLUIR' } });
    fireEvent.click(deleteButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('entre de novo');
    expect(mocks.deleteAccount).toHaveBeenCalledWith(undefined);
  });

  it('cancelar fecha sem excluir', async () => {
    await openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.deleteAccount).not.toHaveBeenCalled();
  });
});
