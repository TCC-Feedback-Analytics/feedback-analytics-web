import { FaFilter } from 'react-icons/fa6';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { Select } from 'components/ui/select';
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
    <div className="font-work-sans space-y-5 sm:space-y-6">
      <PageHeader />

      <section className="space-y-4 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4 sm:p-5" aria-labelledby="comments-filter-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="comments-filter-title" className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
              <FaFilter className="text-(--primary-color)" aria-hidden />
              Filtrar comentários
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-(--text-tertiary)">
              Mostrando {visible.length} de {items.length} {items.length === 1 ? 'comentário analisado' : 'comentários analisados'}.
            </p>
          </div>
          <ScopeTag className="w-full justify-center sm:w-auto" />
        </div>

        <div className="w-full sm:max-w-xs">
          <label htmlFor="comments-tone-filter" className="sr-only">Filtrar comentários</label>
          <Select<CommentFilter>
            id="comments-tone-filter"
            value={filter}
            onChange={selectFilter}
            startIcon={<FaFilter className="h-3.5 w-3.5" aria-hidden />}
            options={COMMENT_FILTERS.map((option) => ({
              value: option,
              label: `${COMMENT_FILTER_LABEL[option]} (${filterComments(items, option).length})`,
            }))}
          />
        </div>
      </section>

      {loading ? (
        <p className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4 text-sm text-(--text-tertiary)">Carregando os comentários…</p>
      ) : error ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4 text-sm text-(--text-tertiary) sm:p-6">
          Ainda sem comentários analisados pela IA {scopeInfo.inScope}.
        </div>
      ) : visible.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4 text-sm text-(--text-tertiary) sm:p-6">
          <p>Nenhum comentário neste filtro {scopeInfo.inScope}.</p>
          <button
            type="button"
            onClick={() => selectFilter('todos')}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3 py-2 text-xs font-semibold text-(--primary-color) transition-colors hover:bg-(--primary-color)/18 sm:w-auto"
          >
            Ver todos os comentários
          </button>
        </div>
      ) : (
        <CommentList items={visible} />
      )}
    </div>
  );
}
