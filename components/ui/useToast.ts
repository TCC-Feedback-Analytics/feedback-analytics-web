import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ToasterToast, ToastVariant } from './ui.types';

type ToastInput = {
  title?: React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
};

type Listener = (toasts: ToasterToast[]) => void;

let memoryToasts: ToasterToast[] = [];
let count = 0;
const listeners: Listener[] = [];

function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function notifyListeners() {
  listeners.forEach((listener) => listener(memoryToasts));
}

export function dismissToast(toastId?: string | number) {
  if (toastId !== undefined) {
    memoryToasts = memoryToasts.filter((t) => t.id !== toastId);
  } else {
    memoryToasts = [];
  }
  notifyListeners();
}

export type ToastFunction = {
  (props: ToastInput | string): { id: string; dismiss: () => void };
  toasts: ToasterToast[];
  toast: ToastFunction;
  dismiss: typeof dismissToast;
  success: (
    message: React.ReactNode,
    description?: React.ReactNode,
    options?: { actionLabel?: string; onAction?: () => void; duration?: number }
  ) => { id: string; dismiss: () => void };
  error: (
    message: React.ReactNode,
    description?: React.ReactNode,
    options?: { actionLabel?: string; onAction?: () => void; duration?: number }
  ) => { id: string; dismiss: () => void };
  warning: (
    message: React.ReactNode,
    description?: React.ReactNode,
    options?: { actionLabel?: string; onAction?: () => void; duration?: number }
  ) => { id: string; dismiss: () => void };
  info: (
    message: React.ReactNode,
    description?: React.ReactNode,
    options?: { actionLabel?: string; onAction?: () => void; duration?: number }
  ) => { id: string; dismiss: () => void };
};

const toastFn = function (props: ToastInput | string): { id: string; dismiss: () => void } {
  const id = genId();

  const toastItem: ToasterToast = typeof props === 'string'
    ? { id, title: props }
    : { id, ...props };

  memoryToasts = [...memoryToasts, toastItem];
  notifyListeners();

  return {
    id,
    dismiss: () => dismissToast(id),
  };
} as ToastFunction;

export const toast = toastFn;

toast.dismiss = dismissToast;

toast.success = (
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: { actionLabel?: string; onAction?: () => void; duration?: number }
) => {
  return toast({
    title: message,
    message,
    description,
    variant: 'success',
    ...options,
  });
};

toast.error = (
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: { actionLabel?: string; onAction?: () => void; duration?: number }
) => {
  return toast({
    title: message,
    message,
    description,
    variant: 'error',
    ...options,
  });
};

toast.warning = (
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: { actionLabel?: string; onAction?: () => void; duration?: number }
) => {
  return toast({
    title: message,
    message,
    description,
    variant: 'warning',
    ...options,
  });
};

toast.info = (
  message: React.ReactNode,
  description?: React.ReactNode,
  options?: { actionLabel?: string; onAction?: () => void; duration?: number }
) => {
  return toast({
    title: message,
    message,
    description,
    variant: 'info',
    ...options,
  });
};

Object.defineProperty(toast, 'toasts', {
  get() {
    return memoryToasts;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(toast, 'toast', {
  get() {
    return toast;
  },
  enumerable: true,
  configurable: true,
});

export function useToast(): ToastFunction {
  const [, setToasts] = useState<ToasterToast[]>(memoryToasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return toast;
}

export function bindToastDispatch(_dispatch: unknown) {
  // Mantido para retrocompatibilidade
  return () => {};
}
