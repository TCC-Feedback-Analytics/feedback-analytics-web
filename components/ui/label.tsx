import * as React from 'react';
import type { LabelProps } from './ui.types';

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variantClasses =
      variant === 'uppercase'
        ? 'text-xs font-semibold uppercase tracking-wider text-(--text-tertiary)'
        : 'text-sm font-medium text-(--text-primary)';

    const hasDisplay = /\b(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)\b/.test(className);
    const displayClass = hasDisplay ? '' : 'inline-block';

    return (
      <label
        ref={ref}
        className={`${displayClass} leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = 'Label';
