import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';

/**
 * Etapas da janela "Excluir minha conta".
 * Usado em: components/user/pages/profile/DeleteAccountSection.tsx.
 */
export type DeleteAccountStep = 'confirm' | 'deleting' | 'deleted';

/** Etapas do "Entrar também com senha": enviar o link para o e-mail da conta. */
export type CreatePasswordStep = 'idle' | 'sending' | 'sent';

export type CompanyProfileSectionProps = {
  enterprise: EnterpriseContext;
};
