import AuthShell from 'components/public/shared/AuthShell';
import { useEffect, useState } from 'react';
import { FaClockRotateLeft, FaSpinner } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { ServiceLogout } from 'src/services/serviceAuth';
import { ServiceCancelAccountDeletion, ServiceGetUser } from 'src/services/serviceUser';
import { formatDeletionDate } from 'src/lib/utils/accountDeletion';

const BUTTON =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Conta com exclusão agendada: depois de entrar, o gestor vê a data e escolhe entre
 * desistir ou sair. Entrar sozinho não cancela, para quem só veio conferir.
 */
export default function AccountDeletionPending() {
  const navigate = useNavigate();
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [busy, setBusy] = useState<'cancel' | 'logout' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ServiceGetUser()
      .then((auth) => {
        if (auth.deletion_scheduled_for) setScheduledFor(auth.deletion_scheduled_for);
        else navigate('/user/dashboard', { replace: true });
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate]);

  const cancel = async () => {
    setError(null);
    setBusy('cancel');
    if (await ServiceCancelAccountDeletion()) {
      navigate('/user/dashboard', { replace: true });
      return;
    }
    setError('Não foi possível cancelar agora. Tente de novo em instantes.');
    setBusy(null);
  };

  const logout = async () => {
    setBusy('logout');
    await ServiceLogout().catch(() => false);
    navigate('/login', { replace: true });
  };

  if (!scheduledFor) {
    return (
      <div role="status" className="flex min-h-[100dvh] items-center justify-center bg-(--bg-primary)">
        <FaSpinner aria-label="Carregando" className="animate-spin text-2xl text-(--primary-color)" />
      </div>
    );
  }

  return (
    <AuthShell
      icon={<FaClockRotateLeft className="h-4 w-4" aria-hidden />}
      title="Sua conta será excluída"
      description={`A exclusão está marcada para ${formatDeletionDate(scheduledFor)}. Até lá, a conta fica parada.`}
      eyebrow="EXCLUSÃO AGENDADA"
    >
      <div className="flex flex-col gap-4 text-sm text-(--text-secondary)">
        <p>
          O painel está fechado e os QR Codes, links e etiquetas NFC não recebem respostas. Se você cancelar, tudo
          volta a funcionar como antes.
        </p>
        {error && <p role="alert" className="text-(--negative)">{error}</p>}
        <button
          type="button"
          onClick={() => void cancel()}
          disabled={busy !== null}
          aria-busy={busy === 'cancel'}
          className={`${BUTTON} bg-(--primary-color) text-(--on-primary)`}
        >
          {busy === 'cancel' && <FaSpinner aria-hidden className="animate-spin" />}
          Cancelar exclusão
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={busy !== null}
          className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-(--text-secondary) hover:opacity-80"
        >
          Sair
        </button>
      </div>
    </AuthShell>
  );
}
