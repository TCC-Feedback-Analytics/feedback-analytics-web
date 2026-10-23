import FormResetPassword from 'components/public/forms/formResetPassword';
import AuthShell from 'components/public/shared/AuthShell';
import { FaLock } from 'react-icons/fa6';

export default function ResetPassword() {
  return (
    <AuthShell
      icon={<FaLock className="h-4 w-4" aria-hidden />}
      title="Redefina sua senha"
      description="Escolha uma senha forte para proteger sua conta."
      eyebrow="NOVA SENHA"
    >
      <FormResetPassword />
    </AuthShell>
  );
}
