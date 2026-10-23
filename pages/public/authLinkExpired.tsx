import AuthShell from 'components/public/shared/AuthShell';
import { useRef, useState } from 'react';
import { FaEnvelope, FaTriangleExclamation } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';
import {
  formatResendCountdown,
  useResendConfirmationCooldown,
} from 'src/hooks/useResendConfirmationCooldown';

const GENERIC_SUCCESS_MESSAGE =
  'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.';

export default function AuthLinkExpired() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestAccepted, setRequestAccepted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const resendInFlightRef = useRef(false);
  const { remainingSeconds, startCooldown } =
    useResendConfirmationCooldown();

  async function handleResend() {
    if (!email || resendInFlightRef.current || remainingSeconds > 0) return;

    resendInFlightRef.current = true;
    setLoading(true);
    setError('');
    try {
      const requestedEmail = email;
      const result = await ServiceResendConfirmation(requestedEmail);

      if (result.ok) {
        startCooldown(result.retryAfterSeconds);
        setSubmittedEmail(requestedEmail);
        setRequestAccepted(true);
        return;
      }

      if (result.error === 'rate_limited') {
        startCooldown(result.retryAfterSeconds);
      }
      setError(result.message);
    } finally {
      resendInFlightRef.current = false;
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon={<FaTriangleExclamation className="h-4 w-4" aria-hidden />}
      title="Link expirado"
      description="O link de confirmação expirou. Informe seu e-mail para solicitar uma nova confirmação."
      eyebrow="CONFIRMAÇÃO PENDENTE"
    >
      <div className="flex flex-col gap-4">
              {requestAccepted ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-(--positive)/30 bg-(--positive)/10 p-4 text-sm text-(--text-secondary)"
                >
                  <p className="font-semibold text-(--text-primary)">
                    Solicitação recebida
                  </p>
                  <p className="mt-1">{GENERIC_SUCCESS_MESSAGE}</p>
                  <p className="mt-1 text-xs text-(--text-tertiary)">
                    Solicitação registrada para: {submittedEmail}
                  </p>
                </div>
              ) : null}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleResend();
                }}
                className="flex flex-col gap-4"
              >
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="E-mail"
                  aria-invalid={Boolean(error)}
                  className="h-12 w-full rounded-xl border border-(--primary-color)/20 bg-(--bg-tertiary) px-4 text-base text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 md:text-sm"
                />
                {error && (
                  <p role="alert" className="text-sm text-red-500">
                    {error}
                  </p>
                )}
                {remainingSeconds > 0 ? (
                  <p
                    aria-live="polite"
                    className="text-center text-xs text-(--text-tertiary)"
                  >
                    Aguarde {formatResendCountdown(remainingSeconds)} para fazer outra solicitação.
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading || !email || remainingSeconds > 0}
                  aria-busy={loading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-(--primary-color) text-sm font-bold text-(--on-primary) shadow-[0_8px_18px_rgba(53,208,195,0.18)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Enviando...'
                    : remainingSeconds > 0
                      ? `Solicitar novamente em ${formatResendCountdown(remainingSeconds)}`
                      : 'Reenviar e-mail'}
                </button>
              </form>
        <Link to="/login" className="inline-flex min-h-11 items-center justify-center gap-2 text-center text-sm font-semibold text-(--primary-color) hover:opacity-80">
          <FaEnvelope className="h-3.5 w-3.5" aria-hidden /> Voltar ao login
        </Link>
      </div>
    </AuthShell>
  );
}
