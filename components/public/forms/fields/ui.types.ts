import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

/**
 * Props base compartilhadas pelos campos de formulário público.
 * Usado em: components/public/forms/fields/fieldsRegister/* e fieldsLogin/*.
 */
export interface FieldFormProps {
  id: string;
  name: string;
  label?: string;
  icon?: ReactNode;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  register?: UseFormRegisterReturn;
  error?: string;
}

/**
 * Props do campo de senha do cadastro.
 * Usado em: components/public/forms/fields/fieldsRegister/fieldPassword.tsx.
 */
export interface FieldPasswordRegisterProps extends FieldFormProps {
  /** Mostra a barra de força (só no campo "Senha"; no "Confirmar senha", não). */
  showStrength?: boolean;
  /** Dados da pessoa que não podem compor a senha (nome do negócio, e-mail, telefone). */
  userInputs?: Array<string | null | undefined>;
}

/**
 * Props do campo de e-mail do formulário de QR Code.
 * Usado em: components/public/forms/fields/fieldsQRCode/fieldCustomerEmail.tsx.
 */
export interface FieldCustomerEmailProps {
  email: string;
  onEmailChange: (email: string) => void;
}
