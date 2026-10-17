import { useEffect, useId, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router-dom';
import { FaArrowsRotate, FaSpinner } from 'react-icons/fa6';
import { Select, type SelectOption } from 'components/ui/select';
import { Checkbox } from 'components/ui/checkbox';
import { useIaModels } from 'src/hooks/useIaModels';
import { isFreeIaModel } from 'src/lib/utils/isFreeIaModel';
import { filterIaModelsByPrice, startsWithFreeModelsOnly } from 'src/lib/utils/iaModelPriceFilter';
import { INTENT_UPDATE_IA_MODEL } from 'src/lib/constants/routes/intents';
import type { IaConfigResponse } from 'src/services/serviceIaConfig';
import type { IaSettingsActionResult } from 'src/routes/actions/actionIaSettings';
import type { IaModelQuickSwitchProps } from './ui.types';

/**
 * Troca o modelo de IA sem sair da tela (preparação da conta e barra da IA),
 * pela mesma action da Configuração de IA. Mostra os gratuitos por padrão, como
 * nas outras escolhas de modelo.
 */
export default function IaModelQuickSwitch({ onChanged, className = '' }: IaModelQuickSwitchProps) {
  const routeData = useRouteLoaderData('user') as { iaConfig?: IaConfigResponse | null } | undefined;
  const iaConfig = routeData?.iaConfig ?? null;
  const { catalog, loading, error, reload } = useIaModels(iaConfig, Boolean(iaConfig?.hasKey));
  const fetcher = useFetcher<IaSettingsActionResult>();
  const [showPaid, setShowPaid] = useState(() => !startsWithFreeModelsOnly(iaConfig));
  const [choice, setChoice] = useState('');
  const submittedRef = useRef<string | null>(null);
  const selectId = useId();

  const currentModel = iaConfig?.model || 'openrouter/auto';
  const saving = fetcher.state !== 'idle';
  const models = filterIaModelsByPrice(catalog?.models ?? [], { includePaid: showPaid, keepId: choice })
    .filter((model) => model.id !== currentModel);
  const options: SelectOption<string>[] = models.map((model) => ({
    value: model.id,
    label: `${model.isAutomatic ? 'Roteamento automático' : model.name} (${model.id})${isFreeIaModel(model.id) ? ' — Gratuito' : ''}`,
  }));

  useEffect(() => {
    const result = fetcher.data;
    const model = submittedRef.current;
    if (fetcher.state !== 'idle' || !result || !model) return;
    submittedRef.current = null;
    if (result.ok) {
      setChoice('');
      onChanged?.(model, result.iaConfig?.questionsGeneration);
    }
  }, [fetcher.state, fetcher.data, onChanged]);

  if (!iaConfig?.hasKey) return null;

  const save = () => {
    if (!choice || saving) return;
    submittedRef.current = choice;
    fetcher.submit(
      { intent: INTENT_UPDATE_IA_MODEL, model: choice },
      { method: 'post', action: '/user/edit/ia-settings' },
    );
  };

  const failure = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.message : null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="break-all text-xs text-(--text-tertiary)">Modelo atual: {currentModel}</p>
      <label htmlFor={selectId} className="sr-only">Escolher outro modelo de IA</label>
      {/* O seletor encolhe (min-w-0) para o nome longo do modelo não empurrar o botão para fora. */}
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          id={selectId}
          className="min-w-0 sm:flex-1"
          value={choice}
          onChange={setChoice}
          options={options}
          placeholder={loading ? 'Carregando modelos...' : showPaid ? 'Escolha outro modelo' : 'Escolha outro modelo gratuito'}
          disabled={loading || saving || options.length === 0}
          searchable
          searchLabel="Buscar modelo"
          searchPlaceholder="Busque pelo nome ou identificador"
          emptyMessage="Nenhum outro modelo encontrado."
          noResultsMessage="Nenhum modelo corresponde à busca."
        />
        <button
          type="button"
          onClick={save}
          disabled={!choice || saving}
          className="btn-primary font-poppins inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <FaSpinner aria-hidden className="animate-spin" /> : <FaArrowsRotate aria-hidden />}
          {saving ? 'Trocando…' : 'Trocar modelo'}
        </button>
      </div>
      {saving && choice && (
        <p role="status" className="break-all text-xs text-(--text-tertiary)">Trocando para {choice}…</p>
      )}
      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-(--text-secondary)">
        <Checkbox
          checked={showPaid}
          onChange={(event) => setShowPaid(event.target.checked)}
          disabled={loading || saving}
        />
        Mostrar também modelos pagos
      </label>
      {error && (
        <p className="text-xs text-amber-400">
          {error}{' '}
          <button type="button" onClick={reload} className="font-semibold text-(--primary-color) hover:underline">Tentar de novo</button>
        </p>
      )}
      {failure && <p role="alert" className="text-xs text-amber-400">{failure}</p>}
    </div>
  );
}
