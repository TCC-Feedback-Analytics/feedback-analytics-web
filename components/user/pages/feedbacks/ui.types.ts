import type { ChangeEvent } from 'react';
import type {
  Feedback,
  FeedbackFilters,
  FeedbackPagination,
  FeedbackStats,
} from 'lib/interfaces/domain/feedback.domain';

/**
 * Props do card individual de feedback.
 * Usado em: components/user/pages/feedbacks/feedbackCard.tsx.
 */
export interface FeedbackCardProps {
  feedback: Feedback;
  onClick?: () => void;
}

/**
 * Props da barra de filtros de feedback.
 * Usado em: components/user/pages/feedbacks/feedbackFilters.tsx.
 */
export interface FeedbackFiltersProps {
  filters: FeedbackFilters;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onItemChange: (item: string) => void;
  onRatingFilter: (rating: number | undefined) => void;
  onCategoryFilter?: (
    category: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' | undefined,
  ) => void;
  onLimitChange: (limit: number) => void;
  isSearching?: boolean;
}

/**
 * Props do cabeçalho da página de feedbacks.
 * Usado em: components/user/pages/feedbacks/feedbackHeader.tsx.
 */
export interface FeedbackHeaderProps {
  stats: FeedbackStats | null;
}

/**
 * Props da paginação de feedbacks.
 * Usado em: components/user/pages/feedbacks/feedbackPagination.tsx.
 */
export interface FeedbackPaginationProps {
  pagination: FeedbackPagination;
  onPageChange: (page: number) => void;
}

/**
 * Props do dropdown de filtro de escopo pesquisável.
 * Usado em: components/user/pages/feedbacks/ItemSearchableDropdown.tsx.
 */
export interface ItemSearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}