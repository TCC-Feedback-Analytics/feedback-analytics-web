import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import FieldText from './fieldText';
import FieldPassword from './fieldPassword';

afterEach(() => cleanup());

describe('campos do login no celular', () => {
  it('o e-mail é o "username" do par, sem maiúscula nem correção automática', () => {
    render(<FieldText id="email" name="email" label="E-mail" />);
    const input = screen.getByLabelText('E-mail');
    expect(input).toHaveAttribute('autocomplete', 'username');
    expect(input).toHaveAttribute('inputmode', 'email');
    expect(input).toHaveAttribute('autocapitalize', 'none');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('a senha é a atual, para o gerenciador de senhas preencher', () => {
    render(<FieldPassword id="password" name="password" label="Senha" />);
    expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('a fonte é de 16px no celular, para o Safari não dar zoom ao tocar', () => {
    render(<FieldPassword id="password" name="password" label="Senha" />);
    expect(screen.getByLabelText('Senha').className).toMatch(/(^|\s)text-base(\s|$)/);
    expect(screen.getByLabelText('Senha').className).toContain('md:text-sm');
  });
});
