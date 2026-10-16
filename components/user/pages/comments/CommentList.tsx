import { FaStar } from 'react-icons/fa6';
import { sentimentLabel } from 'src/lib/utils/sentiment';
import type { CommentListProps } from './ui.types';

const TONE_CLASS = {
  positive: 'border-(--positive)/50 bg-(--positive)/10 text-(--positive)',
  neutral: 'border-(--neutral)/50 bg-(--neutral)/10 text-(--neutral)',
  negative: 'border-(--negative)/50 bg-(--negative)/10 text-(--negative)',
} as const;

/** Comentários lidos pela IA: nota em estrelas, tom do texto, categorias e divergência. */
export default function CommentList({ items }: CommentListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="space-y-2 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-(--text-tertiary)">{new Date(item.created_at).toLocaleString('pt-BR')}</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-(--quaternary-color)/14 px-2 py-0.5 text-[10px] font-medium text-(--text-secondary)">
                Nota {item.rating ?? '—'} <FaStar className="text-yellow-400" aria-hidden />
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TONE_CLASS[item.sentiment]}`}>
                Tom {sentimentLabel(item.sentiment).toLowerCase()}
              </span>
              {item.discrepancy != null && (
                <span className="rounded-full border border-(--neutral)/50 bg-(--neutral)/10 px-2 py-0.5 text-[10px] font-medium text-(--neutral)">
                  Nota e texto não combinam
                </span>
              )}
            </div>
          </div>

          <p className="whitespace-pre-wrap text-sm text-(--text-primary)">{item.message}</p>

          {item.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-[10px]">
              <span className="uppercase tracking-wide text-(--text-tertiary)">Categorias:</span>
              {item.categories.map((category) => (
                <span key={category} className="rounded-full border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-2 py-0.5 text-(--text-secondary)">
                  {category}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
