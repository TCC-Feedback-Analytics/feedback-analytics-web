import * as React from 'react';
import { Spinner } from './spinner';
import type { InputProps } from './ui.types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, error, loading, startIcon, endIcon, ...props }, ref) => {
    const hasStartIcon = Boolean(startIcon);
    const hasEndIcon = Boolean(loading || endIcon);

    const inputElement = (
      <input
        type={type}
        className={`flex h-12 w-full rounded-xl border bg-(--seventh-color) font-poppins text-sm text-(--text-primary) shadow-xs transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-(--text-tertiary) outline-hidden focus:outline-hidden focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${
          hasStartIcon ? 'pl-9' : 'px-4'
        } ${hasEndIcon ? 'pr-9' : ''} ${
          error
            ? 'border-(--negative) focus:border-(--negative) focus:ring-2 focus:ring-(--negative)/20 focus-visible:border-(--negative) focus-visible:ring-2 focus-visible:ring-(--negative)/20'
            : 'border-(--quaternary-color)/18 hover:border-(--quaternary-color)/35 focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 focus-visible:border-(--primary-color) focus-visible:ring-2 focus-visible:ring-(--primary-color)/20'
        } ${className}`}
        ref={ref}
        {...props}
      />
    );

    if (!hasStartIcon && !hasEndIcon) {
      return inputElement;
    }

    const isValueNonEmpty = Boolean(props.value);

    return (
      <div className="relative w-full">
        {startIcon && (
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-colors ${isValueNonEmpty ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`}>
            {startIcon}
          </span>
        )}
        {inputElement}
        {loading ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            <Spinner size={16} />
          </span>
        ) : (
          endIcon && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) z-10 flex items-center justify-center">
              {endIcon}
            </span>
          )
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
