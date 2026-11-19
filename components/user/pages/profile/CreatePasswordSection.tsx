import { useEffect, useState } from 'react';
import { FaCircleCheck, FaKey, FaSpinner } from 'react-icons/fa6';
import { ServiceAccountHasPassword } from 'src/services/serviceUser';
import { ServiceForgotPassword } from 'src/services/serviceAuth';
import type { CreatePasswordStep } from './ui.types';

/**
 * "Entrar também com senha" no Perfil, só para quem criou a conta pelo Google.
 * A senha não é definida aqui com a sessão aberta: vai um link para o e-mail da
 * conta, o mesmo fluxo do "Esqueci minha senha", que cria a senha na volta. Assim
 * uma sessão roubada não consegue cadastrar uma senha sem acesso ao e-mail.
 * Não aparece no cadastro: só aqui, quando a pessoa quiser.
 */
export default function CreatePasswordSection({ email }: { email: string }) {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [step, setStep] = useState<CreatePasswordStep>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void ServiceAccountHasPassword().then((value) => {
      if (active) setHasPassword(value);
    });
    return () => {
      active = false;
    };
  }, []);

  // Quem já tem senha (ou quando não deu para saber) não vê o cartão.
  if (hasPassword !== false || !email) return null;

  const sendLink = async () => {
    setError(null);
    setStep('sending');
    const result = await ServiceForgotPassword(email);
    if (result.ok) {
      setStep('sent');
      return;
    }
    setError(result.message);
    setStep('idle');
  };

  return (
    <section aria-labelledby="criar-senha-titulo" className="rounded-2xl border border-(--quaternary-color)/15 bg-(--bg-secondary)/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)" aria-hidden>
            <FaKey />
          </span>
          <div>
            <h3 id="criar-senha-titulo" className="font-montserrat text-lg font-bold text-(--text-primary)">
              Entrar também com senha
            </h3>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Sua conta entra pelo Google. Para entrar também com e-mail e senha, enviamos um link para{' '}
              <strong className="text-(--text-primary)">{email}</strong> e você cria a senha por ele.
            </p>
          </div>
        </div>
        {step !== 'sent' && (
          <button
            type="button"
            onClick={() => void sendLink()}
            disabled={step === 'sending'}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-(--primary-color) px-4 py-2 text-sm font-semibold text-(--on-primary) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {step === 'sending' ? <FaSpinner aria-hidden className="animate-spin" /> : <FaKey aria-hidden />}
            {step === 'sending' ? 'Enviando…' : 'Enviar link para criar senha'}
          </button>
        )}
      </div>

      {step === 'sent' && (
        <p role="status" className="mt-4 flex items-start gap-2 text-sm text-(--text-secondary)">
          <FaCircleCheck aria-hidden className="mt-0.5 shrink-0 text-(--positive)" />
          <span>
            Enviamos o link para {email}. Ele vale por 1 hora. Depois de criar a senha, entre de novo: você poderá usar o
            Google ou o e-mail e a senha.
          </span>
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-(--negative)">
          {error}
        </p>
      )}
    </section>
  );
}
