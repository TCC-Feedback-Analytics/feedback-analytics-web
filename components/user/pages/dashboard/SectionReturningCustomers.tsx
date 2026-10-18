import MetricHelp from 'components/user/shared/MetricHelp';
import ScopeTag from 'components/user/shared/ScopeTag';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedCustomers } from 'src/lib/hooks/useScopedCustomers';
import { comparePeriods } from 'src/lib/utils/periodComparison';
import { formatRating } from 'src/lib/utils/ratingLabel';
import { scopeText } from 'src/lib/utils/scopeText';

/**
 * "Clientes que voltam" (métricas novas, 4): quanto das avaliações vem de quem
 * já tinha avaliado a empresa e se quem volta está mais ou menos satisfeito que
 * quem avalia pela primeira vez. "Cliente" é o aparelho: o número é aproximado.
 */
export default function SectionReturningCustomers() {
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const { data, loading, failed } = useScopedCustomers();

  let body;
  if (failed) {
    body = <p className="text-sm text-(--text-tertiary)">Não foi possível carregar os clientes que voltam agora.</p>;
  } else if (loading || !data) {
    body = <p className="text-sm text-(--text-tertiary)">Carregando os clientes que voltam…</p>;
  } else if (data.identified === 0) {
    body = <p className="text-sm text-(--text-tertiary)">Ainda sem avaliações {scopeInfo.inScope}.</p>;
  } else {
    const { returning, firstTime } = data;
    const result =
      returning && firstTime
        ? comparePeriods(
            { value: returning.mean, interval: returning.ci },
            { value: firstTime.mean, interval: firstTime.ci },
            { decimals: 1 },
          )
        : null;
    const verdict = !result
      ? null
      : result.status === 'same'
        ? { text: 'As notas são iguais', tone: 'text-(--text-secondary)' }
        : result.status !== 'changed'
          ? null
          : result.uncertain
            ? { text: 'Diferença incerta: ainda há poucas avaliações para saber', tone: 'text-(--text-tertiary)' }
            : result.improved
              ? { text: 'Quem volta está mais satisfeito', tone: 'text-(--positive)' }
              : { text: 'Quem volta está menos satisfeito', tone: 'text-(--negative)' };

    body = (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-(--seventh-color) p-4">
            <p className="text-3xl font-semibold text-(--text-primary)">{Math.round(data.returningPct ?? 0)}%</p>
            <p className="mt-1 text-sm text-(--text-secondary)">
              das avaliações vieram de quem já tinha avaliado ({data.returningCount.toLocaleString('pt-BR')} de{' '}
              {data.identified.toLocaleString('pt-BR')})
            </p>
            <p className="mt-2 text-xs text-(--text-tertiary)">
              {data.customers.toLocaleString('pt-BR')} {data.customers === 1 ? 'cliente avaliou' : 'clientes avaliaram'}
              {data.returningCustomers > 0 && `, ${data.returningCustomers.toLocaleString('pt-BR')} mais de uma vez`}
            </p>
          </div>
          <div className="rounded-xl bg-(--seventh-color) p-4">
            {returning ? (
              <>
                <p className="text-sm text-(--text-secondary)">
                  Quem volta dá <strong className="text-(--text-primary)">{formatRating(returning.mean)}</strong>
                  {firstTime && (
                    <>
                      ; primeira vez, <strong className="text-(--text-primary)">{formatRating(firstTime.mean)}</strong>
                    </>
                  )}
                  .
                </p>
                {verdict && <p className={`mt-2 text-sm font-semibold ${verdict.tone}`}>{verdict.text}</p>}
              </>
            ) : (
              <p className="text-sm text-(--text-tertiary)">Nenhum cliente voltou a avaliar {scopeInfo.inScope}.</p>
            )}
          </div>
        </div>
        <p className="text-[11px] text-(--text-tertiary)">
          Cliente aqui é o aparelho usado para avaliar, sem dados pessoais: o número é aproximado.
        </p>
      </div>
    );
  }

  return (
    <section
      className="font-work-sans space-y-4 rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
      aria-labelledby="returning-customers-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="returning-customers-title" className="flex items-center gap-1 font-montserrat text-lg font-semibold text-(--text-primary)">
          Clientes que voltam <MetricHelp term="returningCustomers" />
        </h2>
        <ScopeTag />
      </header>
      {body}
    </section>
  );
}
