import { useState, useEffect } from 'react';
import type { ToasterToast, ToastInput, ToastListener, ToastFunction } from './ui.types';

export type { ToastFunction };

let memoryToasts: ToasterToast[] = [];
let count = 0;
const listeners: ToastListener[] = [];

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

export function bindToastDispatch() {
  // Mantido para retrocompatibilidade
  return () => {};
}
