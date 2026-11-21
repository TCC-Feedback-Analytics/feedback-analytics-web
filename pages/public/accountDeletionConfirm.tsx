import AuthShell from 'components/public/shared/AuthShell';
import { useState } from 'react';
import { FaCircleCheck, FaSpinner, FaTrashCan, FaTriangleExclamation } from 'react-icons/fa6';
import { Link, useSearchParams } from 'react-router-dom';
import { ServiceConfirmAccountDeletion, type DeletionConfirmResult } from 'src/services/serviceUser';
import { ACCOUNT_DELETION_GRACE_DAYS, formatDeletionDate } from 'src/lib/utils/accountDeletion';

const PRIMARY_BUTTON =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50';

const FAILURE_MESSAGE: Record<Exclude<DeletionConfirmResult['outcome'], 'scheduled'>, string> = {
  invalid_link: 'Este link já foi usado ou venceu. Peça a exclusão de novo no Perfil.',
  not_logged_in:
    'Abra este link no navegador em que você está logado. Se saiu da conta, entre de novo e peça a exclusão outra vez no Perfil.',
  failed: 'Não foi possível confirmar agora. Tente de novo em instantes.',
};

/**
 * Passo 2 de "Excluir minha conta": o link que chega por e-mail. A confirmação é um
 * clique nesta página, e não a simples abertura do link, para que um leitor de
 * e-mail que abre os links sozinho não confirme nada.
 */
export default function AccountDeletionConfirm() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<DeletionConfirmResult | null>(null);

  const confirm = async () => {
    setConfirming(true);
    setResult(await ServiceConfirmAccountDeletion(token));
    setConfirming(false);
  };

  if (result?.outcome === 'scheduled') {
    return (
      <AuthShell
        icon={<FaCircleCheck className="h-4 w-4" aria-hidden />}
        title="Exclusão agendada"
        description={`Sua conta será excluída em ${formatDeletionDate(result.scheduledFor)}.`}
        eyebrow="CONTA PARADA"
      >
        <div role="status" className="space-y-4 text-sm text-(--text-secondary)">
          <p>
            Até lá, a conta fica parada: o painel fecha e os QR Codes, links e etiquetas NFC não recebem respostas.
            Por segurança, saímos da conta em todos os aparelhos.
          </p>
          <p>Mudou de ideia? Entre na conta antes dessa data e escolha "Cancelar exclusão".</p>
          <Link to="/" className={`${PRIMARY_BUTTON} bg-(--primary-color) text-(--on-primary)`}>
            Ir para o início
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon={<FaTriangleExclamation className="h-4 w-4" aria-hidden />}
      title="Confirmar a exclusão da conta"
      description={`A conta fica parada por ${ACCOUNT_DELETION_GRACE_DAYS} dias e depois é apagada, com a empresa e todos os feedbacks.`}
      eyebrow="EXCLUIR MINHA CONTA"
    >
      <div className="flex flex-col gap-4 text-sm text-(--text-secondary)">
        <p>Nesse prazo, você pode desistir entrando de novo na conta.</p>
        {!token && <p role="alert" className="text-(--negative)">{FAILURE_MESSAGE.invalid_link}</p>}
        {result && <p role="alert" className="text-(--negative)">{FAILURE_MESSAGE[result.outcome]}</p>}
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={!token || confirming}
          aria-busy={confirming}
          className={`${PRIMARY_BUTTON} bg-(--negative) text-white`}
        >
          {confirming ? <FaSpinner aria-hidden className="animate-spin" /> : <FaTrashCan aria-hidden />}
          {confirming ? 'Confirmando…' : 'Confirmar a exclusão'}
        </button>
        <Link to="/user/dashboard" className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-(--primary-color) hover:opacity-80">
          Não quero excluir
        </Link>
      </div>
    </AuthShell>
  );
}
