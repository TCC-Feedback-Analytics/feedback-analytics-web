import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa6';
import { SCOPE_CONFIG } from 'src/lib/constants/insightsScopes';
import type { CatalogItemDropdownProps } from './ui.types';

export function CatalogItemDropdown({
  scope,
  items,
  selectedId,
  onChange,
}: CatalogItemDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scopeConfig = SCOPE_CONFIG[scope] ?? SCOPE_CONFIG.COMPANY;
  const ScopeIcon = scopeConfig.Icon;

  const selectedItem = items.find((item) => item.id === selectedId);

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const placeholder = `Selecione ${scopeConfig.label.toLowerCase()}...`;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 py-1.5 text-xs font-medium text-(--text-primary) shadow-sm backdrop-blur-md transition-all duration-200 hover:border-(--quaternary-color)/35 hover:bg-(--seventh-color) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 focus:outline-none"
      >
        <ScopeIcon className="h-3 w-3 shrink-0" style={{ color: scopeConfig.color }} />
        <span className="font-poppins font-medium truncate max-w-[150px] sm:max-w-[200px]">
          {selectedItem ? selectedItem.name : placeholder}
        </span>
        <FaChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-(--text-tertiary) transition-transform duration-200 ${
            open ? 'rotate-180 text-(--primary-color)' : 'rotate-0'
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`Selecionar ${scopeConfig.label}`}
          className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-56 overflow-y-auto custom-scrollbar origin-top-left rounded-xl border border-(--quaternary-color)/16 bg-(--bg-secondary) p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
            {scopeConfig.label}s Cadastrados
          </div>
          <div className="mt-1 space-y-0.5">
            {items.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                      : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
                  }`}
                >
                  <span className="truncate font-poppins">{item.name}</span>
                  {isSelected && (
                    <FaCheck className="h-3.5 w-3.5 shrink-0 text-(--primary-color) ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
