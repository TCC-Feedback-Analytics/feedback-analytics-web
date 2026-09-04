import { useEffect, useRef, useState } from 'react';
import {
  FaCheck,
  FaChevronDown,
  FaMagnifyingGlass,
  FaXmark,
  FaUserGroup,
  FaBox,
  FaWrench,
  FaTag,
  FaBuilding,
} from 'react-icons/fa6';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import type { InsightsCatalogItemOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';
import type { ItemSearchableDropdownProps } from './ui.types';

function useOptionalInsightsControls(): { catalogItemOptions: InsightsCatalogItemOption[] } {
  try {
    const ctx = useInsightsControls();
    return { catalogItemOptions: ctx?.catalogItemOptions ?? [] };
  } catch {
    return { catalogItemOptions: [] };
  }
}

export default function ItemSearchableDropdown({
  value,
  onChange,
  placeholder = 'Escopo: Geral',
}: ItemSearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { catalogItemOptions } = useOptionalInsightsControls();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (selectedName: string) => {
    onChange(selectedName);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  // Group catalog items by kind
  const filteredOptions = catalogItemOptions.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  const departments = filteredOptions.filter((item) => item.kind === 'DEPARTMENT');
  const products = filteredOptions.filter((item) => item.kind === 'PRODUCT');
  const services = filteredOptions.filter((item) => item.kind === 'SERVICE');

  const selectedItemObj = catalogItemOptions.find((i) => i.name === value);
  let SelectedIcon = FaBuilding;
  let iconColorClass = 'text-[#6366f1]';

  if (selectedItemObj?.kind === 'DEPARTMENT') {
    SelectedIcon = FaUserGroup;
    iconColorClass = 'text-pink-500';
  } else if (selectedItemObj?.kind === 'PRODUCT') {
    SelectedIcon = FaBox;
    iconColorClass = 'text-emerald-500';
  } else if (selectedItemObj?.kind === 'SERVICE') {
    SelectedIcon = FaWrench;
    iconColorClass = 'text-amber-500';
  } else if (value) {
    SelectedIcon = FaTag;
    iconColorClass = 'text-(--primary-color)';
  }

  const hasExactMatch = catalogItemOptions.some(
    (i) => i.name.toLowerCase() === query.trim().toLowerCase(),
  );

  return (
    <div ref={containerRef} className="relative w-full text-left font-work-sans">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-12 w-full items-center justify-between gap-3.5 rounded-xl border border-(--quaternary-color)/18 bg-(--seventh-color) px-4 font-poppins text-sm text-(--text-primary) shadow-xs transition-all duration-200 hover:border-(--quaternary-color)/35 focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 focus:outline-none"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SelectedIcon
            className={`h-3.5 w-3.5 shrink-0 transition-colors ${iconColorClass}`}
          />
          <span className="truncate text-(--text-primary) font-medium">
            {value ? `Escopo: ${value}` : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
              className="rounded-full p-1 text-(--text-tertiary) hover:bg-(--quaternary-color)/15 hover:text-(--text-primary) transition-colors"
              title="Limpar filtro de escopo"
            >
              <FaXmark className="h-3 w-3" />
            </span>
          )}
          <FaChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-(--text-tertiary) transition-transform duration-200 ${
              open ? 'rotate-180 text-(--primary-color)' : 'rotate-0'
            }`}
          />
        </div>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 w-full overflow-hidden rounded-xl border border-(--quaternary-color)/16 bg-(--bg-secondary) p-2 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
        >
          {/* Campo de pesquisa interno */}
          <div className="relative mb-2">
            <FaMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-(--text-tertiary)" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar escopo (item/depto)..."
              className="w-full rounded-lg border border-(--quaternary-color)/16 bg-(--seventh-color) pl-8 pr-3 py-1.5 text-xs text-(--text-primary) placeholder-(--text-tertiary) focus:border-(--primary-color) focus:outline-none"
            />
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {/* Opção padrão: Geral (Visão Global) */}
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect('')}
              className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                !value
                  ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                  : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#6366f1]/20 text-[#6366f1] transition-transform group-hover:scale-105">
                  <FaBuilding className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-col truncate">
                  <span className="font-poppins font-medium leading-tight truncate">Geral (Visão Global)</span>
                  <span className="text-[10px] text-(--text-tertiary) truncate">Todos os produtos, serviços e deptos</span>
                </div>
              </div>
              {!value && <FaCheck className="h-3.5 w-3.5 shrink-0 text-(--primary-color) ml-2" />}
            </button>

            {/* Departamentos */}
            {departments.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase flex items-center gap-1.5">
                  <FaUserGroup className="h-3 w-3 text-pink-500" />
                  <span>Departamentos</span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {departments.map((dept) => {
                    const isSelected = value === dept.name;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(dept.name)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                            : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
                        }`}
                      >
                        <span className="truncate font-poppins pl-1">{dept.name}</span>
                        {isSelected && <FaCheck className="h-3 w-3 shrink-0 text-(--primary-color)" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Produtos */}
            {products.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase flex items-center gap-1.5">
                  <FaBox className="h-3 w-3 text-emerald-500" />
                  <span>Produtos</span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {products.map((prod) => {
                    const isSelected = value === prod.name;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(prod.name)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                            : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
                        }`}
                      >
                        <span className="truncate font-poppins pl-1">{prod.name}</span>
                        {isSelected && <FaCheck className="h-3 w-3 shrink-0 text-(--primary-color)" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Serviços */}
            {services.length > 0 && (
              <div>
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase flex items-center gap-1.5">
                  <FaWrench className="h-3 w-3 text-amber-500" />
                  <span>Serviços</span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {services.map((serv) => {
                    const isSelected = value === serv.name;
                    return (
                      <button
                        key={serv.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(serv.name)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                            : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
                        }`}
                      >
                        <span className="truncate font-poppins pl-1">{serv.name}</span>
                        {isSelected && <FaCheck className="h-3 w-3 shrink-0 text-(--primary-color)" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Opção para pesquisar valor livre digitado se não houver correspondência exata */}
            {query.trim().length > 0 && !hasExactMatch && (
              <button
                type="button"
                role="option"
                onClick={() => handleSelect(query.trim())}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-(--primary-color) hover:bg-(--seventh-color)/60 border-t border-(--quaternary-color)/12 mt-1"
              >
                <span className="truncate font-poppins font-medium">Filtrar por: &quot;{query.trim()}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
