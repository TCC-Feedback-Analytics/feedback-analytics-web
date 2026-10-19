import MetricHelp from 'components/user/shared/MetricHelp';
import ScopeTag from 'components/user/shared/ScopeTag';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedHeatmap } from 'src/lib/hooks/useScopedHeatmap';
import {
  BAND_HOURS,
  BAND_LABEL,
  BAND_NAME,
  PEAK_FEW_RATINGS,
  WEEKDAY_SHORT,
  cellPhrase,
  peakSummary,
} from 'src/lib/utils/peakTimes';
import { formatRating } from 'src/lib/utils/ratingLabel';
import { scopeText } from 'src/lib/utils/scopeText';
import type { PeakTimesGridProps } from './ui.types';

function PeakTimesGrid({ cells }: PeakTimesGridProps) {
  const maxCount = Math.max(1, ...cells.map((cell) => cell.count));
  const cellAt = (weekday: number, band: number) => cells.find((cell) => cell.weekday === weekday && cell.band === band);

  return (
    <div className="overflow-x-auto">
      {/* Cabe em 320px: coluna das faixas estreita, nome e horas em duas linhas e espaçamento menor no celular. */}
      <table className="w-full min-w-[17rem] table-fixed border-separate border-spacing-0.5 text-center text-xs sm:border-spacing-1">
        <caption className="sr-only">Avaliações e média por dia da semana e faixa do dia</caption>
        <thead>
          <tr>
            <th scope="col" className="w-16 text-left font-medium text-(--text-tertiary) sm:w-28">
              <span className="sr-only">Faixa do dia</span>
            </th>
            {WEEKDAY_SHORT.map((day) => (
              <th key={day} scope="col" className="text-[10px] font-medium text-(--text-tertiary) sm:text-xs">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BAND_LABEL.map((label, band) => (
            <tr key={label}>
              <th scope="row" className="pr-1 text-left text-[10px] leading-tight font-medium text-(--text-tertiary) sm:text-[11px]">
                <span className="block">{BAND_NAME[band]}</span>
                <span className="block opacity-80">{BAND_HOURS[band]}</span>
              </th>
              {WEEKDAY_SHORT.map((day, weekday) => {
                const cell = cellAt(weekday, band);
                const count = cell?.count ?? 0;
                const few = count < PEAK_FEW_RATINGS;
                const description = count
                  ? `${cellPhrase({ weekday, band })}: ${count} ${count === 1 ? 'avaliação' : 'avaliações'}, média ${formatRating(cell!.mean ?? 0)}${few ? ' (poucas avaliações)' : ''}`
                  : `${cellPhrase({ weekday, band })}: sem avaliações`;
                return (
                  <td
                    key={day}
                    title={description}
                    className="h-9 rounded-md sm:h-10"
                    style={{
                      backgroundColor:
                        count > 0
                          ? `color-mix(in oklab, var(--primary-color) ${Math.round(12 + (count / maxCount) * 60)}%, transparent)`
                          : 'var(--seventh-color)',
                    }}
                  >
                    <span className={few ? 'text-(--text-tertiary)' : 'font-semibold text-(--text-primary)'}>
                      {count && cell?.mean != null ? formatRating(cell.mean) : '—'}
                    </span>
                    <span className="sr-only">
                      {count ? `, ${count} ${count === 1 ? 'avaliação' : 'avaliações'}` : ', sem avaliações'}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * "Dias e horários de pico" (métricas novas, 3): em que dia da semana e parte do
 * dia os clientes mais avaliam e onde a média cai, no escopo e no período do
 * cabeçalho. A cor é a quantidade; o número, a média.
 */
export default function SectionPeakTimes() {
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const { data, loading, failed } = useScopedHeatmap();

  let body;
  if (failed) {
    body = <p className="text-sm text-(--text-tertiary)">Não foi possível carregar os dias e horários agora.</p>;
  } else if (loading || !data) {
    body = <p className="text-sm text-(--text-tertiary)">Carregando os dias e horários…</p>;
  } else if (data.total === 0) {
    body = <p className="text-sm text-(--text-tertiary)">Ainda sem avaliações {scopeInfo.inScope}.</p>;
  } else {
    const { busiest, worst } = peakSummary(data.cells);
    body = (
      <div className="space-y-4">
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--text-secondary)">
          {busiest && (
            <span>
              Mais avaliações: <strong className="text-(--text-primary)">{cellPhrase(busiest)}</strong> ({busiest.count})
            </span>
          )}
          {worst && (
            <span>
              Pior média: <strong className="text-(--negative)">{cellPhrase(worst)}</strong> ({formatRating(worst.mean!)})
            </span>
          )}
        </p>
        <PeakTimesGrid cells={data.cells} />
        <p className="text-[11px] text-(--text-tertiary)">
          Cor mais forte = mais avaliações · número = média das estrelas · cinza = menos de {PEAK_FEW_RATINGS} avaliações.
        </p>
      </div>
    );
  }

  return (
    <section
      className="font-work-sans space-y-4 rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-4 sm:p-6"
      aria-labelledby="peak-times-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="peak-times-title" className="flex items-center gap-1 font-montserrat text-lg font-semibold text-(--text-primary)">
          Dias e horários de pico <MetricHelp term="peakTimes" />
        </h2>
        <ScopeTag />
      </header>
      {body}
    </section>
  );
}
