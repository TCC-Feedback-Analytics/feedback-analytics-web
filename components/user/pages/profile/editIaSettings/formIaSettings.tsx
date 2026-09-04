import { useState, useEffect, useRef } from 'react';
import { useFetcher, useLoaderData, useRevalidator } from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import {
  INTENT_SAVE_IA_CONFIG,
  INTENT_DELETE_IA_CONFIG,
  INTENT_UPDATE_IA_MODEL,
} from 'src/lib/constants/routes/intents';
import type { LoaderIaSettingsResult } from 'src/routes/loaders/loaderIaSettings';
import type { IaConfigResponse } from 'src/services/serviceIaConfig';
import type { IaSettingsActionResult } from 'src/routes/actions/actionIaSettings';
import { useIaModels } from 'src/hooks/useIaModels';
import { SelectNative } from 'components/ui/select';
import { Checkbox } from 'components/ui/checkbox';
import { isFreeIaModel } from 'src/lib/utils/isFreeIaModel';
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaEye,
  FaEyeSlash,
  FaArrowUpRightFromSquare,
  FaTrashCan,
  FaSpinner,
  FaKey,
  FaWandMagicSparkles,
} from 'react-icons/fa6';

export default function FormIaSettings() {
  const loaderData = useLoaderData() as LoaderIaSettingsResult | undefined;
  const fetcher = useFetcher<IaSettingsActionResult>();
  const revalidator = useRevalidator();
  const toast = useToast();
  const [iaConfig, setIaConfig] = useState<IaConfigResponse | null>(loaderData?.iaConfig ?? null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [modelOption, setModelOption] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyFreeModels, setOnlyFreeModels] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const lastResult = useRef<IaSettingsActionResult | undefined>(undefined);
  const { catalog, loading, error: catalogError, reload: reloadModels } = useIaModels(iaConfig);

  useEffect(() => {
    setIaConfig(loaderData?.iaConfig ?? null);
    setNeedsReload(false);
  }, [loaderData?.iaConfig]);

  // Revalidação de uma config idêntica não deve apagar a tentativa que falhou.
  useEffect(() => {
    setModelOption(null);
    setSearch('');
    setApiKey('');
    setShowKey(false);
  }, [iaConfig?.hasKey, iaConfig?.model, iaConfig?.keyHint, iaConfig?.provider]);

  const isSubmitting = fetcher.state !== 'idle';
  const isBusy = isSubmitting || revalidator.state !== 'idle';

  useEffect(() => {
    if (!fetcher.data || lastResult.current === fetcher.data) return;
    lastResult.current = fetcher.data;

    if (fetcher.data.ok && fetcher.data.iaConfig) {
      const updatedConfig = fetcher.data.iaConfig;
      setIaConfig(updatedConfig);
      setApiKey('');
      setShowKey(false);
      setModelOption(null);
      setSearch('');
      setNeedsReload(false);

      if (fetcher.data.operation === 'model') {
        toast.success('Modelo de IA atualizado!', 'A chave OpenRouter foi mantida sem alterações.');
      } else if (updatedConfig.hasKey) {
        toast.success(
          'Configuração de IA salva!',
          'A chave e o modelo foram validados com sucesso no OpenRouter.',
        );
      } else {
        toast.success(
          'Chave de IA removida!',
          'As análises ficarão indisponíveis até uma nova chave OpenRouter ser configurada.',
        );
      }
    } else if (fetcher.data.ok === false) {
      if (['ia_config_changed', 'ia_config_required'].includes(fetcher.data.error || '')) setNeedsReload(true);
      toast.error(
        'Erro na configuração de IA',
        fetcher.data.message || 'Não foi possível atualizar a configuração de IA.',
      );
    }
  }, [fetcher.data, toast]);

  const activeModel = iaConfig?.hasKey ? iaConfig.model || 'openrouter/auto' : null;
  const effectiveModel = modelOption ?? activeModel ?? catalog?.models.find((model) =>
    model.isAutomatic && (!onlyFreeModels || isFreeIaModel(model.id)),
  )?.id ?? '';
  const models = catalog?.models ?? [];
  const selectedModel = models.find((model) => model.id === effectiveModel);
  const missingCurrentModel = Boolean(activeModel && catalog && !models.some((model) => model.id === activeModel));
  const configChanged = Boolean(catalog && (
    catalog.source !== (iaConfig?.hasKey ? 'user' : 'public') || catalog.currentModel !== activeModel
  ));
  const requiresReload = needsReload || configChanged;
  const query = search.trim().toLocaleLowerCase();
  const matchingModels = models.filter((model) =>
    (!onlyFreeModels || isFreeIaModel(model.id)) && `${model.name} ${model.id}`.toLocaleLowerCase().includes(query),
  );
  const selectedOutsideFreeFilter = Boolean(onlyFreeModels && effectiveModel && !isFreeIaModel(effectiveModel));
  // A busca filtra opções, sem trocar/ocultar silenciosamente a seleção atual.
  const visibleModels = models.filter((model) => model.id === effectiveModel || matchingModels.includes(model));
  const canSave = Boolean(iaConfig && catalog && !catalogError && !loading && !isBusy && !requiresReload && !selectedOutsideFreeFilter && selectedModel &&
    (iaConfig.hasKey ? effectiveModel !== activeModel : apiKey.trim()));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || !iaConfig) return;

    const formData = new FormData();
    formData.set('intent', iaConfig.hasKey ? INTENT_UPDATE_IA_MODEL : INTENT_SAVE_IA_CONFIG);
    formData.set('model', effectiveModel);
    if (!iaConfig.hasKey) {
      formData.set('provider', 'openrouter');
      formData.set('apiKey', apiKey.trim());
    }

    fetcher.submit(formData, { method: 'post' });
  };

  const handleDelete = () => {
    if (isBusy) return;
    if (
      window.confirm(
        'Tem certeza de que deseja remover a chave OpenRouter? As análises ficarão indisponíveis até uma nova chave ser configurada.',
      )
    ) {
      const formData = new FormData();
      formData.set('intent', INTENT_DELETE_IA_CONFIG);
      fetcher.submit(formData, { method: 'post' });
    }
  };

  if (!iaConfig) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-(--text-secondary)">
          {loaderData?.error || 'Não foi possível carregar a configuração de IA. Tente novamente.'}
        </p>
        <button type="button" disabled={isBusy} onClick={() => revalidator.revalidate()} className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50">
          Recarregar configuração
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Badge de Status e Info Atual */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-(--quaternary-color)/15 bg-(--seventh-color)/40 p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/25">
            <FaWandMagicSparkles className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-montserrat text-base font-bold text-(--text-primary)">
                Provedor de IA da Empresa
              </h2>
              {iaConfig.hasKey ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
                  <FaCircleCheck className="text-[11px]" />
                  Chave configurada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
                  <FaCircleExclamation className="text-[11px]" />
                  Configuração obrigatória
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-(--text-secondary)">
              {iaConfig.hasKey
                ? `Modelo ativo: ${iaConfig.model || 'openrouter/auto'} • Chave final: sk-or-…${iaConfig.keyHint || '****'}`
                : 'Configure uma chave OpenRouter para habilitar as análises de feedback da empresa.'}
            </p>
          </div>
        </div>

        {iaConfig.hasKey && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors disabled:opacity-50"
          >
            <FaTrashCan className="text-xs" />
            <span>Remover chave</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6" aria-busy={isBusy}>
          {/* A troca de modelo não exige nem recebe a chave novamente. */}
          {!iaConfig.hasKey && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="apiKey" className="flex items-center gap-2 text-sm font-medium text-(--text-primary)">
                <FaKey className="text-xs text-(--primary-color)" />
                Chave da API OpenRouter (sk-or-...)
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-(--primary-color) hover:underline"
              >
                <span>Pegar minha chave OpenRouter</span>
                <FaArrowUpRightFromSquare className="text-[10px]" />
              </a>
            </div>

            <div className="relative">
              <input
                id="apiKey"
                name="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex h-12 w-full rounded-xl border border-(--quaternary-color)/20 bg-(--seventh-color) px-4 pr-12 font-poppins text-sm text-(--text-primary) shadow-xs transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-hidden"
                autoComplete="off"
                disabled={isBusy}
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
                disabled={isBusy}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
              >
                {showKey ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-(--text-tertiary)">
              A chave é armazenada de forma segura com criptografia AES-256-GCM e testada antes de salvar.
            </p>
          </div>
          )}

          {/* Seleção de Modelo */}
          <div className="space-y-2">
            <label htmlFor="modelSelect" className="block text-sm font-medium text-(--text-primary)">
              Modelo de IA
            </label>
            <label htmlFor="modelSearch" className="block text-xs text-(--text-secondary)">Buscar modelo</label>
            <input
              id="modelSearch"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busque pelo nome ou identificador"
              disabled={loading || isBusy || !catalog || requiresReload}
              className="h-10 w-full rounded-xl border border-(--quaternary-color)/20 bg-(--seventh-color) px-4 text-sm text-(--text-primary) disabled:opacity-50"
            />
            <label className="flex w-fit cursor-pointer items-center gap-2 py-1 text-xs text-(--text-secondary)">
              <Checkbox
                checked={onlyFreeModels}
                onChange={(event) => {
                  // Marcar o filtro não muda a seleção, inclusive o padrão inicial.
                  setModelOption(effectiveModel);
                  setOnlyFreeModels(event.target.checked);
                }}
                disabled={loading || isBusy || !catalog || requiresReload}
                aria-describedby="modelStatus"
              />
              Buscar modelos gratuitos
            </label>
              <SelectNative
                id="modelSelect"
                value={effectiveModel}
                onChange={(e) => setModelOption(e.target.value)}
                disabled={loading || isBusy || !catalog || models.length === 0 || requiresReload}
                aria-describedby="modelStatus modelHelp"
              >
                <option value="" disabled>{loading ? 'Carregando modelos...' : 'Selecione um modelo'}</option>
                {activeModel && !models.some((model) => model.id === activeModel) && (
                  <option value={activeModel} disabled>{activeModel} — {catalog ? 'modelo atual indisponível' : 'modelo atual'}</option>
                )}
                {effectiveModel && effectiveModel !== activeModel && !selectedModel && (
                  <option value={effectiveModel} disabled>{effectiveModel} — {catalog ? 'indisponível' : 'selecionado'}</option>
                )}
                {visibleModels.map((model) => (
                  <option key={model.id} value={model.id} disabled={onlyFreeModels && !isFreeIaModel(model.id)}>
                    {model.isAutomatic ? 'Roteamento automático' : model.name} ({model.id})
                    {isFreeIaModel(model.id) ? ' — Gratuito' : onlyFreeModels ? ' — seleção atual (fora do filtro de gratuitos)' : ''}
                  </option>
                ))}
              </SelectNative>
            <div id="modelStatus" role="status" className="space-y-2 text-xs text-(--text-secondary)">
              {loading && <p>Carregando modelos compatíveis...</p>}
              {catalogError && <p>{catalogError}</p>}
              {catalog && models.length === 0 && <p>Nenhum modelo compatível está disponível neste catálogo. Confira as restrições da conta no OpenRouter ou tente atualizar a lista.</p>}
              {catalog?.stale && <p className="text-amber-600 dark:text-amber-400">O catálogo pode estar desatualizado. A disponibilidade será validada novamente ao salvar.</p>}
              {missingCurrentModel && <p className="text-amber-600 dark:text-amber-400">O modelo atual não está disponível neste catálogo. Sua configuração foi mantida; selecione outro modelo para alterá-la.</p>}
              {catalog && effectiveModel && !selectedModel && effectiveModel !== activeModel && <p>O modelo selecionado não está mais disponível. Escolha outro modelo.</p>}
              {catalog && !onlyFreeModels && query && matchingModels.length === 0 && <p>Nenhum modelo encontrado para esta busca. A seleção atual foi mantida.</p>}
              {catalog && onlyFreeModels && models.length > 0 && matchingModels.length === 0 && <p>Nenhum modelo gratuito encontrado com os filtros atuais. Altere a busca ou desmarque o filtro.</p>}
              {catalog && selectedOutsideFreeFilter && <p className="text-amber-600 dark:text-amber-400">A seleção atual não é uma opção gratuita. Escolha um modelo gratuito ou desmarque o filtro para salvar. Sua configuração não foi alterada.</p>}
              {catalog && onlyFreeModels && <p>Modelos gratuitos podem ter limites de uso e disponibilidade no OpenRouter.</p>}
              {requiresReload && <p>A configuração foi alterada. Recarregue antes de continuar.</p>}
            </div>
            <p id="modelHelp" className="text-xs text-(--text-tertiary)">
              {iaConfig.hasKey
                ? 'Modelos compatíveis disponíveis para sua chave OpenRouter. A troca mantém o token atual.'
                : 'Catálogo público de modelos compatíveis. Ao salvar, validaremos a escolha com as permissões da chave informada.'}
            </p>
            {selectedModel && (
              <p className="text-xs text-(--text-tertiary)">
                {selectedModel.isAutomatic ? 'O OpenRouter escolhe o modelo automaticamente; os limites dependem do modelo de destino.'
                  : `Contexto: ${selectedModel.contextLength?.toLocaleString('pt-BR') ?? 'não informado'} tokens • Saída máxima: ${selectedModel.maxCompletionTokens?.toLocaleString('pt-BR') ?? 'não informada'} tokens`}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={reloadModels} disabled={loading || isBusy} className="text-xs font-medium text-(--primary-color) hover:underline disabled:opacity-50">
                Atualizar modelos
              </button>
              {requiresReload && (
                <button type="button" onClick={() => revalidator.revalidate()} disabled={isBusy} className="text-xs font-medium text-(--primary-color) hover:underline disabled:opacity-50">
                  Recarregar configuração
                </button>
              )}
            </div>
          </div>

          {/* Botão de Submit */}
          <div className="flex justify-end border-t border-(--quaternary-color)/15 pt-5">
            <button
              type="submit"
              disabled={!canSave}
              className="btn-primary font-poppins inline-flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-60 transition-transform active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{iaConfig.hasKey ? 'Salvar modelo' : 'Salvar Configuração de IA'}</span>
              )}
            </button>
          </div>
      </form>
    </div>
  );
}
