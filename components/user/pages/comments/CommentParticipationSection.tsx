import MetricHelp from 'components/user/shared/MetricHelp';
import PrecisionBadge from 'components/user/shared/PrecisionBadge';
import PeriodDelta from 'components/user/shared/PeriodDelta';
import { Link } from 'react-router-dom';
import { commentFieldAdvice } from 'lib/schemas/public/commentField';
import { commentGroupsVerdict, isLowParticipation } from 'src/lib/utils/commentParticipation';
import { formatRating } from 'src/lib/utils/ratingLabel';
import { countLabel } from 'src/lib/utils/plural';
import type { CommentParticipationSectionProps, LowParticipationNoticeProps } from './ui.types';
import type { CommentFieldAdviceNoticeProps } from 'components/user/pages/commentField/ui.types';

/**
 * "Quem escreve comentário" (o comentário é opcional no formulário): quantos
 * escreveram algo e se a nota deles difere da de quem só dá as estrelas. Diz o
 * quanto o tom dos comentários e o resumo da IA representam o escopo.
 * `compact`: uma linha no bloco de comentários do Dashboard.
 */
export default function CommentParticipationSection({
  stats,
  loading = false,
  inScope,
  ofScope,
  previous = null,
  variant = 'full',
  configPath,
}: CommentParticipationSectionProps) {
  const participation = stats?.commentParticipation;
  const field = stats?.commentField;
  const hiddenEverywhere = field?.hidden === 'all';
  // Sugestão de mudar o campo (a mesma regra que vai ao diagnóstico da IA).
  const advice = commentFieldAdvice(participation, field);
  const shortPct = participation && participation.withComment > 0 && typeof participation.shortComments === 'number'
    ? (participation.shortComments / participation.withComment) * 100
    : null;
  const notice = advice && participation
    ? <CommentFieldAdviceNotice advice={advice} pct={participation.pct} shortPct={shortPct} configPath={configPath} />
    : participation
      ? <LowParticipationNotice pct={participation.pct} total={participation.total} />
      : null;
  const hiddenNotice = (
    <p className="text-sm text-(--text-tertiary)" role="note">
      O campo de comentário está oculto no formulário {inScope}: as notas e as perguntas contam todo mundo.{' '}
      {configPath && (
        <Link to={configPath} className="font-semibold text-(--primary-color) hover:underline">
          Configurar o comentário
        </Link>
      )}
    </p>
  );

  if (variant === 'compact') {
    if (hiddenEverywhere) return <div data-testid="comment-participation-compact">{hiddenNotice}</div>;
    if (!participation || participation.total === 0) return null;
    const verdict = commentGroupsVerdict(participation.withCommentRating, participation.withoutCommentRating);
    return (
      <div className="space-y-2" data-testid="comment-participation-compact">
        <p className="text-sm text-(--text-secondary)">
          <span className="font-semibold text-(--text-primary)">{Math.round(participation.pct)}%</span> das avaliações
          trazem um comentário ({participation.withComment.toLocaleString('pt-BR')} de{' '}
          {participation.total.toLocaleString('pt-BR')})
          {verdict && <span className={`font-medium ${verdict.tone}`}> · {verdict.text}</span>}
        </p>
        {notice}
      </div>
    );
  }

  let body;
  if (hiddenEverywhere) {
    body = hiddenNotice;
  } else if (loading && !participation) {
    body = <p className="text-sm text-(--text-tertiary)">Carregando quem escreve comentário…</p>;
  } else if (!participation || participation.total === 0) {
    body = <p className="text-sm text-(--text-tertiary)">Ainda sem avaliações {inScope}.</p>;
  } else {
    const withComment = participation.withCommentRating;
    const withoutComment = participation.withoutCommentRating;
    const verdict = commentGroupsVerdict(withComment, withoutComment);
    const prev = previous?.data?.commentParticipation ?? null;

    body = (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-(--seventh-color) p-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-3xl font-semibold text-(--text-primary)">{Math.round(participation.pct)}%</p>
              <PrecisionBadge
                metricName="Quem escreve comentário"
                n={participation.total}
                unit="avaliações"
                interval={participation.ci}
                kind="fraction"
                ofScope={ofScope}
              />
              {previous && (
                <PeriodDelta
                  metricName="Quem escreve comentário"
                  kind="points"
                  current={{ value: Math.round(participation.pct), interval: participation.ci }}
                  previous={prev && prev.total > 0 ? { value: Math.round(prev.pct), interval: prev.ci } : null}
                  reference={previous.reference}
                  loading={previous.loading}
                  failed={previous.failed}
                />
              )}
            </div>
            <p className="mt-1 text-sm text-(--text-secondary)">
              das avaliações trazem um comentário escrito ({participation.withComment.toLocaleString('pt-BR')} de{' '}
              {countLabel(participation.total, 'avaliações')})
            </p>
          </div>

          <div className="rounded-xl bg-(--seventh-color) p-4">
            {withComment && withoutComment ? (
              <>
                <p className="text-sm text-(--text-secondary)">
                  Quem comenta dá <strong className="text-(--text-primary)">{formatRating(withComment.mean)}</strong>; quem só dá
                  as estrelas, <strong className="text-(--text-primary)">{formatRating(withoutComment.mean)}</strong>.
                </p>
                {verdict && <p className={`mt-2 text-sm font-semibold ${verdict.tone}`}>{verdict.text}</p>}
              </>
            ) : (
              <p className="text-sm text-(--text-tertiary)">
                {withComment ? 'Todos que avaliaram escreveram um comentário.' : `Ninguém escreveu comentário ${inScope}.`}
              </p>
            )}
          </div>
        </div>
        {field?.hidden === 'some' && (
          <p className="text-xs text-(--text-tertiary)">Em parte dos itens o campo de comentário está oculto.</p>
        )}
        {notice}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="comment-participation-title"
      className="font-work-sans space-y-4 rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
    >
      <h3 id="comment-participation-title" className="flex items-center gap-1.5 font-montserrat text-base font-semibold text-(--text-primary)">
        Quem escreve comentário <MetricHelp term="commentParticipation" />
      </h3>
      {body}
    </section>
  );
}

function LowParticipationNotice({ pct, total }: LowParticipationNoticeProps) {
  if (!isLowParticipation(pct, total)) return null;
  return (
    <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-(--text-secondary)" role="note">
      Poucos clientes escrevem aqui: o tom dos comentários e o resumo da IA falam de{' '}
      {pct < 1 ? 'menos de 1%' : `${Math.round(pct)}%`} das avaliações. As estrelas e as perguntas contam todo mundo.
    </p>
  );
}

function formatPct(pct: number) {
  return pct < 1 ? 'menos de 1%' : `${Math.round(pct)}%`;
}

/** Poucos comentam ou os comentários dizem pouco: sugere mudar o campo do formulário. */
function CommentFieldAdviceNotice({ advice, pct, shortPct, configPath }: CommentFieldAdviceNoticeProps) {
  return (
    <div className="space-y-2 rounded-xl border border-(--primary-color)/30 bg-(--primary-color)/8 px-3 py-2.5 text-xs text-(--text-secondary)" role="note">
      <p>
        {advice === 'low_participation'
          ? `Só ${formatPct(pct)} dos clientes comentam aqui. Uma pergunta própria do escopo, no lugar do convite padrão, costuma render mais comentários. Se o comentário não fizer sentido aqui, dá para ocultar o campo.`
          : `${formatPct(shortPct ?? 0)} dos comentários são curtos ("bom", "ok") e dizem pouco. Uma pergunta própria do escopo ajuda o cliente a contar o que importa.`}
      </p>
      {configPath && (
        <Link to={configPath} className="inline-flex font-semibold text-(--primary-color) hover:underline">
          Configurar o comentário
        </Link>
      )}
    </div>
  );
}
