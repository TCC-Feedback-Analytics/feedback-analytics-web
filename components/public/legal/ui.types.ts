import type { ReactNode } from 'react';

/**
 * Props da moldura das páginas legais (Privacidade e Termos).
 * Usado em: components/public/legal/LegalPage.tsx.
 */
export type LegalPageProps = {
  title: string;
  intro: ReactNode;
  /** Link para a outra página legal, no fim. */
  related: { to: string; label: string };
  children: ReactNode;
};

/**
 * Props de uma seção numerada das páginas legais.
 * Usado em: components/public/legal/LegalPage.tsx.
 */
export type LegalSectionProps = {
  title: string;
  children: ReactNode;
};
