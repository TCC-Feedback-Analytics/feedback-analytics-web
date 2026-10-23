import FormResendConfirmation from 'components/public/forms/formResendConfirmation';
import AuthShell from 'components/public/shared/AuthShell';
import { FaEnvelope } from 'react-icons/fa6';

export default function ResendConfirmation() {
  return (
    <AuthShell
      icon={<FaEnvelope className="h-4 w-4" aria-hidden />}
      title="Reenviar confirmação"
      description="Informe seu e-mail para solicitar um novo link de confirmação."
      eyebrow="CONFIRMAÇÃO DE E-MAIL"
    >
      <FormResendConfirmation />
    </AuthShell>
  );
}
