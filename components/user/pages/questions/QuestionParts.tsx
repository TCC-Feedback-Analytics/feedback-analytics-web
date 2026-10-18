import PrecisionBadge from 'components/user/shared/PrecisionBadge';
import PeriodDelta from 'components/user/shared/PeriodDelta';
import { RATING_TONE_CLASS, formatRating, ratingLabel, ratingTone } from 'src/lib/utils/ratingLabel';
import type { AnswerDistributionProps, QuestionDeltaProps, QuestionScoreProps, QuestionStatusTagProps } from './ui.types';

const DIST_ORDER = [
  { key: 'OTIMA', label: 'Ótimo', cls: 'bg-(--positive)/70' },
  { key: 'BOA', label: 'Bom', cls: 'bg-(--positive)/40' },
  { key: 'MEDIANA', label: 'Mediano', cls: 'bg-(--neutral)/70' },
  { key: 'RUIM', label: 'Ruim', cls: 'bg-(--negative)/45' },
  { key: 'PESSIMO', label: 'Péssimo', cls: 'bg-(--negative)/75' },
] as const;

/** Selo da redação: "Desativada" (recuperável) ou "Antiga" (texto editado ou removido). */
export function QuestionStatusTag({ status }: QuestionStatusTagProps) {
  if (status === 'deactivated') {
    return (
      <span className="rounded-full border border-(--neutral)/40 bg-(--neutral)/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-(--neutral)">
        Desativada
      </span>
    );
  }
  if (status === 'past') {
    return (
      <span className="rounded-full border border-(--quaternary-color)/30 bg-(--seventh-color) px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-(--text-tertiary)">
        Antiga
      </span>
    );
  }
  return null;
}

/** Barra das respostas, de ótimo a péssimo, com a contagem opcional abaixo. */
export function AnswerDistribution({ distribution, total, showLegend = false }: AnswerDistributionProps) {
  if (total <= 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-(--seventh-color)" aria-hidden>
        {DIST_ORDER.map(({ key, label, cls }) => {
          const value = distribution[key];
          if (!value) return null;
          return (
            <div key={key} className={`h-full ${cls}`} style={{ width: `${(value / total) * 100}%` }} title={`${label}: ${value}`} />
          );
        })}
      </div>
      {showLegend && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--text-tertiary)">
          {DIST_ORDER.map(({ key, label, cls }) => (
            <li key={key} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${cls}`} aria-hidden />
              {label}: {distribution[key]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** "3,1 /5 Mediana · 64 respostas · 40% satisfeitos" + precisão. */
export function QuestionScore({ metricName, mean, count, satisfiedPct, ci, ofScope }: QuestionScoreProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-2xl font-semibold text-(--text-primary)">
        {formatRating(mean)}
        <span className="text-sm font-normal text-(--text-tertiary)"> /5</span>
      </span>
      <span className={`text-sm font-semibold ${RATING_TONE_CLASS[ratingTone(mean)]}`}>{ratingLabel(mean)}</span>
      <span className="text-sm text-(--text-secondary)">
        {count.toLocaleString('pt-BR')} respostas · {Math.round(satisfiedPct)}% satisfeitos
      </span>
      <PrecisionBadge metricName={metricName} n={count} unit="respostas" interval={ci} kind="mean" ofScope={ofScope} />
    </div>
  );
}

/** Diferença da nota da pergunta para o período anterior (etapa 02, parte C). */
export function QuestionDelta({ metricName, metric, previous }: QuestionDeltaProps) {
  const prev = previous.data?.find((item) => item.question_id === metric.question_id && item.count > 0) ?? null;
  return (
    <PeriodDelta
      metricName={metricName}
      kind="rating"
      current={{ value: metric.mean, interval: metric.ci }}
      previous={prev ? { value: prev.mean, interval: prev.ci } : null}
      reference={previous.reference}
      loading={previous.loading}
      failed={previous.failed}
    />
  );
}
