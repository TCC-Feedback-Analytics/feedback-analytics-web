import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaGoogle, FaSpinner } from 'react-icons/fa6';
import { googleSignInUrl, isGoogleAuthEnabled } from 'src/lib/utils/googleAuth';
import type { GoogleSignInButtonProps } from './ui.types';

/**
 * "Continuar com Google" no login e no cadastro: sem formulário nem e-mail de
 * confirmação (o Google já verifica o e-mail). Some sem o Google configurado.
 */
export default function GoogleSignInButton({ label = 'Continuar com Google' }: GoogleSignInButtonProps) {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(searchParams.get('error') === 'google');

  if (!isGoogleAuthEnabled()) return null;

  const start = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const url = await googleSignInUrl(window.location.origin);
      if (!url) throw new Error('google_unavailable');
      window.location.assign(url);
    } catch {
      setFailed(true);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => void start()}
        disabled={loading}
        className="font-poppins flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-(--quaternary-color)/25 bg-(--seventh-color) text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" aria-hidden /> : <FaGoogle aria-hidden />}
        {label}
      </button>
      {failed && (
        <p role="alert" className="font-work-sans text-center text-sm text-(--negative)">
          Não deu para entrar com o Google. Tente de novo ou use e-mail e senha.
        </p>
      )}
      <div className="flex items-center gap-2" aria-hidden>
        <div className="h-px flex-1 bg-(--quaternary-color)/20" />
        <span className="font-work-sans text-xs text-(--text-tertiary)">ou com e-mail</span>
        <div className="h-px flex-1 bg-(--quaternary-color)/20" />
      </div>
    </div>
  );
}
