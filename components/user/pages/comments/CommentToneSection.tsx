import MetricHelp from 'components/user/shared/MetricHelp';
import PrecisionBadge from 'components/user/shared/PrecisionBadge';
import { commentToneShares, commentToneWord } from 'src/lib/utils/commentTone';
import { formatNss } from 'src/lib/utils/statistics';
import type { CommentToneSectionProps } from './ui.types';

const WORD_TONE = {
  Positivo: 'text-(--positive)',
  Neutro: 'text-(--neutral)',
  Atenção: 'text-(--negative)',
} as const;

/**
 * "Tom dos comentários" (decisão de 16/10/2026): a mesma contagem que antes
 * aparecia como distribuição de sentimentos, termômetro, clima e saldo, agora num
 * bloco só — barra positivo/neutro/negativo, resumo "+45 · Positivo" e precisão.
 */
export default function CommentToneSection({ summary, inScope, ofScope }: CommentToneSectionProps) {
  const total = summary?.totalAnalyzed ?? 0;

  return (
    <section
      aria-labelledby="comment-tone-title"
      className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
    >
      <h3 id="comment-tone-title" className="flex items-center gap-1.5 font-montserrat text-base font-semibold text-(--text-primary)">
        Tom dos comentários <MetricHelp term="commentTone" />
      </h3>

      {!summary || total === 0 ? (
        <p className="mt-3 text-sm text-(--text-tertiary)">
          Ainda sem comentários analisados pela IA {inScope}.
        </p>
      ) : (
        <ToneBody summary={summary} ofScope={ofScope} />
      )}
    </section>
  );
}

function ToneBody({ summary, ofScope }: { summary: NonNullable<CommentToneSectionProps['summary']>; ofScope: string }) {
  const shares = commentToneShares(summary);
  const nss = summary.netSentimentScore ?? 0;
  const word = commentToneWord(nss);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`text-3xl font-semibold ${WORD_TONE[word]}`}>{formatNss(nss)}</span>
        <span className={`text-base font-semibold ${WORD_TONE[word]}`}>{word}</span>
        <span className="text-sm text-(--text-secondary)">
          {summary.totalAnalyzed.toLocaleString('pt-BR')} comentários analisados
        </span>
        <PrecisionBadge
          metricName="Tom dos comentários"
          n={summary.totalAnalyzed}
          unit="comentários analisados"
          interval={summary.sentimentCIs?.positive}
          kind="fraction"
          ofScope={ofScope}
        />
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--seventh-color)" aria-hidden>
        <div className="h-full bg-(--positive)/70" style={{ width: `${shares.positive.pct}%` }} />
        <div className="h-full bg-(--neutral)/70" style={{ width: `${shares.neutral.pct}%` }} />
        <div className="h-full bg-(--negative)/70" style={{ width: `${shares.negative.pct}%` }} />
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--text-secondary)">
        <li>
          <span className="font-semibold text-(--positive)">{shares.positive.pct}%</span> positivos ({shares.positive.count})
        </li>
        <li>
          <span className="font-semibold text-(--neutral)">{shares.neutral.pct}%</span> neutros ({shares.neutral.count})
        </li>
        <li>
          <span className="font-semibold text-(--negative)">{shares.negative.pct}%</span> negativos ({shares.negative.count})
        </li>
      </ul>
    </div>
  );
}
