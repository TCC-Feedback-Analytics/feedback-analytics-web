import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Input } from 'components/ui/input';
import { Select } from 'components/ui/select';
import type { FeedbackFiltersProps } from './ui.types';

const RATING_OPTIONS = [
  { value: '', label: 'Todos os ratings' },
  { value: '5', label: '5 estrelas' },
  { value: '4', label: '4 estrelas' },
  { value: '3', label: '3 estrelas' },
  { value: '2', label: '2 estrelas' },
  { value: '1', label: '1 estrela' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Todas as categorias' },
  { value: 'COMPANY', label: 'Empresa' },
  { value: 'PRODUCT', label: 'Produto' },
  { value: 'SERVICE', label: 'Serviços' },
  { value: 'DEPARTMENT', label: 'Departamentos' },
];

const LIMIT_OPTIONS = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
];

export default function FeedbackFilters({
  filters,
  onSearchChange,
  onItemChange,
  onRatingFilter,
  onCategoryFilter,
  onLimitChange,
}: FeedbackFiltersProps) {
  return (
    <div className="font-work-sans relative z-30 overflow-visible rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Busca por mensagem */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar por mensagem..."
            startIcon={<FaMagnifyingGlass size={13} />}
            value={filters.search}
            onChange={onSearchChange}
          />
        </div>

        {/* Filtro por rating */}
        <div className="flex items-center gap-2 min-w-[180px]">
          <Select
            options={RATING_OPTIONS}
            value={filters.rating !== undefined ? String(filters.rating) : ''}
            onChange={(val) =>
              onRatingFilter(val ? parseInt(String(val)) : undefined)
            }
            placeholder="Todos os ratings"
          />
        </div>

        {/* Filtro por categoria */}
        <div className="flex items-center gap-2 min-w-[210px]">
          <Select
            options={CATEGORY_OPTIONS}
            value={filters.category || ''}
            onChange={(val) =>
              onCategoryFilter(
                val
                  ? (String(val) as
                    | 'COMPANY'
                    | 'PRODUCT'
                    | 'SERVICE'
                    | 'DEPARTMENT')
                  : undefined,
              )
            }
            placeholder="Todas as categorias"
          />
        </div>

        {/* Filtro por item */}
        <div className="flex-1 min-w-[220px]">
          <Input
            type="text"
            placeholder="Filtrar por item (ex: Bola de couro)"
            value={filters.item || ''}
            onChange={onItemChange}
          />
        </div>

        {/* Itens por página */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <span className="text-sm text-[var(--text-tertiary)] shrink-0">Por página:</span>
          <Select
            options={LIMIT_OPTIONS}
            value={filters.limit}
            align="right"
            onChange={(val) => onLimitChange(Number(val))}
          />
        </div>
      </div>
    </div>
  );
}
