import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ActionIaSettings } from 'src/routes/actions/actionIaSettings';
import { LoaderIaSettings } from 'src/routes/loaders/loaderIaSettings';
import {
  ServiceGetIaConfig, ServiceGetIaModels, ServiceUpdateIaModel, ServiceDeleteIaConfig, ServiceUpdateIaConfig,
  type IaConfigResponse,
} from 'src/services/serviceIaConfig';
import FormIaSettings from './formIaSettings';

vi.unmock('react-router-dom');
vi.mock('src/services/serviceIaConfig', () => ({
  ServiceGetIaConfig: vi.fn(), ServiceGetIaModels: vi.fn(), ServiceUpdateIaModel: vi.fn(),
  ServiceDeleteIaConfig: vi.fn(), ServiceUpdateIaConfig: vi.fn(),
}));
const { toast } = vi.hoisted(() => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('components/public/forms/messages/useToast', () => ({ useToast: () => toast }));

let stored: IaConfigResponse;
beforeEach(() => {
  vi.resetAllMocks();
  stored = { hasKey: true, provider: 'openrouter', model: 'openrouter/auto', keyHint: '1234' };
  vi.mocked(ServiceGetIaConfig).mockImplementation(async () => ({ ...stored }));
  vi.mocked(ServiceGetIaModels).mockImplementation(async () => ({
    models: [
      { id: 'openrouter/auto', name: 'Auto Router', isAutomatic: true, contextLength: null, maxCompletionTokens: null },
      { id: 'vendor/model', name: 'Modelo de teste', isAutomatic: false, contextLength: 128000, maxCompletionTokens: 32768 },
    ],
    source: stored.hasKey ? 'user' : 'public', currentModel: stored.hasKey ? stored.model : null,
    currentModelAvailable: stored.hasKey ? true : null, stale: false, fetchedAt: '2026-09-04T12:00:00.000Z',
  }));
  vi.mocked(ServiceUpdateIaModel).mockImplementation(async (model) => {
    stored = { ...stored, model };
    return { ...stored };
  });
  vi.mocked(ServiceDeleteIaConfig).mockImplementation(async () => {
    stored = { hasKey: false, provider: null, model: null, keyHint: null };
    return { ...stored };
  });
  vi.mocked(ServiceUpdateIaConfig).mockImplementation(async (payload) => {
    stored = { hasKey: true, provider: 'openrouter', model: payload.model || 'openrouter/auto', keyHint: payload.apiKey.slice(-4) };
    return { ...stored };
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function showPage() {
  const router = createMemoryRouter([{
    path: '/ia-settings', element: <FormIaSettings />, loader: LoaderIaSettings, action: ActionIaSettings,
    hydrateFallbackElement: <p>Carregando configuração...</p>,
  }], { initialEntries: ['/ia-settings'] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('IA — formulário, action e revalidação real do router (serviços simulados)', () => {
  it('troca modelo, remove chave e cadastra outra sem misturar os catálogos', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const router = showPage();
    try {
      await waitFor(() => expect(screen.getByRole('combobox')).toBeEnabled());
      await user.selectOptions(screen.getByRole('combobox'), 'vendor/model');
      await user.click(screen.getByRole('button', { name: 'Salvar modelo' }));
      await waitFor(() => expect(screen.getByText(/Modelo ativo: vendor\/model/)).toBeInTheDocument());
      await waitFor(() => expect(screen.getByRole('combobox')).toBeEnabled());
      expect(ServiceUpdateIaModel).toHaveBeenCalledExactlyOnceWith('vendor/model');
      expect(ServiceUpdateIaConfig).not.toHaveBeenCalled();
      expect(screen.queryByLabelText(/Chave da API OpenRouter/)).not.toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: 'Remover chave' }));
      await waitFor(() => expect(screen.getByRole('combobox')).toBeEnabled());
      const keyInput = await screen.findByLabelText(/Chave da API OpenRouter/);
      expect(keyInput).toHaveValue('');
      expect(screen.getByText(/Catálogo público de modelos compatíveis/)).toBeInTheDocument();
      await user.type(keyInput, 'new-test-key-5678');
      await user.click(screen.getByRole('button', { name: 'Salvar Configuração de IA' }));
      await waitFor(() => expect(screen.queryByLabelText(/Chave da API OpenRouter/)).not.toBeInTheDocument());
      await waitFor(() => expect(screen.getByRole('combobox')).toBeEnabled());
      expect(ServiceUpdateIaConfig).toHaveBeenCalledExactlyOnceWith({ provider: 'openrouter', model: 'openrouter/auto', apiKey: 'new-test-key-5678' });
      expect(screen.getByText(/Chave final: sk-or-…5678/)).toBeInTheDocument();
      expect(screen.queryByText(/A configuração foi alterada/)).not.toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledTimes(3);
    } finally {
      router.dispose();
    }
  });

  it('falha no PATCH preserva a tentativa após o loader revalidar', async () => {
    const user = userEvent.setup();
    vi.mocked(ServiceUpdateIaModel).mockRejectedValue({ code: 'ia_model_unavailable' });
    const router = showPage();
    try {
      await waitFor(() => expect(screen.getByRole('combobox')).toBeEnabled());
      await user.selectOptions(screen.getByRole('combobox'), 'vendor/model');
      await user.click(screen.getByRole('button', { name: 'Salvar modelo' }));
      await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeEnabled());
      expect(ServiceGetIaConfig).toHaveBeenCalledTimes(2);
      expect(screen.getByRole('combobox')).toHaveValue('vendor/model');
      expect(screen.getByText(/Modelo ativo: openrouter\/auto/)).toBeInTheDocument();
    } finally {
      router.dispose();
    }
  });
});
