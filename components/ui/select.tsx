import * as React from 'react';
import { FaCheck, FaChevronDown, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import type {
  SelectOption,
  SelectProps,
  SelectNativeProps,
  SelectTriggerProps,
} from './ui.types';

export type { SelectOption, SelectProps, SelectNativeProps, SelectTriggerProps };

export function Select<T extends string | number = string | number>({
  id,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  className = '',
  align = 'left',
  error = false,
  disabled = false,
  startIcon,
  onClear,
  searchable = false,
  searchLabel = 'Buscar opções',
  searchPlaceholder = 'Digite para buscar',
  emptyMessage = 'Nenhuma opção encontrada.',
  noResultsMessage,
  'aria-describedby': ariaDescribedBy,
}: SelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();
  const controlId = id ?? listboxId;

  const selectedOption = options.find((opt) => opt.value === value);
  const activeIcon = selectedOption?.icon ?? startIcon;
  const isValueNonEmpty = value !== undefined && value !== '' && value !== null;
  const isDefaultOptionSelected = !isValueNonEmpty || selectedOption?.value === '';
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const matchingOptions = options.filter((option) =>
    !normalizedSearch || option.label.toLocaleLowerCase().includes(normalizedSearch),
  );
  // Mantém a seleção visível para que uma busca não pareça ter descartado a escolha atual.
  const visibleOptions = options.filter((option) => option.value === value || matchingOptions.includes(option));
  const hasNoSearchResults = Boolean(normalizedSearch && matchingOptions.length === 0);

  React.useEffect(() => {
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

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange('' as T);
    }
  };

  const alignmentClasses =
    align === 'right' ? 'right-0 left-auto origin-top-right' : 'left-0 origin-top-left';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        id={controlId}
        role="combobox"
        value={isValueNonEmpty ? String(value) : ''}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={`${listboxId}-options`}
        aria-haspopup="dialog"
        aria-describedby={ariaDescribedBy}
        className={`flex h-12 w-full items-center justify-between gap-3.5 rounded-xl border bg-(--seventh-color) px-4 font-poppins text-sm shadow-xs transition-all duration-200 outline-hidden focus:outline-hidden focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-(--negative) focus:border-(--negative) focus:ring-2 focus:ring-(--negative)/20'
            : 'border-(--quaternary-color)/18 hover:border-(--quaternary-color)/35 focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {activeIcon && (
            <span className={`shrink-0 transition-colors ${!isDefaultOptionSelected ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`}>
              {activeIcon}
            </span>
          )}
          <span className="truncate text-(--text-primary) font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isValueNonEmpty && onClear && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClearClick}
              onKeyDown={(e) => e.key === 'Enter' && handleClearClick(e as unknown as React.MouseEvent)}
              className="rounded-full p-1 text-(--text-tertiary) hover:bg-(--quaternary-color)/15 hover:text-(--text-primary) transition-colors"
              title="Limpar seleção"
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
          role="dialog"
          aria-label="Opções de seleção"
          className={`absolute top-full z-50 mt-1.5 min-w-full w-full overflow-hidden rounded-xl border border-(--quaternary-color)/16 bg-(--bg-secondary)/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 ${alignmentClasses}`}
        >
          {searchable && (
            <div className="relative mb-2">
              <label htmlFor={`${listboxId}-search`} className="sr-only">{searchLabel}</label>
              <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--text-tertiary)" />
              <input
                id={`${listboxId}-search`}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                className="h-10 w-full rounded-lg border border-(--quaternary-color)/16 bg-(--seventh-color) py-2 pl-9 pr-3 text-sm text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
              />
            </div>
          )}
          <div id={`${listboxId}-options`} role="listbox" className="max-h-60 space-y-0.5 overflow-y-auto custom-scrollbar">
            {hasNoSearchResults && (
              <p className="px-3 py-2 text-center text-sm text-(--text-tertiary)">
                {noResultsMessage ?? emptyMessage}
              </p>
            )}
            {visibleOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => {
                    if (option.disabled) return;
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-poppins transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                      : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <FaCheck className="h-3.5 w-3.5 text-(--primary-color) shrink-0 ml-2" />}
                </button>
              );
            })}
            {visibleOptions.length === 0 && !hasNoSearchResults && (
              <p className="px-3 py-4 text-center text-sm text-(--text-tertiary)">{emptyMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



export const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className = '', children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`flex h-12 w-full appearance-none rounded-xl border bg-(--seventh-color) pl-4 pr-10 font-poppins text-sm text-(--text-primary) shadow-xs transition-all duration-200 outline-hidden focus:outline-hidden focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? 'border-(--negative) focus:border-(--negative) focus:ring-2 focus:ring-(--negative)/20'
              : 'border-(--quaternary-color)/18 hover:border-(--quaternary-color)/35 focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)">
          <FaChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }
);
SelectNative.displayName = 'SelectNative';



export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = '', children, error, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`flex h-12 w-full items-center justify-between gap-3.5 rounded-xl border bg-(--seventh-color) px-4 font-poppins text-sm text-(--text-primary) shadow-xs transition-all duration-200 outline-hidden focus:outline-hidden focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-(--negative) focus:border-(--negative) focus:ring-2 focus:ring-(--negative)/20'
            : 'border-(--quaternary-color)/18 hover:border-(--quaternary-color)/35 focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20'
        } ${className}`}
        {...props}
      >
        <span className="truncate pr-1">{children}</span>
        <FaChevronDown className="h-3.5 w-3.5 shrink-0 text-(--text-tertiary) transition-transform duration-200" />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

export function SelectContent({
  className = '',
  children,
  open = false,
  align = 'left',
}: {
  className?: string;
  children: React.ReactNode;
  open?: boolean;
  align?: 'left' | 'right';
}) {
  if (!open) return null;

  const alignmentClasses =
    align === 'right' ? 'right-0 left-auto origin-top-right' : 'left-0 origin-top-left';

  return (
    <div
      className={`absolute top-full z-50 mt-1.5 min-w-full w-max max-w-xs overflow-hidden rounded-xl border border-(--quaternary-color)/16 bg-(--bg-secondary)/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 ${alignmentClasses} ${className}`}
    >
      <div className="space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  );
}

export function SelectItem({
  className = '',
  children,
  selected = false,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-poppins transition-colors ${
        selected
          ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
          : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
      } ${className}`}
      {...props}
    >
      <span className="truncate">{children}</span>
      {selected && <FaCheck className="h-3.5 w-3.5 text-(--primary-color) shrink-0 ml-2" />}
    </button>
  );
}
