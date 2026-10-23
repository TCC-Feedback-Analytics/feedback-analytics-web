import { countLabel } from 'src/lib/utils/plural';
import type { FeedbackPaginationProps } from './ui.types';

export default function FeedbackPagination({
  pagination,
  onPageChange,
}: FeedbackPaginationProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-4 sm:p-5 md:p-6 glass-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="font-work-sans text-sm text-[var(--text-tertiary)]">
          Mostrando {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{' '}
          a{' '}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems,
          )}{' '}
          de {countLabel(pagination.totalItems, 'feedbacks')}
        </div>

        <div className="grid w-full grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 sm:flex sm:w-auto">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="font-poppins flex h-11 w-11 items-center justify-center rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-primary) transition-colors hover:border-(--quaternary-color)/20 hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-50">
            ←
          </button>

          <div className="grid grid-cols-5 items-center gap-1 sm:flex">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, index) => {
                const page = index + 1;
                const isActive = page === pagination.currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`font-poppins flex h-11 min-w-0 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'border border-(--primary-color) bg-(--primary-color) text-(--on-primary)'
                        : 'border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-secondary) hover:border-(--quaternary-color)/20 hover:bg-(--bg-tertiary)'
                    }`}>
                    {page}
                  </button>
                );
              },
            )}
          </div>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="font-poppins flex h-11 w-11 items-center justify-center rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-primary) transition-colors hover:border-(--quaternary-color)/20 hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-50">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
