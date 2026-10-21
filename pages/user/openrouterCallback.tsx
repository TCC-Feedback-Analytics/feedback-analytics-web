import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa6';
import { useToast } from 'components/public/forms/messages/useToast';
import { iaConfigError } from 'src/lib/utils/iaConfigErrors';
import { takePendingOpenRouterConnect } from 'src/lib/utils/openRouterConnect';
import { ServiceConnectOpenRouter } from 'src/services/serviceIaConfig';

const IA_SETTINGS_PATH = '/user/edit/ia-settings';

/**
 * Volta do "Conectar com OpenRouter": o OpenRouter devolve `?code=`; com o
 * verificador guardado na saída, o gateway troca pela chave. Depois, volta para
 * a tela de onde a pessoa saiu, com `?openrouter=connected` (recarrega os dados).
 */
export default function OpenRouterCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState<{ message: string; returnTo: string } | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const code = searchParams.get('code');
    const pending = takePendingOpenRouterConnect();
    if (!code || !pending) {
      setError({
        message: 'A conexão com o OpenRouter não foi concluída ou demorou demais. Tente conectar de novo.',
        returnTo: pending?.returnTo ?? IA_SETTINGS_PATH,
      });
      return;
    }

    ServiceConnectOpenRouter({ code, codeVerifier: pending.codeVerifier, model: pending.model })
      .then(() => {
        toast.success('OpenRouter conectado!', 'A IA já pode ser usada com a sua conta.');
        const separator = pending.returnTo.includes('?') ? '&' : '?';
        navigate(`${pending.returnTo}${separator}openrouter=connected`, { replace: true });
      })
      .catch((reason: unknown) => {
        setError({
          message: iaConfigError(reason, 'Não foi possível conectar ao OpenRouter agora. Tente de novo.').message,
          returnTo: pending.returnTo,
        });
      });
  }, [searchParams, navigate, toast]);

  return (
    <div className="font-work-sans mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      {error ? (
        <>
          <h1 className="font-montserrat text-lg font-semibold text-(--text-primary)">Não deu para conectar</h1>
          <p className="text-sm text-(--text-secondary)" role="alert">{error.message}</p>
          <Link to={error.returnTo} className="btn-primary font-poppins inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-semibold">
            Voltar e tentar de novo
          </Link>
        </>
      ) : (
        <p className="flex items-center gap-2 text-sm text-(--text-secondary)" role="status">
          <FaSpinner className="animate-spin text-(--primary-color)" aria-hidden />
          Conectando a sua conta do OpenRouter…
        </p>
      )}
    </div>
  );
}
