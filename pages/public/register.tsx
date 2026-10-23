import FormRegister from 'components/public/forms/formRegister';
import AuthShell from 'components/public/shared/AuthShell';
import { FaUser } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <AuthShell
      wide
      icon={<FaUser className="h-4 w-4" aria-hidden />}
      title="Crie sua conta"
      description="Comece em minutos e transforme opiniões em decisões melhores."
      eyebrow="NOVA CONTA"
      footer={<p className="text-center text-sm text-(--text-tertiary)">Já tem uma conta? <Link to="/login" className="font-semibold text-(--primary-color) hover:opacity-80">Entrar</Link></p>}
    >
      <FormRegister />
    </AuthShell>
  );
}
