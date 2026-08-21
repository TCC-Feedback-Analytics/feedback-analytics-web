import * as React from 'react';
import {
  FaCircleCheck,
  FaCircleXmark,
  FaTriangleExclamation,
  FaCircleInfo,
  FaXmark,
} from 'react-icons/fa6';
import type { ToastProps, ToastVariant } from './ui.types';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ToastViewport({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex max-h-screen w-full flex-col-reverse gap-2 sm:max-w-[380px] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

const VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <FaCircleCheck className="h-4 w-4 shrink-0 text-(--positive)" />,
  error: <FaCircleXmark className="h-4 w-4 shrink-0 text-(--negative)" />,
  destructive: <FaCircleXmark className="h-4 w-4 shrink-0 text-(--negative)" />,
  warning: <FaTriangleExclamation className="h-4 w-4 shrink-0 text-(--neutral)" />,
  info: <FaCircleInfo className="h-4 w-4 shrink-0 text-(--primary-color)" />,
  default: <FaCircleInfo className="h-4 w-4 shrink-0 text-(--primary-color)" />,
};

const VARIANT_BORDER_CLASSES: Record<ToastVariant, string> = {
  success: 'border-l-4 border-l-(--positive)',
  error: 'border-l-4 border-l-(--negative)',
  destructive: 'border-l-4 border-l-(--negative)',
  warning: 'border-l-4 border-l-(--neutral)',
  info: 'border-l-4 border-l-(--primary-color)',
  default: 'border-l-4 border-l-(--primary-color)',
};

export const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps & { onClose?: () => void }
>(
  (
    {
      className = '',
      variant = 'default',
      children,
      onClose,
      open = true,
      duration = 4000,
      ...props
    },
    ref
  ) => {
    const [progress, setProgress] = React.useState(100);
    const onCloseRef = React.useRef(onClose);

    React.useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

    React.useEffect(() => {
      if (duration <= 0) return;

      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev - 100 / (duration / 100);
          return next <= 0 ? 0 : next;
        });
      }, 100);

      const timer = setTimeout(() => {
        onCloseRef.current?.();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }, [duration]);

    if (!open) return null;

    const icon = VARIANT_ICONS[variant] || VARIANT_ICONS.default;
    const borderClass = VARIANT_BORDER_CLASSES[variant] || VARIANT_BORDER_CLASSES.default;

    return (
      <div
        ref={ref}
        role={variant === 'error' || variant === 'destructive' ? 'alert' : 'status'}
        aria-live="polite"
        className={`group pointer-events-auto relative flex w-full items-start justify-between space-x-3 overflow-hidden rounded-xl border border-(--quaternary-color)/15 bg-(--bg-secondary)/95 p-4 text-(--text-primary) shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-top-2 fade-in duration-200 ${borderClass} ${className}`}
        {...props}
      >
        <div className="mt-0.5 shrink-0">{icon}</div>

        <div className="flex-1 space-y-1 pr-2">{children}</div>

        {onClose && (
          <ToastClose onClick={onClose} />
        )}

        {duration > 0 && (
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-(--quaternary-color)/30 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export function ToastTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`text-sm font-semibold text-(--text-primary) leading-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function ToastDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-xs text-(--text-tertiary) leading-normal ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function ToastClose({
  className = '',
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={`rounded-md p-1 text-(--text-tertiary) transition-colors hover:text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary-color) shrink-0 ${className}`}
      {...props}
    >
      <FaXmark className="h-3.5 w-3.5" />
    </button>
  );
}

export function ToastAction({
  className = '',
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg bg-(--primary-color)/15 px-3 py-1.5 text-xs font-medium text-(--primary-color) transition-colors hover:bg-(--primary-color)/25 focus:outline-none focus:ring-2 focus:ring-(--primary-color) ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
