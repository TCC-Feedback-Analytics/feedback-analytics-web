import FormForgotPassword from 'components/public/forms/formForgotPassword';
import AuthShell from 'components/public/shared/AuthShell';
import { FaEnvelope } from 'react-icons/fa6';
import { useSearchParams } from 'react-router-dom';

export default function ForgotPassword() {
  // O gateway manda para cá com ?error=<código> quando o link de redefinição
  // venceu ou já foi usado (callback de recovery sem token).
  const [searchParams] = useSearchParams();
  const resetLinkFailed = searchParams.has('error');

  return (
    <AuthShell
      icon={<FaEnvelope className="h-4 w-4" aria-hidden />}
      title="Recupere seu acesso"
      description="Informe seu e-mail e enviaremos as instruções para criar uma nova senha."
      eyebrow="RECUPERAÇÃO DE SENHA"
    >
      {resetLinkFailed && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-(--negative)/30 bg-(--negative)/10 p-4 text-sm text-(--text-secondary)"
        >
          <span className="font-semibold text-(--text-primary)">O link de redefinição expirou ou já foi usado.</span>{' '}
          Peça um novo abaixo.
        </p>
      )}
      <FormForgotPassword />
    </AuthShell>
  );
}
