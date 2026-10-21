import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({ connect: vi.fn(), toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/services/serviceIaConfig', () => ({ ServiceConnectOpenRouter: mocks.connect }));
vi.mock('components/public/forms/messages/useToast', () => ({ useToast: () => mocks.toast }));

import OpenRouterCallback from 'pages/user/openrouterCallback';
import ConnectOpenRouterButton from 'components/user/shared/ConnectOpenRouterButton';
import { prepareOpenRouterConnect, takePendingOpenRouterConnect } from 'src/lib/utils/openRouterConnect';

function renderCallback(search: string) {
  render(
    <MemoryRouter initialEntries={[`/user/openrouter/callback${search}`]}>
      <Routes>
        <Route path="/user/openrouter/callback" element={<OpenRouterCallback />} />
        <Route path="/user/dashboard" element={<p>Dashboard aberto</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => sessionStorage.clear());
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  cleanup();
});

describe('volta do OpenRouter', () => {
  it('troca o código no gateway e volta para a tela de origem', async () => {
    await prepareOpenRouterConnect({ returnTo: '/user/dashboard', model: 'vendor/model', origin: 'https://app.exemplo' });
    const verifier = JSON.parse(sessionStorage.getItem('feedback:openrouter-connect')!).codeVerifier;
    mocks.connect.mockResolvedValue({ hasKey: true, provider: 'openrouter', model: 'vendor/model', keyHint: '5678' });

    renderCallback('?code=abc123');

    expect(await screen.findByText('Dashboard aberto')).toBeInTheDocument();
    expect(mocks.connect).toHaveBeenCalledWith({ code: 'abc123', codeVerifier: verifier, model: 'vendor/model' });
    expect(mocks.toast.success).toHaveBeenCalledWith('OpenRouter conectado!', expect.any(String));
  });

  it('sem o pedido guardado (outra aba, demorou demais), explica e não chama o gateway', async () => {
    renderCallback('?code=abc123');
    expect(await screen.findByRole('alert')).toHaveTextContent('não foi concluída');
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Voltar e tentar de novo' })).toHaveAttribute('href', '/user/edit/ia-settings');
  });

  it('código recusado: mensagem do gateway e volta para a tela de origem', async () => {
    await prepareOpenRouterConnect({ returnTo: '/user/dashboard', origin: 'https://app.exemplo' });
    mocks.connect.mockRejectedValue(Object.assign(new Error('400'), { status: 400, code: 'openrouter_connect_failed' }));

    renderCallback('?code=abc123');

    expect(await screen.findByRole('alert')).toHaveTextContent('O OpenRouter não confirmou a conexão');
    expect(screen.getByRole('link', { name: 'Voltar e tentar de novo' })).toHaveAttribute('href', '/user/dashboard');
  });
});

describe('botão Conectar com OpenRouter', () => {
  it('guarda o pedido, roda o "antes de sair" e vai para o OpenRouter', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign, origin: 'https://app.exemplo' });
    const before = vi.fn();
    render(<ConnectOpenRouterButton returnTo="/user/dashboard" onBeforeRedirect={before} />);

    fireEvent.click(screen.getByRole('button', { name: /Conectar com OpenRouter/ }));

    await waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
    expect(String(assign.mock.calls[0][0])).toMatch(/^https:\/\/openrouter\.ai\/auth\?/);
    expect(before).toHaveBeenCalledTimes(1);
    expect(takePendingOpenRouterConnect()?.returnTo).toBe('/user/dashboard');
  });
});
