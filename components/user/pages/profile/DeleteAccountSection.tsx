import { useState } from 'react';
import { FaEnvelope, FaSpinner, FaTrashCan, FaTriangleExclamation } from 'react-icons/fa6';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import {
  ServiceAccountHasPassword,
  ServiceRequestAccountDeletion,
  type DeletionRequestOutcome,
} from 'src/services/serviceUser';
import { ACCOUNT_DELETION_GRACE_DAYS } from 'src/lib/utils/accountDeletion';
import type { DeleteAccountStep } from './ui.types';

/** O que a pessoa digita para liberar o botão: evita excluir por um clique distraído. */
export const DELETE_CONFIRMATION_WORD = 'EXCLUIR';

const WHAT_GOES = [
  'sua conta e o seu acesso;',
  'a empresa, o catálogo, as perguntas e os QR Codes;',
  'todos os feedbacks recebidos e as análises da IA;',
  'a chave de IA e as configurações.',
];

const OUTCOME_MESSAGE: Record<Exclude<DeletionRequestOutcome, 'email_sent'>, string> = {
  wrong_password: 'Senha incorreta. Confira e tente de novo.',
  password_required: 'Digite a sua senha para continuar.',
  login_again: 'Por segurança, saia, entre de novo e volte aqui para excluir a conta.',
  rate_limited: 'Muitos pedidos seguidos. Aguarde um pouco e tente de novo.',
  failed: 'Não foi possível enviar o pedido agora. Tente de novo em instantes.',
};

/**
 * "Excluir minha conta" no Perfil (LGPD art. 18), passo 1 de 3: pede a senha a
 * quem tem uma e a palavra EXCLUIR, e o gateway manda um link ao e-mail da conta.
 * Só o clique nesse link começa a exclusão, e a conta ainda fica parada por 15 dias
 * antes de ser apagada. Quem só entra pelo Google não tem senha: o gateway aceita se
 * a entrada foi recente e, senão, pede para entrar de novo.
 */
export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<DeleteAccountStep>('confirm');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openDialog = () => {
    setStep('confirm');
    setPassword('');
    setConfirmation('');
    setError(null);
    setOpen(true);
    void ServiceAccountHasPassword().then(setHasPassword);
  };

  // Sem saber se há senha, pede: o gateway confere a de quem tem e ignora a de quem não tem.
  const needsPassword = hasPassword !== false;
  const canRequest =
    confirmation.trim().toUpperCase() === DELETE_CONFIRMATION_WORD && (!needsPassword || password.length > 0) && step === 'confirm';

  const requestDeletion = async () => {
    setError(null);
    setStep('sending');
    const outcome = await ServiceRequestAccountDeletion(needsPassword ? password : undefined);
    if (outcome === 'email_sent') {
      setStep('sent');
      return;
    }
    setError(OUTCOME_MESSAGE[outcome]);
    setStep('confirm');
  };

  return (
    <section aria-labelledby="excluir-conta-titulo" className="space-y-3">
      <div className="rounded-2xl border border-(--negative)/30 bg-(--negative)/5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="excluir-conta-titulo" className="font-montserrat text-lg font-bold text-(--text-primary)">
              Excluir minha conta
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              A conta fica parada por {ACCOUNT_DELETION_GRACE_DAYS} dias e depois é apagada, com a empresa e todos os feedbacks.
            </p>
          </div>
          <button
            type="button"
            onClick={openDialog}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-(--negative)/40 bg-(--negative)/10 px-4 py-2 text-sm font-semibold text-(--negative) transition hover:bg-(--negative)/15 sm:w-auto"
          >
            <FaTrashCan aria-hidden /> Excluir minha conta
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(next) => step !== 'sending' && setOpen(next)}>
        <DialogContent className="max-w-lg" showClose={step !== 'sending'}>
          {step === 'sent' ? (
            <div role="status" className="flex flex-col items-center gap-3 p-8 text-center">
              <FaEnvelope aria-hidden className="text-4xl text-(--primary-color)" />
              <p className="font-montserrat text-lg font-semibold text-(--text-primary)">Confira o seu e-mail.</p>
              <p className="text-sm text-(--text-secondary)">
                Enviamos um link para confirmar a exclusão. Abra no navegador em que você está logado: ele vale 1 hora.
                Nada foi apagado ainda.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-(--primary-color) px-4 py-2 text-sm font-semibold text-(--on-primary) transition-opacity hover:opacity-90"
              >
                Entendi
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Excluir minha conta</DialogTitle>
                <DialogDescription>
                  Vamos mandar um link para o seu e-mail. A exclusão só começa depois que você clicar nele.
                </DialogDescription>
              </DialogHeader>
              <DialogBody className="space-y-5">
                <div className="flex gap-3 rounded-xl border border-(--negative)/30 bg-(--negative)/10 p-4 text-sm text-(--text-secondary)">
                  <FaTriangleExclamation aria-hidden className="mt-0.5 shrink-0 text-(--negative)" />
                  <div>
                    <p className="font-semibold text-(--text-primary)">Será apagado:</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {WHAT_GOES.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Depois da confirmação, a conta fica parada por {ACCOUNT_DELETION_GRACE_DAYS} dias. Nesse prazo, dá para
                      desistir entrando de novo. Depois, tudo é apagado para sempre.
                    </p>
                  </div>
                </div>

                {needsPassword && (
                  <div className="space-y-1.5">
                    <Label htmlFor="excluir-conta-senha">Sua senha</Label>
                    <Input
                      id="excluir-conta-senha"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="excluir-conta-confirmacao">
                    Para confirmar, digite <strong>{DELETE_CONFIRMATION_WORD}</strong>
                  </Label>
                  <Input
                    id="excluir-conta-confirmacao"
                    autoComplete="off"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-(--negative)">
                    {error}
                  </p>
                )}
              </DialogBody>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={step === 'sending'}
                  className="btn-ghost font-poppins min-h-11 px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void requestDeletion()}
                  disabled={!canRequest}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--negative) px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === 'sending' ? <FaSpinner aria-hidden className="animate-spin" /> : <FaEnvelope aria-hidden />}
                  {step === 'sending' ? 'Enviando…' : 'Enviar link de confirmação'}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
