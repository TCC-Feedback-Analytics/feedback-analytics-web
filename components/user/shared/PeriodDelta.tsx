import { FaArrowDown, FaArrowUp, FaEquals } from 'react-icons/fa6';
import { comparePeriods, formatDelta } from 'src/lib/utils/periodComparison';
import type { PeriodDeltaProps } from './ui.types';

const UNCERTAIN_HELP =
  'As margens de erro dos dois períodos se sobrepõem: a diferença pode ser só acaso. Com mais avaliações, ela fica clara.';

/**
 * Diferença para o período anterior (etapa 02, parte C): seta e cor dizem se
 * melhorou; quando as margens de erro se sobrepõem, "Diferença incerta" em cinza.
 */
export default function PeriodDelta({
  metricName,
  current,
  previous,
  kind,
  higherIsBetter = true,
  reference,
  loading = false,
  failed = false,
}: PeriodDeltaProps) {
  if (failed) return null;
  const base = 'inline-flex flex-wrap items-center gap-1 text-xs';

  if (loading) {
    return <span className={`${base} text-(--text-tertiary)`}>Comparando com o período anterior…</span>;
  }

  const result = comparePeriods(current, previous, { decimals: kind === 'rating' ? 1 : 0, higherIsBetter });

  if (result.status === 'no-reference') {
    return <span className={`${base} text-(--text-tertiary)`}>Sem dados no período anterior</span>;
  }

  if (result.status === 'same') {
    return (
      <span className={`${base} text-(--text-secondary)`} aria-label={`${metricName}: sem mudança vs. ${reference}`}>
        <FaEquals aria-hidden className="text-[0.65rem]" />
        sem mudança vs. {reference}
      </span>
    );
  }

  const Arrow = result.delta > 0 ? FaArrowUp : FaArrowDown;
  const tone = result.uncertain ? 'text-(--text-tertiary)' : result.improved ? 'text-(--positive)' : 'text-(--negative)';
  const text = `${formatDelta(result.delta, kind)} vs. ${reference}`;

  return (
    <span
      className={`${base} ${tone}`}
      title={result.uncertain ? UNCERTAIN_HELP : undefined}
      aria-label={`${metricName}: ${text}${result.uncertain ? ', diferença incerta' : result.improved ? ', melhorou' : ', piorou'}`}
    >
      <Arrow aria-hidden className="text-[0.65rem]" />
      <span className="font-semibold">{text}</span>
      {result.uncertain && <span>· Diferença incerta</span>}
    </span>
  );
}
