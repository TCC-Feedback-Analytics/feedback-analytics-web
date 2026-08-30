import { useState, useEffect } from 'react';
import { useFetcher, useLoaderData } from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import {
  INTENT_SAVE_IA_CONFIG,
  INTENT_DELETE_IA_CONFIG,
} from 'src/lib/constants/routes/intents';
import type { LoaderIaSettingsResult } from 'src/routes/loaders/loaderIaSettings';
import type { IaConfigResponse } from 'src/services/serviceIaConfig';
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

export const CURATED_MODELS = [
  { id: 'openrouter/auto', name: 'Roteamento Automático (openrouter/auto)' },
  { id: 'google/gemini-2.5-flash', name: 'Google Gemini 2.5 Flash (google/gemini-2.5-flash)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet (anthropic/claude-3.5-sonnet)' },
  { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini (openai/gpt-4o-mini)' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (deepseek/deepseek-chat)' },
] as const;

export default function FormIaSettings() {
  const loaderData = useLoaderData() as LoaderIaSettingsResult | undefined;
  const fetcher = useFetcher<{ ok: boolean; iaConfig?: IaConfigResponse; error?: string; message?: string }>();
  const toast = useToast();

  const [iaConfig, setIaConfig] = useState<IaConfigResponse>(() => {
    return loaderData?.iaConfig ?? {
      hasKey: false,
      provider: null,
      model: null,
      keyHint: null,
    };
  });

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const initialModel = iaConfig.model || 'openrouter/auto';
  const isCurated = CURATED_MODELS.some((m) => m.id === initialModel);

  const [modelOption, setModelOption] = useState<string>(
    isCurated ? initialModel : 'custom',
  );
  const [customModel, setCustomModel] = useState<string>(
    isCurated ? '' : initialModel,
  );

  const isSubmitting = fetcher.state === 'submitting';

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.ok && fetcher.data.iaConfig) {
      const updatedConfig = fetcher.data.iaConfig;
      setIaConfig(updatedConfig);
      setApiKey('');

      const updatedModel = updatedConfig.model || 'openrouter/auto';
      const isCuratedUpdated = CURATED_MODELS.some((m) => m.id === updatedModel);
      if (isCuratedUpdated) {
        setModelOption(updatedModel);
        setCustomModel('');
      } else {
        setModelOption('custom');
        setCustomModel(updatedModel);
      }

      if (updatedConfig.hasKey) {
        toast.success(
          'Configuração de IA salva!',
          'A chave OpenRouter foi atualizada e testada com sucesso.',
        );
      } else {
        toast.success(
          'Chave de IA removida!',
          'Sua empresa voltou a usar a configuração de IA global.',
        );
      }
    } else if (fetcher.data.ok === false) {
      toast.error(
        'Erro na configuração de IA',
        fetcher.data.message || 'Não foi possível atualizar a chave de IA.',
      );
    }
  }, [fetcher.data, toast]);

  const effectiveModel = modelOption === 'custom' ? customModel.trim() : modelOption;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Erro de validação', 'Informe a chave da API OpenRouter.');
      return;
    }

    const formData = new FormData();
    formData.set('intent', INTENT_SAVE_IA_CONFIG);
    formData.set('provider', 'openrouter');
    formData.set('model', effectiveModel);
    formData.set('apiKey', apiKey.trim());

    fetcher.submit(formData, { method: 'post' });
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza de que deseja remover a chave OpenRouter da sua empresa?')) {
      const formData = new FormData();
      formData.set('intent', INTENT_DELETE_IA_CONFIG);
      fetcher.submit(formData, { method: 'post' });
    }
  };

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
                  Sem chave (Fallback global)
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-(--text-secondary)">
              {iaConfig.hasKey
                ? `Modelo ativo: ${iaConfig.model || 'openrouter/auto'} • Chave final: sk-or-…${iaConfig.keyHint || '****'}`
                : 'Configure uma chave própria do OpenRouter (BYO-key) para processar as análises de feedback.'}
            </p>
          </div>
        </div>

        {iaConfig.hasKey && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors disabled:opacity-50"
          >
            <FaTrashCan className="text-xs" />
            <span>Remover chave</span>
          </button>
        )}
      </div>

      {/* Form de Salvar / Atualizar Configuração */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Campo de API Key */}
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
              placeholder={iaConfig.hasKey ? 'Cole uma nova chave para substituir a atual (sk-or-...)' : 'sk-or-v1-...'}
              className="flex h-12 w-full rounded-xl border border-(--quaternary-color)/20 bg-(--seventh-color) px-4 pr-12 font-poppins text-sm text-(--text-primary) shadow-xs transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-hidden"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
            >
              {showKey ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-(--text-tertiary)">
            A chave é armazenada de forma segura com criptografia AES-256-GCM e testada antes de salvar.
          </p>
        </div>

        {/* Seleção de Modelo */}
        <div className="space-y-2">
          <label htmlFor="modelSelect" className="block text-sm font-medium text-(--text-primary)">
            Modelo de IA
          </label>
          <div className="relative">
            <select
              id="modelSelect"
              value={modelOption}
              onChange={(e) => setModelOption(e.target.value)}
              className="flex h-12 w-full appearance-none rounded-xl border border-(--quaternary-color)/20 bg-(--seventh-color) px-4 pr-10 font-poppins text-sm text-(--text-primary) shadow-xs transition-all focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-hidden"
            >
              {CURATED_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
              <option value="custom">Outro (personalizado)</option>
            </select>
          </div>
        </div>

        {/* Campo Personalizado se "Outro (personalizado)" estiver selecionado */}
        {modelOption === 'custom' && (
          <div className="space-y-2 animate-in fade-in-50">
            <label htmlFor="customModelInput" className="block text-xs font-medium text-(--text-secondary)">
              Identificador do Modelo no OpenRouter
            </label>
            <input
              id="customModelInput"
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="ex: meta-llama/llama-3.3-70b-instruct"
              className="flex h-12 w-full rounded-xl border border-(--quaternary-color)/20 bg-(--seventh-color) px-4 font-poppins text-sm text-(--text-primary) shadow-xs transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-hidden"
            />
            <p className="text-xs text-(--text-tertiary)">
              Informe qualquer ID de modelo suportado pelo OpenRouter (ex: meta-llama/llama-3.3-70b-instruct).
            </p>
          </div>
        )}

        {/* Botão de Submit */}
        <div className="flex justify-end border-t border-(--quaternary-color)/15 pt-5">
          <button
            type="submit"
            disabled={!apiKey.trim() || isSubmitting}
            className="btn-primary font-poppins inline-flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-60 transition-transform active:scale-95"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Testando e Salvando...</span>
              </>
            ) : (
              <span>Salvar Configuração de IA</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
