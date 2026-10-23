import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import Public from '../public';

// O setup global usa um mock mínimo do roteador; este teste precisa do roteador real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('components/public/layout/header', () => ({
  default: () => <div data-testid="public-header">Cabeçalho público</div>,
}));

function renderLayout(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Public />}>
          <Route path="*" element={<div>Conteúdo público</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('layout pública', () => {
  it('remove o cabeçalho do formulário de coleta', () => {
    renderLayout('/feedback/qrcode');

    expect(screen.queryByTestId('public-header')).not.toBeInTheDocument();
    expect(screen.getByText('Conteúdo público')).toBeInTheDocument();
  });

  it('remove o cabeçalho da página de login', () => {
    renderLayout('/login');

    expect(screen.queryByTestId('public-header')).not.toBeInTheDocument();
    expect(screen.getByText('Conteúdo público')).toBeInTheDocument();
  });

  it('mantém o cabeçalho nas demais páginas públicas', () => {
    renderLayout('/register');

    expect(screen.getByTestId('public-header')).toBeInTheDocument();
  });
});
