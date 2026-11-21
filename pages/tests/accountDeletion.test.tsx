import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  cancel: vi.fn(),
  getUser: vi.fn(),
  logout: vi.fn(),
}));

vi.unmock('react-router-dom');
vi.mock('src/services/serviceUser', () => ({
  ServiceConfirmAccountDeletion: mocks.confirm,
  ServiceCancelAccountDeletion: mocks.cancel,
  ServiceGetUser: mocks.getUser,
}));
vi.mock('src/services/serviceAuth', () => ({ ServiceLogout: mocks.logout }));
vi.mock('components/public/shared/AuthShell', () => ({
  default: ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  ),
}));

import AccountDeletionConfirm from 'pages/public/accountDeletionConfirm';
import AccountDeletionPending from 'pages/public/accountDeletionPending';

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/conta/excluir" element={<AccountDeletionConfirm />} />
        <Route path="/conta/exclusao-agendada" element={<AccountDeletionPending />} />
        <Route path="/user/dashboard" element={<p>Painel</p>} />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.logout.mockResolvedValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('link do e-mail (/conta/excluir)', () => {
  it('só confirma com o clique, e então mostra a data e como desistir', async () => {
    mocks.confirm.mockResolvedValue({ outcome: 'scheduled', scheduledFor: '2026-12-06T12:00:00.000Z' });
    renderAt('/conta/excluir?token=tok-123');

    // Abrir o link não confirma nada: um leitor de e-mail que abre os links sozinho não apaga a conta.
    expect(mocks.confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Confirmar a exclusão/ }));

    expect(await screen.findByText('Exclusão agendada')).toBeInTheDocument();
    expect(screen.getByText('Sua conta será excluída em 06/12/2026.')).toBeInTheDocument();
    expect(screen.getByText(/Cancelar exclusão/)).toBeInTheDocument();
    expect(mocks.confirm).toHaveBeenCalledWith('tok-123');
  });

  it('fora do navegador logado, explica onde abrir o link', async () => {
    mocks.confirm.mockResolvedValue({ outcome: 'not_logged_in' });
    renderAt('/conta/excluir?token=tok-123');
    fireEvent.click(screen.getByRole('button', { name: /Confirmar a exclusão/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('no navegador em que você está logado');
  });

  it('sem o token, avisa e não deixa confirmar', () => {
    renderAt('/conta/excluir');
    expect(screen.getByRole('alert')).toHaveTextContent('já foi usado ou venceu');
    expect(screen.getByRole('button', { name: /Confirmar a exclusão/ })).toBeDisabled();
  });
});

describe('conta parada (/conta/exclusao-agendada)', () => {
  it('mostra a data e, ao cancelar, volta para o painel', async () => {
    mocks.getUser.mockResolvedValue({ user: { id: 'u1' }, deletion_scheduled_for: '2026-12-06T12:00:00.000Z' });
    mocks.cancel.mockResolvedValue(true);
    renderAt('/conta/exclusao-agendada');

    expect(await screen.findByText(/marcada para 06\/12\/2026/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar exclusão' }));

    expect(await screen.findByText('Painel')).toBeInTheDocument();
    expect(mocks.cancel).toHaveBeenCalledOnce();
  });

  it('sair não cancela a exclusão', async () => {
    mocks.getUser.mockResolvedValue({ user: { id: 'u1' }, deletion_scheduled_for: '2026-12-06T12:00:00.000Z' });
    renderAt('/conta/exclusao-agendada');

    fireEvent.click(await screen.findByRole('button', { name: 'Sair' }));

    expect(await screen.findByText('Tela de login')).toBeInTheDocument();
    expect(mocks.cancel).not.toHaveBeenCalled();
  });

  it('conta ativa não fica nesta tela', async () => {
    mocks.getUser.mockResolvedValue({ user: { id: 'u1' }, deletion_scheduled_for: null });
    renderAt('/conta/exclusao-agendada');
    expect(await screen.findByText('Painel')).toBeInTheDocument();
  });
});
