import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Privacy from 'pages/public/privacy';
import Terms from 'pages/public/terms';
import FieldTermsRegister from 'components/public/forms/fields/fieldsRegister/fieldTerms';

vi.unmock('react-router-dom');

afterEach(() => {
  cleanup();
});

describe('páginas legais', () => {
  it('Política de Privacidade lista os direitos e liga aos Termos', () => {
    render(<Privacy />, { wrapper: MemoryRouter });
    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidade' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '8. Seus direitos' })).toBeInTheDocument();
    expect(screen.getByText(/Versão v1/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ler os Termos de Serviço' })).toHaveAttribute('href', '/termos');
  });

  it('Termos de Serviço ligam à Política de Privacidade', () => {
    render(<Terms />, { wrapper: MemoryRouter });
    expect(screen.getByRole('heading', { level: 1, name: 'Termos de Serviço' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ler a Política de Privacidade' })).toHaveAttribute('href', '/privacidade');
  });

  it('o aceite do cadastro abre Termos e Privacidade em outra aba', () => {
    render(<FieldTermsRegister id="terms" name="terms" />);
    const terms = screen.getByRole('link', { name: 'Termos de Serviço' });
    const privacy = screen.getByRole('link', { name: 'Política de Privacidade' });
    expect(terms).toHaveAttribute('href', '/termos');
    expect(privacy).toHaveAttribute('href', '/privacidade');
    expect(terms).toHaveAttribute('target', '_blank');
    expect(privacy).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
