import { useEffect, useId, useState } from 'react';
import { FaCalendarDays, FaScaleBalanced } from 'react-icons/fa6';
import PageHeader from 'components/user/shared/PageHeader';
import ComparePreview from 'components/user/pages/compare/ComparePreview';
import PrecisionBadge from 'components/user/shared/PrecisionBadge';
import { Select } from 'components/ui/select';
import { PeriodSelectorDropdown } from 'components/user/pages/feedbacksInsightsReport/PeriodSelectorDropdown';
import { SCOPE_CONFIG } from 'src/lib/constants/insightsScopes';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { commentToneWord } from 'src/lib/utils/commentTone';
import { comparableKinds } from 'src/lib/utils/compareItems';
import { metricsPeriodKey, metricsPeriodParams, periodText } from 'src/lib/utils/metricsPeriod';
import { comparePeriods, nssFromCounts, nssInterval, pointsText, wilsonPctInterval } from 'src/lib/utils/periodComparison';
import { formatRating, ratingLabel, ratingShares } from 'src/lib/utils/ratingLabel';
import { formatNss } from 'src/lib/utils/statistics';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import type { CatalogKind, CompareItemsRow, CompareItemsStats } from './ui.types';

const KIND_PLURAL: Record<CatalogKind, string> = { PRODUCT: 'Produtos', SERVICE: 'Serviços', DEPARTMENT: 'Departamentos' };
const KIND_SINGULAR: Record<CatalogKind, string> = { PRODUCT: 'produto', SERVICE: 'serviço', DEPARTMENT: 'departamento' };

function hasRatings(stats: FeedbackStats | null): stats is FeedbackStats {
  return Boolean(stats && stats.totalFeedbacks > 0);
}

function shareOf(stats: FeedbackStats, key: 'positive' | 'critical') {
  const share = ratingShares(stats.ratingDistribution, stats.totalFeedbacks)[key];
  return { value: share.pct, interval: wilsonPctInterval(share.count, stats.totalFeedbacks) };
}

function toneOf(stats: FeedbackStats | null) {
  const tone = stats?.aiSentiment;
  const nss = tone ? nssFromCounts(tone) : null;
  return tone && nss !== null ? { value: Math.round(nss), interval: nssInterval(tone) } : null;
}

const EMPTY = <span className="text-(--text-tertiary)">—</span>;

function buildRows(stats: CompareItemsStats): CompareItemsRow[] {
  const a = hasRatings(stats.a) ? stats.a : null;
  const b = hasRatings(stats.b) ? stats.b : null;
  const rating = (s: FeedbackStats | null) =>
    s ? (
      <span>
        <span className="font-semibold">{formatRating(s.averageRating)}</span>
        <span className="text-(--text-tertiary)"> /5 · {ratingLabel(s.averageRating)}</span>
      </span>
    ) : EMPTY;
  const pct = (s: FeedbackStats | null, key: 'positive' | 'critical') =>
    s ? <span className="font-semibold">{shareOf(s, key).value}%</span> : EMPTY;
  const tone = (s: FeedbackStats | null) => {
    const value = toneOf(s);
    if (!value) return <span className="text-(--text-tertiary)">Sem comentários analisados</span>;
    return (
      <span>
        <span className="font-semibold">{formatNss(value.value)}</span>
        <span className="text-(--text-tertiary)"> · {commentToneWord(value.value)}</span>
      </span>
    );
  };
  const participation = (s: FeedbackStats | null) => {
    const p = s?.commentParticipation;
    if (!p || p.total === 0) return EMPTY;
    return (
      <span>
        <span className="font-semibold">{Math.round(p.pct)}%</span>
        <span className="text-(--text-tertiary)"> · {p.withComment.toLocaleString('pt-BR')} de {p.total.toLocaleString('pt-BR')}</span>
      </span>
    );
  };
  const precision = (s: FeedbackStats | null, name: string) =>
    s ? <PrecisionBadge metricName={`Média · ${name}`} n={s.totalFeedbacks} unit="avaliações" interval={s.starMeanCI} kind="mean" /> : EMPTY;

  const verdict = (current: { value: number; interval?: { lower: number; upper: number } | null } | null, other: typeof current, options = {}) =>
    current && other ? comparePeriods(current, other, options) : { status: 'no-reference' as const };

  const toneA = toneOf(stats.a);
  const toneB = toneOf(stats.b);

  return [
    {
      metric: 'Nº de avaliações',
      a: <span className="font-semibold">{(stats.a?.totalFeedbacks ?? 0).toLocaleString('pt-BR')}</span>,
      b: <span className="font-semibold">{(stats.b?.totalFeedbacks ?? 0).toLocaleString('pt-BR')}</span>,
      result: null,
      kind: 'points',
    },
    {
      metric: 'Média',
      a: rating(a),
      b: rating(b),
      result: verdict(a && { value: a.averageRating, interval: a.starMeanCI }, b && { value: b.averageRating, interval: b.starMeanCI }, { decimals: 1 }),
      kind: 'rating',
    },
    {
      metric: 'Positivas (4–5★)',
      a: pct(a, 'positive'),
      b: pct(b, 'positive'),
      result: verdict(a && shareOf(a, 'positive'), b && shareOf(b, 'positive')),
      kind: 'points',
    },
    {
      metric: 'Críticas (1–2★)',
      a: pct(a, 'critical'),
      b: pct(b, 'critical'),
      result: verdict(a && shareOf(a, 'critical'), b && shareOf(b, 'critical'), { higherIsBetter: false }),
      kind: 'points',
      lowerIsBetter: true,
    },
    {
      metric: 'Tom dos comentários',
      a: tone(stats.a),
      b: tone(stats.b),
      result: verdict(toneA, toneB),
      kind: 'nss',
    },
    {
      // Comentar mais não é melhor nem pior: só mostra o quanto o tom representa cada item.
      metric: 'Escreveram comentário',
      a: participation(stats.a),
      b: participation(stats.b),
      result: null,
      kind: 'points',
    },
    {
      metric: 'Precisão da média',
      a: precision(a, 'A'),
      b: precision(b, 'B'),
      result: null,
      kind: 'rating',
    },
  ];
}

function Verdict({ row, nameA, nameB }: { row: CompareItemsRow; nameA: string; nameB: string }) {
  const { result } = row;
  if (!result) return EMPTY;
  if (result.status === 'no-reference') return <span className="text-(--text-tertiary)">Sem dados para comparar</span>;
  if (result.status === 'same') return <span className="text-(--text-secondary)">Iguais</span>;
  const winner = result.improved ? nameA : nameB;
  // Em palavras simples: "nota 0,6 maior", "21 pontos a mais", "8 pontos a menos".
  const abs = Math.abs(result.delta);
  const amount =
    row.kind === 'rating'
      ? `nota ${abs.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} maior`
      : `${pointsText(abs)} ${row.lowerIsBetter ? 'a menos' : 'a mais'}`;
  if (result.uncertain) {
    return (
      <span className="text-(--text-tertiary)" title="As margens de erro dos dois itens se sobrepõem: a diferença pode ser só acaso.">
        Diferença incerta
      </span>
    );
  }
  return (
    <span className="font-semibold text-(--positive)">
      {winner} <span className="font-normal text-(--text-secondary)">({amount})</span>
    </span>
  );
}

/**
 * "Comparar itens" (etapa 02, parte D): dois itens do MESMO tipo, no mesmo
 * período, lado a lado nas métricas que os dois têm — média, positivas,
 * críticas, nº de avaliações, tom e precisão. As perguntas ficam de fora, porque
 * cada item tem as suas. "Geral" e "Todos os…" não entram: não são um item.
 */
export default function CompareItems() {
  const { scope, catalogItemId, catalogItemOptions, period, setPeriod } = useInsightsControls();
  const kinds = comparableKinds(catalogItemOptions);
  const selectAId = useId();
  const selectBId = useId();

  const [kind, setKind] = useState<CatalogKind | null>(() =>
    scope !== 'COMPANY' && kinds.includes(scope) ? scope : kinds[0] ?? null,
  );
  const [aId, setAId] = useState(() => (scope !== 'COMPANY' && scope === kind ? catalogItemId : ''));
  const [bId, setBId] = useState('');

  const activeKind = kind && kinds.includes(kind) ? kind : kinds[0] ?? null;
  const items = catalogItemOptions.filter((item) => item.kind === activeKind);
  const itemA = items.find((item) => item.id === aId) ?? items[0] ?? null;
  const itemB = items.find((item) => item.id === bId && item.id !== itemA?.id) ?? items.find((item) => item.id !== itemA?.id) ?? null;

  const key = activeKind && itemA && itemB ? `${activeKind}:${itemA.id}:${itemB.id}:${metricsPeriodKey(period)}` : '';
  const [result, setResult] = useState<{ key: string; failed: boolean; stats: CompareItemsStats }>({
    key: '',
    failed: false,
    stats: { a: null, b: null },
  });

  useEffect(() => {
    if (!key || !activeKind || !itemA || !itemB) return;
    let cancelled = false;
    const params = metricsPeriodParams(period);
    Promise.all([
      ServiceGetFeedbackStats({ scope_type: activeKind, catalog_item_id: itemA.id, ...params }),
      ServiceGetFeedbackStats({ scope_type: activeKind, catalog_item_id: itemB.id, ...params }),
    ])
      .then(([a, b]) => {
        if (!cancelled) setResult({ key, failed: false, stats: { a, b } });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, failed: true, stats: { a: null, b: null } });
      });
    return () => {
      cancelled = true;
    };
  }, [key, activeKind, itemA, itemB, period]);

  const changeKind = (next: CatalogKind) => {
    setKind(next);
    setAId('');
    setBId('');
  };

  if (!activeKind || !itemA || !itemB) {
    return (
      <div className="font-work-sans space-y-5 sm:space-y-6">
        <PageHeader />
        <ComparePreview />
      </div>
    );
  }

  const fresh = result.key === key;
  const loading = !fresh;
  const rows = fresh && !result.failed ? buildRows(result.stats) : [];

  return (
    <div className="font-work-sans space-y-5 sm:space-y-6">
      <PageHeader />

      <section
        data-tour="tour-compare-items"
        className="overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) shadow-sm"
        aria-label="O que comparar"
      >
        <div className="flex flex-col gap-4 border-b border-(--quaternary-color)/10 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
              <FaScaleBalanced className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--primary-color)">Comparação justa</p>
              <h2 className="mt-1 font-montserrat text-lg font-semibold text-(--text-primary)">Escolha os itens e o período</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-(--text-secondary)">
                Compare itens do mesmo tipo com exatamente o mesmo recorte de dados.
              </p>
            </div>
          </div>
          <span className="inline-flex w-full shrink-0 items-center justify-center rounded-full border border-(--primary-color)/20 bg-(--primary-color)/8 px-3 py-1 text-xs font-medium text-(--text-secondary) sm:w-fit">
            Mesmo período para os dois
          </span>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {kinds.length > 1 && (
            <div className="space-y-2" role="group" aria-label="Tipo de item">
              <p className="text-xs font-semibold uppercase tracking-wide text-(--text-tertiary)">Tipo de item</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {kinds.map((option) => {
                  const { Icon, color } = SCOPE_CONFIG[option];
                  const selected = option === activeKind;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => changeKind(option)}
                      className={`inline-flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)/40 sm:min-h-10 sm:w-auto ${
                        selected
                          ? 'border-(--primary-color)/45 bg-(--primary-color)/10 text-(--text-primary)'
                          : 'border-(--quaternary-color)/18 bg-(--bg-primary)/20 text-(--text-secondary) hover:border-(--quaternary-color)/35 hover:text-(--text-primary)'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
                      {KIND_PLURAL[option]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-400/15 text-[10px] font-bold text-cyan-300">A</span>
                <label htmlFor={selectAId} className="text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
                  Primeiro item
                </label>
              </div>
              <Select
                id={selectAId}
                options={items.filter((item) => item.id !== itemB.id).map((item) => ({ value: item.id, label: item.name }))}
                value={itemA.id}
                onChange={(value) => setAId(String(value))}
                searchable={items.length > 8}
              />
            </div>

            <span className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-(--quaternary-color)/20 bg-(--bg-primary) text-[10px] font-bold text-(--text-tertiary) md:mb-4" aria-hidden>
              VS
            </span>

            <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-400/15 text-[10px] font-bold text-violet-300">B</span>
                <label htmlFor={selectBId} className="text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
                  Segundo item
                </label>
              </div>
              <Select
                id={selectBId}
                options={items.filter((item) => item.id !== itemA.id).map((item) => ({ value: item.id, label: item.name }))}
                value={itemB.id}
                onChange={(value) => setBId(String(value))}
                searchable={items.length > 8}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-(--quaternary-color)/10 pt-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-(--text-secondary)">
              <FaCalendarDays className="h-4 w-4 text-(--primary-color)" aria-hidden />
              <span className="text-sm font-medium">Período</span>
            </div>
            <PeriodSelectorDropdown value={period} onChange={setPeriod} />
            <p className="text-xs leading-relaxed text-(--text-tertiary)">
              As perguntas não entram: cada {KIND_SINGULAR[activeKind]} tem as suas.
            </p>
          </div>
        </div>
      </section>

      {result.failed && fresh ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">
          Não foi possível carregar a comparação agora. Tente novamente em instantes.
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) px-5 py-8 text-center text-sm text-(--text-tertiary)" aria-live="polite">
          Carregando a comparação…
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color)" aria-labelledby="compare-results-title">
          <header className="flex flex-col gap-3 border-b border-(--quaternary-color)/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--primary-color)">Resultado</p>
              <h2 id="compare-results-title" className="mt-1 font-montserrat text-lg font-semibold text-(--text-primary)">Leitura lado a lado</h2>
            </div>
            <p className="text-sm text-(--text-secondary)"><span className="font-semibold text-cyan-300">A · {itemA.name}</span> <span className="px-1 text-(--text-tertiary)">vs.</span> <span className="font-semibold text-violet-300">B · {itemB.name}</span></p>
          </header>
          <div className="space-y-3 p-4 md:hidden">
            <p className="text-xs text-(--text-tertiary)">{periodText(period).label}</p>
            {rows.map((row) => (
              <article key={row.metric} className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-primary)/30 p-3.5">
                <h3 className="text-sm font-semibold text-(--text-primary)">{row.metric}</h3>
                <dl className="mt-3 grid grid-cols-2 gap-2">
                  <div className="min-w-0 rounded-lg bg-cyan-400/5 p-2.5">
                    <dt className="truncate text-[10px] font-semibold uppercase tracking-wide text-cyan-300">A · {itemA.name}</dt>
                    <dd className="mt-1 break-words text-xs leading-relaxed text-(--text-primary)">{row.a}</dd>
                  </div>
                  <div className="min-w-0 rounded-lg bg-violet-400/5 p-2.5">
                    <dt className="truncate text-[10px] font-semibold uppercase tracking-wide text-violet-300">B · {itemB.name}</dt>
                    <dd className="mt-1 break-words text-xs leading-relaxed text-(--text-primary)">{row.b}</dd>
                  </div>
                </dl>
                <div className="mt-3 border-t border-(--quaternary-color)/10 pt-2.5 text-xs text-(--text-secondary)">
                  <span className="mr-1 font-semibold text-(--text-primary)">Comparação:</span>
                  <Verdict row={row} nameA={itemA.name} nameB={itemB.name} />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="px-5 pt-4 text-left text-xs text-(--text-tertiary)">
                {itemA.name} × {itemB.name} · {periodText(period).label}
              </caption>
              <thead>
                <tr className="border-b border-(--quaternary-color)/10 text-xs text-(--text-tertiary)">
                  <th scope="col" className="px-5 py-3 font-medium">Métrica</th>
                  <th scope="col" className="px-5 py-3 font-medium text-cyan-300">A · {itemA.name}</th>
                  <th scope="col" className="px-5 py-3 font-medium text-violet-300">B · {itemB.name}</th>
                  <th scope="col" className="px-5 py-3 font-medium">Quem está melhor</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.metric} className="border-b border-(--quaternary-color)/8 last:border-0">
                    <th scope="row" className="px-5 py-3 font-medium text-(--text-secondary)">{row.metric}</th>
                    <td className="px-5 py-3 text-(--text-primary)">{row.a}</td>
                    <td className="px-5 py-3 text-(--text-primary)">{row.b}</td>
                    <td className="px-5 py-3">
                      <Verdict row={row} nameA={itemA.name} nameB={itemB.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
