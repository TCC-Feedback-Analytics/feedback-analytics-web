import { useState } from 'react';
import { FaArrowUpRightFromSquare, FaSpinner } from 'react-icons/fa6';
import { prepareOpenRouterConnect } from 'src/lib/utils/openRouterConnect';
import type { ConnectOpenRouterButtonProps } from './ui.types';

/**
 * "Conectar com OpenRouter": leva a pessoa ao OpenRouter para entrar (ou criar a
 * conta) e autorizar; ela volta já conectada, sem copiar nem colar chave.
 */
export default function ConnectOpenRouterButton({ returnTo, model, onBeforeRedirect, disabled = false }: ConnectOpenRouterButtonProps) {
  const [redirecting, setRedirecting] = useState(false);

  const connect = async () => {
    setRedirecting(true);
    try {
      const url = await prepareOpenRouterConnect({ returnTo, model });
      onBeforeRedirect?.();
      window.location.assign(url);
    } catch {
      setRedirecting(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => void connect()}
        disabled={disabled || redirecting}
        className="btn-primary font-poppins inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {redirecting ? <FaSpinner className="animate-spin" aria-hidden /> : null}
        {redirecting ? 'Abrindo o OpenRouter…' : 'Conectar com OpenRouter'}
        {!redirecting && <FaArrowUpRightFromSquare className="text-xs" aria-hidden />}
      </button>
      <p className="text-xs text-(--text-tertiary)">
        O OpenRouter é onde a IA roda. A conta é gratuita e os modelos gratuitos não cobram nada: entre (ou crie a conta)
        e autorize; você volta para cá já conectado.
      </p>
    </div>
  );
}
