import * as React from 'react';
import { FaXmark } from 'react-icons/fa6';
import type { DialogChildrenProps, DialogContextValue, DialogProps } from './ui.types';

const DialogContext = React.createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }: {
  children: React.ReactElement;
}) {
  const context = React.useContext(DialogContext);
  if (!context) return children;

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      context.onOpenChange(true);
    },
  });
}

export function DialogContent({
  children,
  className = '',
  showClose = true,
}: {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
}) {
  const context = React.useContext(DialogContext);

  React.useEffect(() => {
    if (!context?.open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [context?.open]);

  if (!context?.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) context.onOpenChange(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className={`scrollbar-thin scrollbar-track-slate-950/50 scrollbar-thumb-slate-950 hover:scrollbar-thumb-slate-800 relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-(--quaternary-color)/15 bg-(--bg-primary) shadow-2xl sm:rounded-3xl ${className}`}
      >
        {showClose && (
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => context.onOpenChange(false)}
            className="absolute right-5 top-5 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-(--text-tertiary) transition-colors hover:bg-(--seventh-color) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)"
          >
            <FaXmark aria-hidden />
          </button>
        )}
        {children}
      </section>
    </div>
  );
}

export function DialogHeader({ children }: DialogChildrenProps) {
  return <div className="border-b border-(--quaternary-color)/10 px-6 pb-5 pt-6 pr-16 sm:px-8 sm:pb-6 sm:pt-8 sm:pr-20">{children}</div>;
}

export function DialogTitle({ children }: DialogChildrenProps) {
  return <h2 className="font-montserrat text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">{children}</h2>;
}

export function DialogDescription({ children }: DialogChildrenProps) {
  return <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--text-secondary)">{children}</p>;
}

export function DialogBody({ children, className = '' }: DialogChildrenProps) {
  return <div className={`scrollbar-thin scrollbar-track-slate-950/50 scrollbar-thumb-slate-950 hover:scrollbar-thumb-slate-800 min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 ${className}`}>{children}</div>;
}

export function DialogFooter({ children }: DialogChildrenProps) {
  return <div className="flex flex-col-reverse gap-3 border-t border-(--quaternary-color)/10 bg-(--bg-secondary)/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">{children}</div>;
}
