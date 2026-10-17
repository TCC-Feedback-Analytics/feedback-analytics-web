import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  InsightScopeOption,
  InsightsCatalogItemOption,
} from 'components/user/pages/feedbacksInsightsReport/ui.types';
import type {
  InsightsControlsContextValue,
  InsightsControlsInitialData,
} from './insightsControls.types';
import { ALL_TIME_PERIOD, type MetricsPeriod } from 'src/lib/utils/metricsPeriod';

const InsightsControlsContext = createContext<InsightsControlsContextValue | null>(null);

export function InsightsControlsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: InsightsControlsContextValue;
}) {
  return (
    <InsightsControlsContext.Provider value={value}>
      {children}
    </InsightsControlsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInsightsControls() {
  const ctx = useContext(InsightsControlsContext);
  if (!ctx) throw new Error('useInsightsControls must be used inside InsightsControlsProvider');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInsightsControlsState(initial?: InsightsControlsInitialData) {
  const [scope, setScope] = useState<InsightScopeOption>('COMPANY');
  const [catalogItemId, setCatalogItemId] = useState('');
  const [catalogItemOptions, setCatalogItemOptions] = useState<InsightsCatalogItemOption[]>(
    initial?.catalogItemOptions ?? [],
  );
  const [availableScopes, setAvailableScopes] = useState<InsightScopeOption[]>(
    initial?.availableScopes ?? ['COMPANY'],
  );
  const [canAnalyze, setCanAnalyze] = useState(initial?.canAnalyze ?? false);
  // Período das métricas (etapa 02): vale para todos os escopos até o gestor trocar.
  const [period, setPeriod] = useState<MetricsPeriod>(ALL_TIME_PERIOD);

  return {
    scope, setScope,
    catalogItemId, setCatalogItemId,
    catalogItemOptions, setCatalogItemOptions,
    availableScopes, setAvailableScopes,
    canAnalyze, setCanAnalyze,
    period, setPeriod,
  };
}
