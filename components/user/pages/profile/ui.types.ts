import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';

/**
 * Etapas da janela "Excluir minha conta".
 * Usado em: components/user/pages/profile/DeleteAccountSection.tsx.
 */
export type DeleteAccountStep = 'confirm' | 'deleting' | 'deleted';

export type CompanyProfileSectionProps = {
  enterprise: EnterpriseContext;
};
