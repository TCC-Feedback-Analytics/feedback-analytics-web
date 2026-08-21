import * as React from 'react';
import { FaCheck, FaChevronDown, FaXmark } from 'react-icons/fa6';

export interface SelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps<T extends string | number = string | number> {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
  error?: boolean;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  onClear?: () => void;
}

export function Select<T extends string | number = string | number>({
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
}: SelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const activeIcon = selectedOption?.icon ?? startIcon;
  const isValueNonEmpty = value !== undefined && value !== '' && value !== null;
  const isDefaultOptionSelected = !isValueNonEmpty || selectedOption?.value === '';

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
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
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
          role="listbox"
          className={`absolute top-full z-50 mt-1.5 min-w-full w-max max-w-xs overflow-hidden rounded-xl border border-(--quaternary-color)/16 bg-(--bg-secondary)/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 ${alignmentClasses}`}
        >
          <div className="space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-poppins transition-colors ${
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
          </div>
        </div>
      )}
    </div>
  );
}

export interface SelectNativeProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
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

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  error?: boolean;
}

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
