import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ServiceCompleteSignup } from 'src/services/serviceUser';

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('src/services/serviceUser', () => ({ ServiceCompleteSignup: vi.fn() }));

import FormCompleteSignup from './formCompleteSignup';

function fill() {
  fireEvent.change(screen.getByLabelText('Nome do negócio'), { target: { value: 'Padaria Bom Pão' } });
  fireEvent.change(screen.getByLabelText(/Contato/), { target: { value: '11987654321' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Concluir cadastro' }));
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('FormCompleteSignup', () => {
  it('sugere o nome vindo do Google e não pede e-mail nem senha', () => {
    render(<FormCompleteSignup defaultFullName="Maria Silva" />);
    expect(screen.getByLabelText('Nome do negócio')).toHaveValue('Maria Silva');
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Senha/)).not.toBeInTheDocument();
  });

  it('envia nome, telefone e termos e segue para o Dashboard', async () => {
    vi.mocked(ServiceCompleteSignup).mockResolvedValue({ ok: true });
    render(<FormCompleteSignup />);
    fill();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/user/dashboard', { replace: true }));
    expect(ServiceCompleteSignup).toHaveBeenCalledWith({
      fullName: 'Padaria Bom Pão',
      phone: '+5511987654321',
      terms: true,
    });
  });

  it('sem aceitar os termos não envia', async () => {
    render(<FormCompleteSignup />);
    fireEvent.change(screen.getByLabelText('Nome do negócio'), { target: { value: 'Padaria Bom Pão' } });
    fireEvent.change(screen.getByLabelText(/Contato/), { target: { value: '11987654321' } });
    fireEvent.click(screen.getByRole('button', { name: 'Concluir cadastro' }));

    expect(await screen.findByText('É necessário aceitar os termos')).toBeInTheDocument();
    expect(ServiceCompleteSignup).not.toHaveBeenCalled();
  });

  it('telefone de outra conta mostra o erro no campo', async () => {
    vi.mocked(ServiceCompleteSignup).mockRejectedValue(
      Object.assign(new Error('phone_taken'), { status: 409, code: 'phone_taken' }),
    );
    render(<FormCompleteSignup />);
    fill();

    expect(await screen.findByText('Este telefone já está em outra conta.')).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('outra falha mostra o aviso genérico', async () => {
    vi.mocked(ServiceCompleteSignup).mockRejectedValue(new Error('boom'));
    render(<FormCompleteSignup />);
    fill();

    expect(await screen.findByText(/Não deu para salvar agora/)).toBeInTheDocument();
  });
});
