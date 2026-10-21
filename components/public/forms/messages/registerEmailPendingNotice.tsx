import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { RegisterEmailPendingNoticeProps } from './ui.types';
import { useToast } from 'components/public/forms/messages/useToast';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';
import {
  formatResendCountdown,
  useResendConfirmationCooldown,
} from 'src/hooks/useResendConfirmationCooldown';
import { emailProviderOf } from 'src/lib/utils/emailProvider';

const GENERIC_SUCCESS_MESSAGE =
  'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.';

export default function RegisterEmailPendingNotice({
  email,
}: RegisterEmailPendingNoticeProps) {
  const toast = useToast();
  const [isResending, setIsResending] = useState(false);
  const isResendingRef = useRef(false);
  const { remainingSeconds, startCooldown } =
    useResendConfirmationCooldown();

  const handleResend = useCallback(async () => {
    if (isResendingRef.current || remainingSeconds > 0) return;

    if (!email) {
      toast.error('E-mail não encontrado', 'Não foi possível identificar o e-mail para reenvio.');
      return;
    }

    isResendingRef.current = true;
    setIsResending(true);
    try {
      const result = await ServiceResendConfirmation(email);

      if (result.ok) {
        startCooldown(result.retryAfterSeconds);
        toast.success(
          'Solicitação recebida',
          result.message || GENERIC_SUCCESS_MESSAGE,
        );
      } else {
        if (result.error === 'rate_limited') {
          startCooldown(result.retryAfterSeconds);
        }

        const title =
          result.error === 'rate_limited'
            ? 'Muitas tentativas'
            : result.error === 'network_error'
              ? 'Falha de conexão'
              : result.status >= 500
                ? 'Serviço indisponível'
                : 'Falha no reenvio';
        toast.error(title, result.message || 'Tente novamente em instantes.');
      }
    } finally {
      isResendingRef.current = false;
      setIsResending(false);
    }
  }, [email, remainingSeconds, startCooldown, toast]);

  // Uma ação principal, à vista no celular: abrir a caixa de entrada. O resto é
  // ajuda pequena embaixo (o texto longo de antes ocupava a tela e ninguém lia).
  const provider = emailProviderOf(email);

  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col place-items-center gap-5 text-center sm:rounded-xl sm:border sm:border-(--positive)/24 sm:bg-(--positive)/8 sm:p-6"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--positive)/35 bg-(--positive)/15">
        <svg
          className="h-6 w-6 text-(--positive)"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 5.5L10 10.75L17.5 5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2.5"
            y="4.5"
            width="15"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
          Confirme seu e-mail
        </h2>
        <p className="font-work-sans text-sm leading-relaxed text-(--text-secondary)">
          Enviamos um link para{' '}
          {email ? <strong className="break-all text-(--text-primary)">{email}</strong> : 'o seu e-mail'}. Abra e
          toque em <strong className="text-(--text-primary)">Confirmar</strong> para entrar.
        </p>
      </div>

      {provider && (
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary font-poppins inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold"
        >
          Abrir o {provider.name}
          <span aria-hidden>↗</span>
        </a>
      )}

      <div className="flex w-full flex-col items-center gap-2 font-work-sans text-sm text-(--text-tertiary)">
        <p>Não chegou? Veja a pasta de spam ou promoções.</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || remainingSeconds > 0}
          aria-busy={isResending}
          className="font-medium text-(--primary-color) transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending
            ? 'Reenviando...'
            : remainingSeconds > 0
              ? `Solicitar novamente em ${formatResendCountdown(remainingSeconds)}`
              : 'Reenviar e-mail de confirmação'}
        </button>
        <Link to="/login" className="text-xs text-(--text-tertiary) transition-opacity hover:opacity-80">
          Já confirmei · Ir para login
        </Link>
      </div>
    </section>
  );
}
