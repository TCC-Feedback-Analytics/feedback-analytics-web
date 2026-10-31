import FormForgotPassword from 'components/public/forms/formForgotPassword';
import AuthShell from 'components/public/shared/AuthShell';
import { FaEnvelope } from 'react-icons/fa6';

export default function ForgotPassword() {
  return (
    <AuthShell
      icon={<FaEnvelope className="h-4 w-4" aria-hidden />}
      title="Recupere seu acesso"
      description="Informe seu e-mail e enviaremos as instruções para criar uma nova senha."
      eyebrow="RECUPERAÇÃO DE SENHA"
    >
      <FormForgotPassword />
    </AuthShell>
  );
}
