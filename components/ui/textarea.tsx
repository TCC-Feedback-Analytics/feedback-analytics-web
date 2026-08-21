import * as React from 'react';
import type { TextareaProps } from './ui.types';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-lg border bg-(--seventh-color) px-4 py-3 font-poppins text-sm text-(--text-primary) shadow-xs transition-colors duration-200 placeholder:text-(--text-tertiary) outline-hidden focus:outline-hidden focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-(--negative) focus:border-(--negative) focus-visible:border-(--negative) focus-visible:ring-1 focus-visible:ring-(--negative)/40'
            : 'border-(--quaternary-color)/18 hover:border-(--quaternary-color)/30 focus:border-(--primary-color) focus-visible:border-(--primary-color) focus-visible:ring-1 focus-visible:ring-(--primary-color)/40'
        } ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
