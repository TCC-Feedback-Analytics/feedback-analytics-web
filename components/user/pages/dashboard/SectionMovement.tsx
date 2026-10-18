import MetricHelp from 'components/user/shared/MetricHelp';
import ScopeTag from 'components/user/shared/ScopeTag';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedTimeline } from 'src/lib/hooks/useScopedTimeline';
import { formatRating } from 'src/lib/utils/ratingLabel';
import { scopeText } from 'src/lib/utils/scopeText';
import { BUCKET_WORD, formatBucketLabel } from 'src/lib/utils/timeline';
import type { MovementChartProps, SectionMovementProps } from './ui.types';

/** Abaixo disso, a média do intervalo é pouco confiável (bolinha vazada). */
const FEW_RATINGS = 5;

const WIDTH = 600;

function MovementChart({ points, bucket, compact }: MovementChartProps) {
  const barsHeight = compact ? 80 : 130;
  const lineHeight = compact ? 56 : 90;
  const gap = 14;
  const height = barsHeight + gap + lineHeight;

  const maxCount = Math.max(1, ...points.map((point) => point.count));
  const band = WIDTH / points.length;
  const barWidth = Math.max(1, band * 0.7);
  const centerX = (index: number) => index * band + band / 2;
  // Média de 1 a 5, com uma folga em cima e embaixo para as bolinhas não cortarem.
  const meanY = (mean: number) => barsHeight + gap + 6 + ((5 - mean) / 4) * (lineHeight - 12);

  // A linha só liga intervalos vizinhos com avaliação; um intervalo vazio quebra o traço.
  const segments: string[] = [];
  let current = '';
  points.forEach((point, index) => {
    if (point.mean == null) {
      if (current) segments.push(current);
      current = '';
      return;
    }
    current += `${current ? 'L' : 'M'}${centerX(index).toFixed(1)},${meanY(point.mean).toFixed(1)}`;
  });
  if (current) segments.push(current);

  const ticks = points.length > 2 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : points.map((_, index) => index);

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-(--text-tertiary)">
        Avaliações por {BUCKET_WORD[bucket]} (no máximo {maxCount.toLocaleString('pt-BR')})
      </p>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="block h-auto w-full" aria-hidden>
        {/* Base das barras e linha de referência da média 3 (Mediana). */}
        <line x1={0} x2={WIDTH} y1={barsHeight} y2={barsHeight} stroke="var(--quaternary-color)" strokeOpacity={0.25} />
        <line
          x1={0}
          x2={WIDTH}
          y1={meanY(3)}
          y2={meanY(3)}
          stroke="var(--quaternary-color)"
          strokeOpacity={0.25}
          strokeDasharray="4 4"
        />

        {points.map((point, index) => {
          const barHeight = (point.count / maxCount) * (barsHeight - 4);
          return (
            <rect
              key={point.start}
              x={centerX(index) - barWidth / 2}
              y={barsHeight - barHeight}
              width={barWidth}
              height={Math.max(point.count > 0 ? 2 : 0, barHeight)}
              rx={Math.min(3, barWidth / 3)}
              fill="var(--primary-color)"
              fillOpacity={0.55}
            >
              <title>
                {formatBucketLabel(point.start, bucket)}: {point.count} {point.count === 1 ? 'avaliação' : 'avaliações'}
              </title>
            </rect>
          );
        })}

        {segments.map((d) => (
          <path key={d} d={d} fill="none" stroke="var(--text-primary)" strokeOpacity={0.75} strokeWidth={2} />
        ))}

        {points.map((point, index) =>
          point.mean == null ? null : (
            <circle
              key={point.start}
              cx={centerX(index)}
              cy={meanY(point.mean)}
              r={points.length > 60 ? 2.5 : 4}
              fill={point.count >= FEW_RATINGS ? 'var(--text-primary)' : 'var(--bg-secondary)'}
              stroke="var(--text-primary)"
              strokeWidth={1.5}
            >
              <title>
                {formatBucketLabel(point.start, bucket)}: média {formatRating(point.mean)}
                {point.count < FEW_RATINGS ? ' (poucas avaliações)' : ''}
              </title>
            </circle>
          ),
        )}
      </svg>
      <div className="flex justify-between text-[11px] text-(--text-tertiary)">
        {ticks.map((index) => (
          <span key={points[index].start}>{formatBucketLabel(points[index].start, bucket)}</span>
        ))}
      </div>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-(--text-tertiary)">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-(--primary-color)/55" aria-hidden /> Quantidade
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-(--text-primary)" aria-hidden /> Média de 1 a 5 (tracejado: 3)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-(--text-primary)" aria-hidden /> Menos de {FEW_RATINGS} avaliações
        </span>
      </p>
    </div>
  );
}

/**
 * "Movimento das avaliações" (métricas novas, 1): quantas avaliações chegaram e
 * a média das estrelas em cada dia, semana ou mês, no escopo e no período do
 * cabeçalho. É a primeira métrica que não sai só da nota: mostra o volume e a
 * tendência no tempo.
 */
export default function SectionMovement({ variant = 'dashboard' }: SectionMovementProps) {
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const { data, loading, failed } = useScopedTimeline();

  const peak = data?.points.reduce((best, point) => (point.count > best.count ? point : best), data.points[0]);

  let body;
  if (failed) {
    body = <p className="text-sm text-(--text-tertiary)">Não foi possível carregar o movimento agora.</p>;
  } else if (loading || !data) {
    body = <p className="text-sm text-(--text-tertiary)">Carregando o movimento…</p>;
  } else if (data.total === 0 || data.points.length === 0) {
    body = <p className="text-sm text-(--text-tertiary)">Ainda sem avaliações {scopeInfo.inScope}.</p>;
  } else {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-(--text-secondary)">
          <strong className="text-(--text-primary)">{data.total.toLocaleString('pt-BR')}</strong>{' '}
          {data.total === 1 ? 'avaliação' : 'avaliações'}
          {peak && peak.count > 0 && (
            <>
              {' '}· mais avaliações em <strong className="text-(--text-primary)">{formatBucketLabel(peak.start, data.bucket)}</strong> ({peak.count})
            </>
          )}
        </p>
        <MovementChart points={data.points} bucket={data.bucket} compact={variant === 'dashboard'} />
        <table className="sr-only">
          <caption>Avaliações e média por {BUCKET_WORD[data.bucket]}</caption>
          <thead>
            <tr>
              <th scope="col">Quando</th>
              <th scope="col">Avaliações</th>
              <th scope="col">Média</th>
            </tr>
          </thead>
          <tbody>
            {data.points.map((point) => (
              <tr key={point.start}>
                <th scope="row">{formatBucketLabel(point.start, data.bucket)}</th>
                <td>{point.count}</td>
                <td>{point.mean == null ? 'sem avaliações' : formatRating(point.mean)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section
      className="font-work-sans space-y-4 rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
      aria-labelledby="movement-section-title"
      data-tour={variant === 'dashboard' ? 'tour-movement' : undefined}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="movement-section-title" className="flex items-center gap-1 font-montserrat text-lg font-semibold text-(--text-primary)">
          Movimento das avaliações <MetricHelp term="ratingMovement" />
        </h2>
        <ScopeTag />
      </header>
      {body}
    </section>
  );
}
