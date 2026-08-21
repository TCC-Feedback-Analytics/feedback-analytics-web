import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa6';
import { SCOPE_CONFIG } from 'src/lib/constants/insightsScopes';
import type { InsightScopeOption, ScopeSelectorDropdownProps } from './ui.types';

export function ScopeSelectorDropdown({
  options,
  selected,
  onChange,
}: ScopeSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedConfig = SCOPE_CONFIG[selected] ?? SCOPE_CONFIG.COMPANY;
  const SelectedIcon = selectedConfig.Icon;

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

  const handleSelect = (scope: InsightScopeOption) => {
    onChange(scope);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 py-1.5 text-xs font-medium text-(--text-primary) shadow-sm backdrop-blur-md transition-all duration-200 hover:border-(--quaternary-color)/35 hover:bg-(--seventh-color) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 focus:outline-none"
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md text-xs shrink-0"
          style={{ backgroundColor: `${selectedConfig.color}20`, color: selectedConfig.color }}
        >
          <SelectedIcon className="h-3 w-3" />
        </span>
        <span className="font-poppins font-medium flex items-center gap-1">
          <span className="hidden sm:inline text-(--text-tertiary)">Escopo:</span>
          <span>{selectedConfig.label}</span>
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
          aria-label="Selecionar escopo"
          className="absolute left-0 top-full z-50 mt-1.5 w-48 origin-top-left rounded-xl border border-(--quaternary-color)/16 bg-(--bg-secondary) p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
            Escopo do Dashboard
          </div>
          <div className="mt-1 space-y-0.5">
            {options.map((scope) => {
              const { label, Icon, color } = SCOPE_CONFIG[scope];
              const isSelected = scope === selected;

              return (
                <button
                  key={scope}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(scope)}
                  className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                      : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-poppins font-medium leading-tight truncate">{label}</span>
                  </div>
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
