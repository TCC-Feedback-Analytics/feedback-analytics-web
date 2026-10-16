import type { IconType } from 'react-icons';
import type { ReactNode } from 'react';

/**
 * Props do cartão de métrica com ícone.
 * Usado em: components/user/shared/cards/MetricCard.tsx.
 */
export type MetricCardProps = {
  title: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  icon: IconType;
};

/**
 * Props do cartão simples reutilizável.
 * Usado em: components/user/shared/cards/cardSimple.tsx.
 */
export type CardSimpleProps = {
  children: ReactNode;
  type?: 'header' | 'default' | 'accordion';
  title?: string;
  description?: string;
  defaultOpen?: boolean;
};