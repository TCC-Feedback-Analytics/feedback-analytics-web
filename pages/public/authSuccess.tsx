import AuthShell from 'components/public/shared/AuthShell';
import { useEffect } from 'react';
import { FaArrowRight, FaCircleCheck } from 'react-icons/fa6';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Os links de e-mail voltam para cá. O `tipo` diz qual: sem ele, a confirmação do
 * cadastro. Na troca de e-mail, o gateway marca os dois passos (src/auth/auth.ts).
 */
const MESSAGES = {
  cadastro: {
    title: 'Conta verificada',
    description: 'Sua conta foi confirmada com sucesso. Redirecionando para o dashboard...',
    redirect: true,
  },
  'troca-aprovada': {
    title: 'Troca aprovada',
    description: 'Enviamos um link para o novo endereço. A troca só vale depois que você confirmar por lá.',
    redirect: false,
  },
  'email-trocado': {
    title: 'E-mail trocado',
    description: 'A sua conta já usa o novo endereço. Redirecionando para o dashboard...',
    redirect: true,
  },
} as const;

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  // O Better Auth redireciona para o callbackURL com ?error=<código> quando o
  // link de verificação falha (TOKEN_EXPIRED, INVALID_TOKEN, USER_NOT_FOUND...).
  const verificationError = params.get('error');
  const type = params.get('tipo');
  const message = type === 'troca-aprovada' || type === 'email-trocado' ? MESSAGES[type] : MESSAGES.cadastro;

  useEffect(() => {
    if (verificationError || !message.redirect) return;
    const next = params.get('next') ?? '/user/dashboard';
    const id = setTimeout(() => navigate(next), 1500);
    return () => clearTimeout(id);
  }, [params, navigate, verificationError, message.redirect]);

  if (verificationError) {
    return <Navigate to="/auth/link-expired" replace />;
  }

  return (
    <AuthShell
      icon={<FaCircleCheck className="h-4 w-4" aria-hidden />}
      title={message.title}
      description={message.description}
      eyebrow="TUDO CERTO"
    >
      <Link
        to={params.get('next') ?? '/user/dashboard'}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--primary-color) text-sm font-bold text-(--on-primary) shadow-[0_8px_18px_rgba(53,208,195,0.18)] transition-all hover:brightness-105 active:scale-[0.99]"
      >
        Ir agora <FaArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </AuthShell>
  );
}
