import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';

export type RegisterIssue = {
  field: string;
  message: string;
};

export type RegisterErrorMessage = {
  message: string;
  description: string;
};

export type ResendActionData = ActionData & {
  status?: number;
  retryAfterSeconds?: number;
  submittedEmail?: string;
};

/**
 * Props do botão "Continuar com Google".
 * Usado em: components/public/forms/GoogleSignInButton.tsx.
 */
export type GoogleSignInButtonProps = {
  label?: string;
};

/**
 * Valores do formulário "Complete seu cadastro" (primeira entrada com Google).
 * Usado em: components/public/forms/formCompleteSignup.tsx.
 */
export type FormCompleteSignupValues = {
  fullName: string;
  phone: string;
  terms: boolean;
};

/**
 * Props do formulário "Complete seu cadastro".
 * Usado em: components/public/forms/formCompleteSignup.tsx.
 */
export type FormCompleteSignupProps = {
  /** Nome vindo do Google, só como sugestão para o "Nome do negócio". */
  defaultFullName?: string | null;
};
