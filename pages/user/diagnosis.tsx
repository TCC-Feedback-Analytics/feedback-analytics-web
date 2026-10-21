import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from 'components/user/shared/PageHeader';
import ScopeTag from 'components/user/shared/ScopeTag';
import DiagnosisHistoryItem from 'components/user/pages/diagnosis/DiagnosisHistoryItem';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { scopeText } from 'src/lib/utils/scopeText';
import { ServiceListScopeDiagnoses, type ScopeDiagnosisSummary } from 'src/services/serviceScopeDiagnosis';

/**
 * Histórico dos diagnósticos do escopo do cabeçalho, do mais novo ao mais
 * antigo. Cada um guarda o período em que foi gerado, então dá para comparar o
 * que a IA disse em momentos diferentes sem pagar IA de novo.
 */
export default function DiagnosisHistory() {
  const { scope, catalogItemId, catalogItemOptions } = useInsightsControls();
  const itemId = scope !== 'COMPANY' ? catalogItemId || undefined : undefined;
  const key = `${scope}:${itemId ?? ''}`;
  // O histórico é do escopo, de qualquer período: o texto não leva o período do cabeçalho.
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions });
  const [result, setResult] = useState<{ key: string; items: ScopeDiagnosisSummary[]; failed: boolean }>({
    key: '',
    items: [],
    failed: false,
  });

  useEffect(() => {
    let cancelled = false;
    ServiceListScopeDiagnoses({ scope_type: scope, catalog_item_id: itemId })
      .then((data) => {
        if (!cancelled) setResult({ key, items: data.items, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, items: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [key, scope, itemId]);

  const fresh = result.key === key;

  return (
    <div className="font-work-sans">
      <PageHeader />

      <section className="space-y-4" aria-labelledby="diagnosis-history-title" data-tour="tour-diagnosis-history">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="diagnosis-history-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
            Diagnósticos {scopeInfo.inScope}
          </h2>
          <ScopeTag />
        </header>

        {!fresh ? (
          <p className="text-sm text-(--text-tertiary)">Carregando o histórico…</p>
        ) : result.failed ? (
          <p className="text-sm text-(--text-tertiary)">Não foi possível carregar o histórico agora.</p>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-(--text-secondary)">
            Ainda não há diagnóstico {scopeInfo.inScope}.{' '}
            <Link to="/user/dashboard" className="font-medium text-(--primary-color) hover:underline">
              Gerar o primeiro no Dashboard
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {result.items.map((item, index) => (
              <DiagnosisHistoryItem key={item.id} item={item} defaultOpen={index === 0} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
