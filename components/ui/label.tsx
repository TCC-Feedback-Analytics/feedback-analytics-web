import * as React from 'react';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: 'default' | 'uppercase';
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variantClasses =
      variant === 'uppercase'
        ? 'text-xs font-semibold uppercase tracking-wider text-(--text-tertiary)'
        : 'text-sm font-medium text-(--text-primary)';

    return (
      <label
        ref={ref}
        className={`inline-block leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = 'Label';
