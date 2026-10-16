import MetricHelp from 'components/user/shared/MetricHelp';
import { formatNss } from 'src/lib/utils/statistics';
import type { CommentTopicsSectionProps } from './ui.types';

function toneClass(nss: number): string {
  if (nss > 5) return 'text-(--positive)';
  if (nss < -5) return 'text-(--negative)';
  return 'text-(--neutral)';
}

/**
 * "Assuntos que mais impactam" (decisão de 16/10/2026): do que os clientes falam
 * e se falam bem ou mal. Um assunto só entra com 3+ menções; enquanto não houver
 * nenhum, as categorias aparecem como reserva. Palavras-chave saíram.
 */
export default function CommentTopicsSection({ summary }: CommentTopicsSectionProps) {
  const aspects = summary.aspectSentiments ?? [];
  const categories = summary.topCategories;

  return (
    <section
      aria-labelledby="comment-topics-title"
      className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
    >
      <h3 id="comment-topics-title" className="flex items-center gap-1.5 font-montserrat text-base font-semibold text-(--text-primary)">
        Assuntos que mais impactam <MetricHelp term="aspects" />
      </h3>

      {aspects.length > 0 ? (
        <>
          <p className="mb-4 mt-1 text-xs text-(--text-tertiary)">
            Ordenados por impacto (quantidade × intensidade). Saldo negativo = principais reclamações.
          </p>
          <ul className="space-y-2">
            {aspects.map((aspect) => (
              <li
                key={aspect.aspect}
                className="flex items-center justify-between gap-3 rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) px-3 py-2"
              >
                <div className="min-w-0">
                  <span className="block truncate text-sm text-(--text-primary)">{aspect.aspect}</span>
                  <span className="text-[11px] text-(--text-tertiary)">
                    {aspect.count} menções · {aspect.positive} positivas / {aspect.neutral} neutras / {aspect.negative} negativas
                  </span>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${toneClass(aspect.netSentimentScore)}`}>
                  Saldo {formatNss(aspect.netSentimentScore)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : categories.length > 0 ? (
        <>
          <p className="mb-4 mt-1 text-xs text-(--text-tertiary)">
            Ainda não há assuntos com 3 ou mais menções. Enquanto isso, as categorias mais citadas:
          </p>
          <ul className="space-y-1 text-sm">
            {categories.map((category) => (
              <li key={category.name} className="flex justify-between text-(--text-secondary)">
                <span>{category.name}</span>
                <span className="text-(--text-tertiary)">
                  {category.count}x
                  {category.proportion != null ? ` · ${Math.round(category.proportion * 100)}%` : ''}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm text-(--text-tertiary)">Ainda não há assuntos suficientes para exibir.</p>
      )}
    </section>
  );
}
