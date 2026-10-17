import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom';
import type { IaConfigResponse } from 'src/services/serviceIaConfig';

const mocks = vi.hoisted(() => ({
  updateAction: vi.fn(),
  catalog: {
    models: [
      { id: 'openrouter/auto', name: 'Auto Router', isAutomatic: true },
      { id: 'vendor/paid', name: 'Modelo Pago', isAutomatic: false },
      { id: 'vendor/free:free', name: 'Modelo Grátis', isAutomatic: false },
      { id: 'vendor/other:free', name: 'Outro Grátis', isAutomatic: false },
    ],
  },
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/hooks/useIaModels', () => ({
  useIaModels: () => ({ catalog: mocks.catalog, loading: false, error: undefined, reload: vi.fn() }),
}));

import IaModelQuickSwitch from './IaModelQuickSwitch';
import { INTENT_UPDATE_IA_MODEL } from 'src/lib/constants/routes/intents';

function renderSwitch(iaConfig: IaConfigResponse, onChanged = vi.fn()) {
  const router = createMemoryRouter([
    {
      id: 'user',
      path: '/user',
      loader: () => ({ iaConfig }),
      element: <Outlet />,
      children: [
        { path: 'dashboard', element: <IaModelQuickSwitch onChanged={onChanged} /> },
        { path: 'edit/ia-settings', action: mocks.updateAction, element: <p>Configuração de IA</p> },
      ],
    },
  ], { initialEntries: ['/user/dashboard'] });
  render(<RouterProvider router={router} />);
  return onChanged;
}

// Quem usa um modelo gratuito abre só com os gratuitos.
const withKey: IaConfigResponse = { hasKey: true, provider: 'openrouter', model: 'vendor/free:free', keyHint: 'xyz9' };

describe('[Unidade] Troca rápida de modelo', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('lista os outros gratuitos (sem o atual) e troca sem sair da tela', async () => {
    mocks.updateAction.mockResolvedValue({ ok: true, operation: 'model', iaConfig: { ...withKey, model: 'vendor/other:free', questionsGeneration: { status: 'queued' } } });
    const onChanged = renderSwitch(withKey);

    expect(await screen.findByText('Modelo atual: vendor/free:free')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('combobox', { name: 'Escolher outro modelo de IA' }));
    const dropdown = screen.getByRole('dialog', { name: 'Opções de seleção' });
    expect(within(dropdown).queryByRole('option', { name: /Modelo Pago/ })).not.toBeInTheDocument();
    expect(within(dropdown).queryByRole('option', { name: /Modelo Grátis/ })).not.toBeInTheDocument();
    fireEvent.click(within(dropdown).getByRole('option', { name: /Outro Grátis/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Trocar modelo' }));
    await vi.waitFor(() => expect(onChanged).toHaveBeenCalledWith('vendor/other:free', { status: 'queued' }));
    const form = await mocks.updateAction.mock.calls[0][0].request.formData();
    expect(form.get('intent')).toBe(INTENT_UPDATE_IA_MODEL);
    expect(form.get('model')).toBe('vendor/other:free');
    expect(screen.queryByText('Configuração de IA')).not.toBeInTheDocument();
  });

  it('mostra o erro da troca e não avisa o pai', async () => {
    mocks.updateAction.mockResolvedValue({ ok: false, message: 'Modelo indisponível para a sua chave.' });
    const onChanged = renderSwitch(withKey);
    await screen.findByText('Modelo atual: vendor/free:free');
    fireEvent.click(screen.getByRole('combobox', { name: 'Escolher outro modelo de IA' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Opções de seleção' })).getByRole('option', { name: /Outro Grátis/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Trocar modelo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Modelo indisponível para a sua chave.');
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('sem chave configurada, não aparece', async () => {
    renderSwitch({ hasKey: false, provider: null, model: null, keyHint: null });
    await vi.waitFor(() => expect(screen.queryByText(/Modelo atual/)).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Trocar modelo' })).not.toBeInTheDocument();
  });
});
