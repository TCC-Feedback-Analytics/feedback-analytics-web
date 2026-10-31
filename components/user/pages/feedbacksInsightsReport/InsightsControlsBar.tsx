import { useInsightsControls } from 'src/lib/context/insightsControls';
import InsightsHeaderControls from './InsightsHeaderControls';
import { PeriodSelectorDropdown } from './PeriodSelectorDropdown';
import { hasMetricsPeriod } from 'src/lib/utils/metricsPeriod';
import type { InsightScopeOption } from './ui.types';

/**
 * Versão conectada do seletor de escopo: lê o contexto e renderiza o seletor de
 * escopo (+ item), o de período e a comparação com o período anterior (etapa 02). As ações de IA (Analisar/Gerar) vivem no InsightsActionsPanel.
 */
export default function InsightsControlsBar() {
  const {
    scope,
    setScope,
    catalogItemId,
    setCatalogItemId,
    catalogItemOptions,
    availableScopes,
    period,
    setPeriod,
    compare,
    setCompare,
  } = useInsightsControls();

  const handleScopeChange = (next: InsightScopeOption) => {
    setScope(next);
    if (next === 'COMPANY') {
      setCatalogItemId('');
      return;
    }
    const first = catalogItemOptions.find((item) => item.kind === next);
    setCatalogItemId(first?.id ?? '');
  };

  return (
    // Alvo do passo "Escopo e período" do guia.
    <div data-tour="tour-period" className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <InsightsHeaderControls
        availableScopes={availableScopes}
        selectedScope={scope}
        selectedCatalogItemId={catalogItemId}
        catalogItemOptions={catalogItemOptions}
        onScopeChange={handleScopeChange}
        onCatalogItemChange={setCatalogItemId}
      />
      <PeriodSelectorDropdown value={period} onChange={setPeriod} />
      {hasMetricsPeriod(period) && (
        <button
          type="button"
          role="switch"
          aria-checked={compare}
          onClick={() => setCompare(!compare)}
          title="Compara com o período anterior, do mesmo tamanho"
          className={`inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus:ring-2 focus:ring-(--primary-color)/20 focus:outline-none sm:min-h-9 sm:w-auto ${
            compare
              ? 'border-(--primary-color)/45 bg-(--primary-color)/10 text-(--text-primary)'
              : 'border-(--quaternary-color)/18 bg-(--bg-secondary) text-(--text-secondary) hover:border-(--quaternary-color)/35 hover:text-(--text-primary)'
          }`}
        >
          <span
            aria-hidden
            className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${compare ? 'bg-(--primary-color)' : 'bg-(--quaternary-color)/30'}`}
          >
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${compare ? 'left-3.5' : 'left-0.5'}`} />
          </span>
          Comparar com o período anterior
        </button>
      )}
    </div>
  );
}
