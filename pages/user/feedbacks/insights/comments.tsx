import { useLoaderData, useSearchParams } from 'react-router-dom';
import PageHeader from 'components/user/shared/PageHeader';
import ScopeTag from 'components/user/shared/ScopeTag';
import CommentList from 'components/user/pages/comments/CommentList';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedFeedbackAnalysis } from 'src/lib/hooks/useScopedFeedbackAnalysis';
import {
  COMMENT_FILTERS,
  COMMENT_FILTER_LABEL,
  filterComments,
  parseCommentFilter,
  type CommentFilter,
} from 'src/lib/utils/commentTone';
import { scopeText } from 'src/lib/utils/scopeText';
import type { LoaderCommentsAnalysis } from 'src/routes/loaders/loaderCommentsAnalysis';

/**
 * "Análise dos comentários" › Comentários (decisões de 16/10/2026): os
 * comentários lidos pela IA, no escopo do cabeçalho, com filtros por tom e pela
 * divergência nota × texto. Substitui Feedbacks › Analisados (que ignorava o
 * escopo) e os "momentos emocionais".
 */
export default function CommentsPage() {
  const initialData = useLoaderData<Awaited<ReturnType<typeof LoaderCommentsAnalysis>>>();
  const { items, loading, error } = useScopedFeedbackAnalysis(initialData);
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = parseCommentFilter(searchParams.get('filtro'));
  const visible = filterComments(items, filter);

  const selectFilter = (next: CommentFilter) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'todos') params.delete('filtro');
    else params.set('filtro', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="font-work-sans space-y-6">
      <PageHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrar comentários" className="flex flex-wrap gap-2">
          {COMMENT_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => selectFilter(option)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === option
                  ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color)'
                  : 'border-(--quaternary-color)/18 text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              {COMMENT_FILTER_LABEL[option]} ({filterComments(items, option).length})
            </button>
          ))}
        </div>
        <ScopeTag />
      </div>

      {loading ? (
        <p className="text-sm text-(--text-tertiary)">Carregando os comentários…</p>
      ) : error ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-6 text-sm text-(--text-tertiary)">
          Ainda sem comentários analisados pela IA {scopeInfo.inScope}.
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-6 text-sm text-(--text-tertiary)">
          Nenhum comentário neste filtro {scopeInfo.inScope}.
        </div>
      ) : (
        <CommentList items={visible} />
      )}
    </div>
  );
}
