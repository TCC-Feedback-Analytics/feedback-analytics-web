import { useEffect, useState } from "react";
import { useInsightsControls } from "src/lib/context/insightsControls";
import { ServiceGetFeedbackStats } from "src/services/serviceFeedbacks";

type PendingCounts = {
  pendingCount: number;
  totalFeedbacks: number;
  totalAnalyzed: number;
  latestAnalysisAt: string | null;
};

const EMPTY_COUNTS: PendingCounts = {
  pendingCount: 0,
  totalFeedbacks: 0,
  totalAnalyzed: 0,
  latestAnalysisAt: null,
};

/**
 * Contagem de feedbacks ainda NÃO analisados no escopo selecionado, lida do
 * endpoint de stats (campo `pendingCount`). Só busca quando `enabled` (a barra
 * de insights só existe em Dashboard/Insights). Recarrega ao trocar de escopo e
 * após concluir uma análise (isAnalyzingRaw true→false).
 */
export function useScopedPendingCount(enabled: boolean): PendingCounts & { loading: boolean } {
  const { scope, catalogItemId, isAnalyzingRaw } = useInsightsControls();

  // Cada análise concluída (true → false) pede uma nova contagem.
  const [refreshCount, setRefreshCount] = useState(0);
  const [wasAnalyzing, setWasAnalyzing] = useState(isAnalyzingRaw);
  if (wasAnalyzing !== isAnalyzingRaw) {
    setWasAnalyzing(isAnalyzingRaw);
    if (!isAnalyzingRaw) setRefreshCount((count) => count + 1);
  }

  const key = `${scope}:${catalogItemId}:${refreshCount}`;
  const [result, setResult] = useState<{ key: string; counts: PendingCounts }>({ key: "", counts: EMPTY_COUNTS });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    ServiceGetFeedbackStats({
      scope_type: scope,
      catalog_item_id: scope !== "COMPANY" ? catalogItemId || undefined : undefined,
    })
      .then((stats) => {
        if (cancelled) return;
        setResult({
          key,
          counts: {
            pendingCount: stats?.pendingCount ?? 0,
            totalFeedbacks: stats?.totalFeedbacks ?? 0,
            totalAnalyzed: stats?.totalAnalyzed ?? 0,
            latestAnalysisAt: stats?.latestAnalysisAt ?? null,
          },
        });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, counts: EMPTY_COUNTS });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, key, scope, catalogItemId]);

  // Enquanto a contagem nova não chega, os números do escopo anterior não
  // aparecem: nenhum consumidor (ex.: gate de "Analisar feedbacks") avalia regras
  // contra números defasados durante a troca de escopo.
  if (enabled && result.key !== key) return { ...EMPTY_COUNTS, loading: true };
  return { ...result.counts, loading: false };
}
