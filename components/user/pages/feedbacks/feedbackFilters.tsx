import {
  FaMagnifyingGlass,
  FaStar,
  FaListOl,
} from 'react-icons/fa6';
import { Input } from 'components/ui/input';
import { Select, type SelectOption } from 'components/ui/select';
import ItemSearchableDropdown from './ItemSearchableDropdown';
import type { FeedbackFiltersProps } from './ui.types';

const RATING_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Todos os ratings', icon: <FaStar className="h-3.5 w-3.5 text-(--text-tertiary)" /> },
  { value: '5', label: '5 estrelas', icon: <FaStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> },
  { value: '4', label: '4 estrelas', icon: <FaStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> },
  { value: '3', label: '3 estrelas', icon: <FaStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> },
  { value: '2', label: '2 estrelas', icon: <FaStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> },
  { value: '1', label: '1 estrela', icon: <FaStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> },
];

const LIMIT_OPTIONS: SelectOption<number>[] = [
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
  onLimitChange,
}: FeedbackFiltersProps) {
  return (
    <div className="font-work-sans relative z-30 overflow-visible rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-4 md:p-5 glass-card">
      <div className="flex flex-wrap items-center gap-3">
        {/* Busca por mensagem */}
        <div className="w-full sm:w-auto min-w-[200px] flex-1 basis-56">
          <Input
            type="text"
            placeholder="Buscar por mensagem..."
            startIcon={<FaMagnifyingGlass size={13} />}
            value={filters.search}
            onChange={onSearchChange}
          />
        </div>

        {/* Filtro por escopo / item / departamento (Dropdown com pesquisa) */}
        <div className="w-full sm:w-auto sm:min-w-[190px]">
          <ItemSearchableDropdown
            value={filters.item || ''}
            onChange={onItemChange}
            placeholder="Escopo: Geral"
          />
        </div>

        {/* Filtro por rating */}
        <div className="w-full sm:w-auto sm:min-w-[170px]">
          <Select
            options={RATING_OPTIONS}
            value={filters.rating !== undefined ? String(filters.rating) : ''}
            startIcon={<FaStar className="h-3.5 w-3.5 text-amber-400" />}
            onClear={() => onRatingFilter(undefined)}
            onChange={(val) =>
              onRatingFilter(val ? parseInt(String(val)) : undefined)
            }
            placeholder="Todos os ratings"
          />
        </div>

        {/* Itens por página */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-xs sm:text-sm text-[var(--text-tertiary)] shrink-0">Por página:</span>
          <div className="w-20">
            <Select
              options={LIMIT_OPTIONS}
              value={filters.limit}
              align="right"
              startIcon={<FaListOl className="h-3 w-3 text-(--text-tertiary)" />}
              onChange={(val) => onLimitChange(Number(val))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
