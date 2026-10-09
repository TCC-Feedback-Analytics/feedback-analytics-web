import Card from 'components/public/shared/card';
import SVGLock from 'components/svg/lock';
import { useRef, useState } from 'react';
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
    <div className="relative flex min-h-screen items-center justify-center bg-(--bg-primary) p-4">
      <div className="w-full max-w-2xl">
        <Card
          icon={<SVGLock />}
          title="Link expirado"
          text="O link de confirmação expirou. Informe seu e-mail para solicitar uma nova confirmação."
          children={
            <div className="mt-6 flex flex-col gap-3">
              {requestAccepted ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-lg border border-(--positive)/30 bg-(--positive)/10 p-3 text-sm text-(--text-secondary)"
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
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="E-mail"
                  aria-invalid={Boolean(error)}
                  className="h-12 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-4 text-sm text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-1 focus:ring-(--primary-color)"
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
                  className="flex h-12 w-full items-center justify-center rounded-lg border border-(--primary-color)/40 bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-medium text-white transition-opacity duration-150 hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Enviando...'
                    : remainingSeconds > 0
                      ? `Solicitar novamente em ${formatResendCountdown(remainingSeconds)}`
                      : 'Reenviar e-mail'}
                </button>
              </form>
              <Link
                to="/login"
                className="text-center text-sm text-(--text-secondary) hover:text-(--text-primary)"
              >
                Voltar ao login
              </Link>
            </div>
          }
          linkLogin="/login"
        />
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-(--primary-color)/10" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-(--secondary-color)/10" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--tertiary-color)/8" />
      </div>
    </div>
  );
}
