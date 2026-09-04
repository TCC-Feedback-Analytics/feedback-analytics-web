import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFetcher, useLoaderData } from 'react-router-dom';
import { ServiceGetIaModels, type IaConfigResponse, type IaModelsResponse } from 'src/services/serviceIaConfig';
import type { IaSettingsActionResult } from 'src/routes/actions/actionIaSettings';
import FormIaSettings from './formIaSettings';

const { toast, revalidator } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  revalidator: { state: 'idle', revalidate: vi.fn() },
}));

vi.mock('react-router-dom', () => ({
  useFetcher: vi.fn(),
  useLoaderData: vi.fn(),
  useRevalidator: () => revalidator,
}));
vi.mock('src/services/serviceIaConfig', () => ({ ServiceGetIaModels: vi.fn() }));

vi.mock('components/public/forms/messages/useToast', () => ({
  useToast: () => toast,
}));

const emptyConfig: IaConfigResponse = {
  hasKey: false,
  provider: null,
  model: null,
  keyHint: null,
};

const savedConfig: IaConfigResponse = {
  hasKey: true,
  provider: 'openrouter',
  model: 'openrouter/auto',
  keyHint: 'xyz9',
};

const fetcher: {
  state: 'idle' | 'submitting' | 'loading';
  data?: IaSettingsActionResult;
  submit: ReturnType<typeof vi.fn>;
} = { state: 'idle', submit: vi.fn() };

function expectConfiguredView(model = 'openrouter/auto') {
  expect(screen.getByText('Chave configurada')).toBeInTheDocument();
  expect(screen.getByText(`Modelo ativo: ${model} • Chave final: sk-or-…xyz9`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Remover chave' })).toBeInTheDocument();
  expect(screen.queryByLabelText(/Chave da API OpenRouter/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Mostrar chave|Ocultar chave/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Pegar minha chave OpenRouter/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Salvar Configuração de IA' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Modelo de IA' })).toBeInTheDocument();
}

const dynamicModels: IaModelsResponse['models'] = [
  { id: 'openrouter/auto', name: 'Auto Router', isAutomatic: true, contextLength: null, maxCompletionTokens: null },
  { id: 'vendor/model-a', name: 'Modelo Alpha', isAutomatic: false, contextLength: 128000, maxCompletionTokens: 32768 },
  { id: 'vendor/model-b', name: 'Modelo Beta', isAutomatic: false, contextLength: 200000, maxCompletionTokens: 64000 },
];
const freeModels: IaModelsResponse['models'] = [
  { ...dynamicModels[1], id: 'vendor/model-a:free', name: 'Modelo Alpha grátis' },
  { ...dynamicModels[2], id: 'vendor/model-b:free', name: 'Modelo Beta grátis' },
];
function catalogFor(config: IaConfigResponse): IaModelsResponse {
  const currentModel = config.hasKey ? config.model || 'openrouter/auto' : null;
  return {
    models: dynamicModels, source: config.hasKey ? 'user' : 'public',
    currentModel, currentModelAvailable: currentModel ? dynamicModels.some((model) => model.id === currentModel) : null,
    stale: false, fetchedAt: '2026-09-04T12:00:00.000Z',
  };
}
async function ready() {
  await waitFor(() => expect(screen.queryByText('Carregando modelos compatíveis...')).not.toBeInTheDocument());
}

describe('FormIaSettings — cadastro e remoção da chave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetcher.state = 'idle';
    fetcher.data = undefined;
    revalidator.state = 'idle';
    vi.mocked(useFetcher).mockReturnValue(fetcher as unknown as ReturnType<typeof useFetcher>);
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: emptyConfig });
    vi.mocked(ServiceGetIaModels).mockReset().mockImplementation(async () => {
      const config = fetcher.data?.ok ? fetcher.data.iaConfig : (useLoaderData() as { iaConfig: IaConfigResponse }).iaConfig;
      return catalogFor(config || emptyConfig);
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('exibe o cadastro quando ainda não há chave configurada', async () => {
    render(<FormIaSettings />);
    await ready();

    expect(screen.getByLabelText(/Chave da API OpenRouter/)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('combobox', { name: 'Modelo de IA' })).toHaveValue('openrouter/auto');
    expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remover chave' })).not.toBeInTheDocument();
  });

  it.each(['openrouter/auto', 'meta-llama/custom-model'])(
    'mostra seletor, resumo e remoção, sem campo de token (modelo %s)',
    async (model) => {
      vi.mocked(useLoaderData).mockReturnValue({ iaConfig: { ...savedConfig, model } });

      render(<FormIaSettings />);
      await ready();

      expectConfiguredView(model);
    },
  );

  it('oculta o cadastro após salvar e o reabre vazio e protegido após remover', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { rerender } = render(<FormIaSettings />);
    await ready();
    const input = screen.getByLabelText(/Chave da API OpenRouter/);
    fireEvent.change(input, { target: { value: '  sk-or-v1-test-xyz9  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar chave' }));
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Configuração de IA' }));

    const savedForm = fetcher.submit.mock.calls[0][0] as FormData;
    expect(Object.fromEntries(savedForm)).toEqual({
      intent: 'save_ia_config',
      provider: 'openrouter',
      model: 'openrouter/auto',
      apiKey: 'sk-or-v1-test-xyz9',
    });
    expect(fetcher.submit).toHaveBeenCalledWith(savedForm, { method: 'post' });

    fetcher.data = { ok: true, iaConfig: savedConfig };
    rerender(<FormIaSettings />);
    await ready();
    expectConfiguredView();

    fireEvent.click(screen.getByRole('button', { name: 'Remover chave' }));
    fetcher.data = { ok: true, iaConfig: emptyConfig };
    rerender(<FormIaSettings />);
    await ready();

    const newInput = screen.getByLabelText(/Chave da API OpenRouter/);
    expect(newInput).toHaveValue('');
    expect(newInput).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remover chave' })).not.toBeInTheDocument();
  });

  it('mantém a chave oculta durante a remoção e só reabre após confirmação do servidor', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { rerender } = render(<FormIaSettings />);
    await ready();

    fireEvent.click(screen.getByRole('button', { name: 'Remover chave' }));
    const deleteForm = fetcher.submit.mock.calls[0][0] as FormData;
    expect(Object.fromEntries(deleteForm)).toEqual({ intent: 'delete_ia_config' });
    expect(fetcher.submit).toHaveBeenCalledWith(deleteForm, { method: 'post' });

    fetcher.state = 'submitting';
    rerender(<FormIaSettings />);
    expectConfiguredView();
    expect(screen.getByRole('button', { name: 'Remover chave' })).toBeDisabled();

    fetcher.state = 'idle';
    fetcher.data = { ok: true, iaConfig: emptyConfig };
    rerender(<FormIaSettings />);
    await ready();

    expect(screen.getByLabelText(/Chave da API OpenRouter/)).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Modelo de IA' })).toBeInTheDocument();
  });

  it('não reabre o cadastro se o usuário cancelar a remoção', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<FormIaSettings />);
    await ready();

    fireEvent.click(screen.getByRole('button', { name: 'Remover chave' }));

    expect(fetcher.submit).not.toHaveBeenCalled();
    expectConfiguredView();
  });

  it('mantém a configuração salva se o servidor não conseguir remover a chave', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { rerender } = render(<FormIaSettings />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Remover chave' }));

    fetcher.data = { ok: false, message: 'Não foi possível remover a chave agora.' };
    rerender(<FormIaSettings />);

    expectConfiguredView();
    expect(toast.error).toHaveBeenCalledWith(
      'Erro na configuração de IA',
      'Não foi possível remover a chave agora.',
    );
  });

  it('mantém o formulário e a chave digitada quando o salvamento falha', async () => {
    const { rerender } = render(<FormIaSettings />);
    await ready();
    fireEvent.change(screen.getByLabelText(/Chave da API OpenRouter/), {
      target: { value: 'sk-or-v1-invalid' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Configuração de IA' }));

    fetcher.data = { ok: false, message: 'Chave inválida.' };
    rerender(<FormIaSettings />);

    expect(screen.getByLabelText(/Chave da API OpenRouter/)).toHaveValue('sk-or-v1-invalid');
    expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeEnabled();
    expect(toast.error).toHaveBeenCalledWith('Erro na configuração de IA', 'Chave inválida.');
  });

  it('usa opções da API, busca por nome/ID e não oferece a lista fixa ou modelo livre', async () => {
    render(<FormIaSettings />);
    await ready();
    expect(screen.getByRole('option', { name: 'Modelo Alpha (vendor/model-a)' })).toBeInTheDocument();
    expect(screen.queryByText('Outro (personalizado)')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Identificador do Modelo no OpenRouter')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'ALPHA' } });
    expect(screen.queryByRole('option', { name: /Modelo Beta/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Roteamento automático/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'vendor/model-b' } });
    expect(screen.getByRole('option', { name: /Modelo Beta/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Modelo Alpha/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'missing-model' } });
    expect(screen.getByText(/Nenhum modelo encontrado para esta busca/)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('openrouter/auto');
  });

  it('salva apenas o modelo sem reenviar token e só muda o resumo após sucesso', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    const { rerender } = render(<FormIaSettings />);
    await ready();
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-a' } });
    expect(screen.getByText(/Contexto: 128.000 tokens/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));
    const form = fetcher.submit.mock.calls[0][0] as FormData;
    expect(Object.fromEntries(form)).toEqual({ intent: 'update_ia_model', model: 'vendor/model-a' });
    expect(screen.getByText(/Modelo ativo: openrouter\/auto/)).toBeInTheDocument();
    fetcher.data = { ok: true, operation: 'model', iaConfig: { ...savedConfig, model: 'vendor/model-a' } };
    rerender(<FormIaSettings />);
    await ready();
    expectConfiguredView('vendor/model-a');
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
    expect(toast.success).toHaveBeenCalledWith('Modelo de IA atualizado!', 'A chave OpenRouter foi mantida sem alterações.');
    rerender(<FormIaSettings />);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('mantém resumo e seleção quando PATCH falha, inclusive após revalidação idêntica', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    const { rerender } = render(<FormIaSettings />);
    await ready();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-b' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));
    fetcher.data = { ok: false, error: 'ia_models_unavailable', message: 'Tente novamente.' };
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: { ...savedConfig } });
    rerender(<FormIaSettings />);
    await ready();
    expectConfiguredView();
    expect(screen.getByRole('combobox')).toHaveValue('vendor/model-b');
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeEnabled();
  });

  it.each(['submitting', 'loading'] as const)('bloqueia controles durante %s para evitar trocas concorrentes', async (state) => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    const { rerender } = render(<FormIaSettings />);
    await ready();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-b' } });
    fetcher.state = state;
    rerender(<FormIaSettings />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remover chave' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' })).toBeDisabled();
  });

  it('preserva modelo salvo ausente como opção desabilitada, sem selecionar outro automaticamente', async () => {
    const config = { ...savedConfig, model: 'vendor/retired' };
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: config });
    render(<FormIaSettings />);
    await ready();
    expect(screen.getByRole('combobox')).toHaveValue('vendor/retired');
    expect(screen.getByRole('option', { name: /vendor\/retired — modelo atual indisponível/ })).toBeDisabled();
    expect(screen.getByText(/O modelo atual não está disponível neste catálogo/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-a' } });
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeEnabled();
    expect(fetcher.submit).not.toHaveBeenCalled();
  });

  it('não inventa opção auto quando o catálogo não a oferece', async () => {
    vi.mocked(ServiceGetIaModels).mockResolvedValue({ ...catalogFor(emptyConfig), models: dynamicModels.slice(1) });
    render(<FormIaSettings />);
    await ready();
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.queryByRole('option', { name: /Roteamento automático/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Chave da API OpenRouter/), { target: { value: 'test-key' } });
    expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeDisabled();
  });

  it('catálogo vazio bloqueia gravação e permite tentar novamente', async () => {
    vi.mocked(ServiceGetIaModels).mockResolvedValue({ ...catalogFor(emptyConfig), models: [] });
    render(<FormIaSettings />);
    await ready();
    expect(screen.getByText(/Nenhum modelo compatível está disponível/)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Atualizar modelos' })).toBeEnabled();
  });

  it('avisa quando o catálogo é antigo; seleção será revalidada pelo Gateway ao salvar', async () => {
    vi.mocked(ServiceGetIaModels).mockResolvedValue({ ...catalogFor(savedConfig), stale: true });
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    render(<FormIaSettings />);
    await ready();
    expect(screen.getByText(/O catálogo pode estar desatualizado/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-a' } });
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeEnabled();
  });

  it('falha no catálogo não expõe token nem destrói configuração; botão refaz a consulta', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    vi.mocked(ServiceGetIaModels).mockRejectedValueOnce({ code: 'ia_models_forbidden', message: 'sensitive-key' });
    render(<FormIaSettings />);
    await ready();
    expect(screen.getByText(/O OpenRouter bloqueou a consulta/)).toBeInTheDocument();
    expect(screen.queryByText(/sensitive-key/)).not.toBeInTheDocument();
    expectConfiguredView();
    expect(screen.getByRole('combobox')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar modelos' }));
    await ready();
    expect(screen.getByRole('combobox')).toBeEnabled();
    expect(ServiceGetIaModels).toHaveBeenCalledTimes(2);
  });

  it('carregamento não habilita gravação e aborta/ignora resposta atrasada após remoção', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    let resolve!: (value: IaModelsResponse) => void;
    vi.mocked(ServiceGetIaModels).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const { rerender } = render(<FormIaSettings />);
    expect(screen.getByText('Carregando modelos compatíveis...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
    const signal = vi.mocked(ServiceGetIaModels).mock.calls[0][0];
    fetcher.data = { ok: true, iaConfig: emptyConfig };
    rerender(<FormIaSettings />);
    await ready();
    expect(signal?.aborted).toBe(true);
    await act(async () => { resolve({ ...catalogFor(savedConfig), models: [{ ...dynamicModels[1], id: 'obsolete/model' }] }); });
    expect(screen.queryByRole('option', { name: /obsolete/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Chave da API OpenRouter/)).toHaveValue('');
    expect(screen.queryByText(/A configuração foi alterada/)).not.toBeInTheDocument();
  });

  it('atualização de catálogo que remove a escolha não troca a seleção silenciosamente', async () => {
    render(<FormIaSettings />);
    await ready();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-a' } });
    vi.mocked(ServiceGetIaModels).mockResolvedValueOnce({ ...catalogFor(emptyConfig), models: [dynamicModels[0]] });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar modelos' }));
    await ready();
    expect(screen.getByRole('combobox')).toHaveValue('vendor/model-a');
    expect(screen.getByRole('option', { name: 'vendor/model-a — indisponível' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeDisabled();
  });

  it('configuração desconhecida não é tratada como ausência de chave; oferece recarga', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: null, error: 'Falha na leitura.' });
    const { rerender } = render(<FormIaSettings />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falha na leitura.');
    expect(screen.queryByLabelText(/Chave da API OpenRouter/)).not.toBeInTheDocument();
    expect(ServiceGetIaModels).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Recarregar configuração' }));
    expect(revalidator.revalidate).toHaveBeenCalled();
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    rerender(<FormIaSettings />);
    await ready();
    expectConfiguredView();
  });

  it('catálogo de uma configuração alterada em outra aba exige recarregar', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    vi.mocked(ServiceGetIaModels).mockResolvedValueOnce(catalogFor({ ...savedConfig, model: 'vendor/model-b' }));
    render(<FormIaSettings />);
    await ready();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Recarregar configuração' }));
    expect(revalidator.revalidate).toHaveBeenCalled();
  });

  it('conflito no PATCH bloqueia repetição até recarregar o estado do servidor', async () => {
    vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
    const { rerender } = render(<FormIaSettings />);
    await ready();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-b' } });
    fetcher.data = { ok: false, error: 'ia_config_changed', message: 'Recarregue.' };
    rerender(<FormIaSettings />);
    expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
    expect(within(screen.getByRole('status')).getByText(/A configuração foi alterada/)).toBeInTheDocument();
  });

  describe('filtro de modelos gratuitos', () => {
    beforeEach(() => {
      vi.mocked(useLoaderData).mockReturnValue({ iaConfig: savedConfig });
      vi.mocked(ServiceGetIaModels).mockResolvedValue({ ...catalogFor(savedConfig), models: [...dynamicModels, ...freeModels] });
    });

    it('inicia desmarcado abaixo da busca e não faz chamadas ao filtrar', async () => {
      render(<FormIaSettings />);
      await ready();
      const checkbox = screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' });
      expect(checkbox).not.toBeChecked();
      expect(screen.getByLabelText('Buscar modelo').compareDocumentPosition(checkbox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Modelo Alpha (vendor/model-a)' })).toBeInTheDocument();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      expect(screen.queryByRole('option', { name: 'Modelo Alpha (vendor/model-a)' })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Modelo Beta (vendor/model-b)' })).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Modelo Alpha grátis (vendor/model-a:free) — Gratuito' })).toBeEnabled();
      expect(screen.getByRole('option', { name: 'Modelo Beta grátis (vendor/model-b:free) — Gratuito' })).toBeEnabled();
      expect(ServiceGetIaModels).toHaveBeenCalledTimes(1);
      expect(fetcher.submit).not.toHaveBeenCalled();
    });

    it('combina a caixinha com a busca por texto sem substituir o texto digitado', async () => {
      render(<FormIaSettings />);
      await ready();
      fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'ALPHA' } });
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      expect(screen.getByLabelText('Buscar modelo')).toHaveValue('ALPHA');
      expect(screen.getByRole('option', { name: /Modelo Alpha grátis/ })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /Modelo Beta grátis/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Modelo Alpha (vendor/model-a)' })).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'vendor/model-b' } });
      expect(screen.getByRole('option', { name: /Modelo Beta grátis/ })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /Modelo Alpha grátis/ })).not.toBeInTheDocument();
    });

    it('preserva auto como seleção fora do filtro, sem apresentá-lo como gratuito', async () => {
      render(<FormIaSettings />);
      await ready();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      expect(screen.getByRole('combobox')).toHaveValue('openrouter/auto');
      expect(screen.getByRole('option', { name: /Roteamento automático.*fora do filtro de gratuitos/ })).toBeDisabled();
      expect(screen.getByText(/A seleção atual não é uma opção gratuita/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
      expectConfiguredView();
    });

    it('bloqueia salvar uma escolha paga pendente até escolher uma gratuita ou desmarcar', async () => {
      render(<FormIaSettings />);
      await ready();
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-a' } });
      expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeEnabled();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      expect(screen.getByRole('combobox')).toHaveValue('vendor/model-a');
      expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));
      expect(fetcher.submit).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeEnabled();
      expect(screen.queryByText(/A seleção atual não é uma opção gratuita/)).not.toBeInTheDocument();
    });

    it('restaura opções ao desmarcar sem perder texto nem modelo escolhido', async () => {
      render(<FormIaSettings />);
      await ready();
      fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'Alpha' } });
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-a:free' } });
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      expect(screen.getByLabelText('Buscar modelo')).toHaveValue('Alpha');
      expect(screen.getByRole('combobox')).toHaveValue('vendor/model-a:free');
      expect(screen.getByRole('option', { name: 'Modelo Alpha (vendor/model-a)' })).toBeEnabled();
      expect(screen.queryByRole('option', { name: /Modelo Beta/ })).not.toBeInTheDocument();
    });

    it('grava só o modelo gratuito, sem token nem preferência de filtro no payload', async () => {
      render(<FormIaSettings />);
      await ready();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-a:free' } });
      expect(screen.queryByText(/A seleção atual não é uma opção gratuita/)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));
      expect(Object.fromEntries(fetcher.submit.mock.calls[0][0] as FormData))
        .toEqual({ intent: 'update_ia_model', model: 'vendor/model-a:free' });
      expect(screen.queryByLabelText(/Chave da API OpenRouter/)).not.toBeInTheDocument();
    });

    it('explica quando nenhum gratuito corresponde à busca', async () => {
      render(<FormIaSettings />);
      await ready();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'inexistente' } });
      expect(screen.getByText(/Nenhum modelo gratuito encontrado com os filtros atuais/)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveValue('openrouter/auto');
      expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
    });

    it('não inventa modelos gratuitos quando o catálogo só contém opções pagas', async () => {
      vi.mocked(ServiceGetIaModels).mockResolvedValueOnce(catalogFor(savedConfig));
      render(<FormIaSettings />);
      await ready();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      expect(screen.getByText(/Nenhum modelo gratuito encontrado/)).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: / — Gratuito$/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvar modelo' })).toBeDisabled();
    });

    it('preserva o padrão no cadastro inicial, mas não o salva sob o filtro de gratuitos', async () => {
      vi.mocked(useLoaderData).mockReturnValue({ iaConfig: emptyConfig });
      vi.mocked(ServiceGetIaModels).mockResolvedValueOnce({ ...catalogFor(emptyConfig), models: [...dynamicModels, ...freeModels] });
      render(<FormIaSettings />);
      await ready();
      fireEvent.change(screen.getByLabelText(/Chave da API OpenRouter/), { target: { value: 'test-key' } });
      expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeEnabled();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      expect(screen.getByRole('combobox')).toHaveValue('openrouter/auto');
      expect(screen.getByRole('button', { name: 'Salvar Configuração de IA' })).toBeDisabled();
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vendor/model-b:free' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar Configuração de IA' }));
      expect(Object.fromEntries(fetcher.submit.mock.calls[0][0] as FormData)).toEqual({
        intent: 'save_ia_config', provider: 'openrouter', model: 'vendor/model-b:free', apiKey: 'test-key',
      });
    });

    it('mantém a escolha gratuita atual mesmo quando a busca não corresponde a ela', async () => {
      const config = { ...savedConfig, model: 'vendor/model-a:free' };
      vi.mocked(useLoaderData).mockReturnValue({ iaConfig: config });
      vi.mocked(ServiceGetIaModels).mockResolvedValueOnce({ ...catalogFor(config), models: [...dynamicModels, ...freeModels] });
      render(<FormIaSettings />);
      await ready();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Buscar modelos gratuitos' }));
      fireEvent.change(screen.getByLabelText('Buscar modelo'), { target: { value: 'Beta' } });
      expect(screen.getByRole('combobox')).toHaveValue('vendor/model-a:free');
      expect(screen.getByRole('option', { name: /Modelo Alpha grátis/ })).toBeEnabled();
      expect(screen.getByRole('option', { name: /Modelo Beta grátis/ })).toBeEnabled();
      expect(screen.queryByText(/A seleção atual não é uma opção gratuita/)).not.toBeInTheDocument();
    });
  });
});
