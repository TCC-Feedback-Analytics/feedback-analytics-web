import type { ReactNode } from 'react';

/**
 * Props do card público base usado nas telas não autenticadas.
 * Usado em: components/public/shared/card.tsx.
 */
export interface CardProps {
  icon?: ReactNode;
  title: string;
  text: string;
  children: ReactNode;
  linkRegister?: string;
  linkLogin?: string;
}

export interface AuthShellProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  eyebrow?: string;
}
