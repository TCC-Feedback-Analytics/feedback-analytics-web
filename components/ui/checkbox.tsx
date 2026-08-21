import * as React from 'react';
import type { CheckboxProps } from './ui.types';

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`peer h-4 w-4 shrink-0 cursor-pointer rounded border border-(--quaternary-color)/18 bg-(--seventh-color) text-(--primary-color) accent-(--primary-color) transition-colors duration-200 hover:border-(--quaternary-color)/30 focus:ring-2 focus:ring-(--primary-color) focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';
