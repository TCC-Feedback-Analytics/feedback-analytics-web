import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({ submit: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useSubmit: () => mocks.submit,
  useNavigation: () => ({ state: 'idle' }),
  useActionData: () => undefined,
}));
vi.mock('components/public/forms/messages/useToast', () => ({ useToast: () => ({ error: vi.fn(), success: vi.fn() }) }));

import FormRegister from './formRegister';

function fill(password: string) {
  fireEvent.change(screen.getByLabelText('Nome do negócio'), { target: { value: 'Padaria Bom Pão' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'contato@bompao.com.br' } });
  fireEvent.change(screen.getByLabelText(/Contato/), { target: { value: '11987654321' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: password } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('FormRegister', () => {
  it('pede "Nome do negócio" e não pede CPF/CNPJ nem tipo de conta', () => {
    render(<FormRegister />);
    expect(screen.getByLabelText('Nome do negócio')).toBeInTheDocument();
    expect(screen.queryByLabelText(/CPF|CNPJ/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pessoa (física|jurídica)/i)).not.toBeInTheDocument();
  });

  it('senha fraca não envia e explica o porquê, abaixo do campo', async () => {
    render(<FormRegister />);
    fill('Palavra123palavra');

    const alert = await screen.findByText(/Senha fácil de adivinhar/);
    expect(alert.tagName).toBe('P');
    expect(alert.className).not.toContain('absolute');
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('senha forte envia sem documento', async () => {
    render(<FormRegister />);
    fill('Gato!Verde!Pulou');

    await waitFor(() => expect(mocks.submit).toHaveBeenCalledTimes(1));
    const formData = mocks.submit.mock.calls[0][0] as FormData;
    expect(formData.get('fullName')).toBe('Padaria Bom Pão');
    expect(formData.get('document')).toBeNull();
    expect(formData.get('accountType')).toBeNull();
  });

  it('a barra de força aparece só no campo "Senha"', async () => {
    render(<FormRegister />);
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'sol azul de manha' } });
    fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'sol azul de manha' } });
    expect(await screen.findByText('Forte')).toBeInTheDocument();
    expect(screen.getAllByText('Força da senha')).toHaveLength(1);
  });
});
