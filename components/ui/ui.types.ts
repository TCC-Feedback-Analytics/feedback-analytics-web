import * as React from 'react';

export interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

export type ToastVariant = 'default' | 'success' | 'error' | 'destructive' | 'warning' | 'info';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
}

export interface ToasterToast extends Omit<ToastProps, 'id' | 'title'> {
  id: string | number;
  title?: React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: 'default' | 'uppercase';
}

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

export interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  error?: boolean;
}

export interface SpinnerProps extends React.SVGAttributes<SVGElement> {
  size?: number;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export type ToastInput = {
  title?: React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
};

export type ToastListener = (toasts: ToasterToast[]) => void;

export type ToastFunction = {
  (props: ToastInput | string): { id: string; dismiss: () => void };
  toasts: ToasterToast[];
  toast: ToastFunction;
  dismiss: (toastId?: string | number) => void;
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


