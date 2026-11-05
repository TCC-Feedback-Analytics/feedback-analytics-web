import { useState } from 'react';
import { FaCircleCheck, FaSpinner, FaTrashCan, FaTriangleExclamation } from 'react-icons/fa6';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { ServiceAccountHasPassword, ServiceDeleteAccount } from 'src/services/serviceUser';
import type { DeleteAccountStep } from './ui.types';

/** O que a pessoa digita para liberar o botão: evita excluir por um clique distraído. */
export const DELETE_CONFIRMATION_WORD = 'EXCLUIR';

const WHAT_GOES = [
  'sua conta e o seu acesso;',
  'a empresa, o catálogo, as perguntas e os QR Codes;',
  'todos os feedbacks recebidos e as análises da IA;',
  'a chave de IA e as configurações.',
];

const OUTCOME_MESSAGE = {
  wrong_password: 'Senha incorreta. Confira e tente de novo.',
  login_again: 'Por segurança, saia, entre de novo e volte aqui para excluir a conta.',
  failed: 'Não foi possível excluir a conta agora. Tente de novo em instantes.',
  no_password: 'Não foi possível excluir a conta agora. Tente de novo em instantes.',
} as const;

/**
 * "Excluir minha conta" no Perfil (etapa 07, LGPD art. 18): apaga a conta, a
 * empresa e tudo dela, sem volta. Pede a senha a quem tem uma e a palavra
 * EXCLUIR para liberar o botão. Quem só entra pelo Google não tem senha: o
 * gateway aceita se a entrada foi recente e, senão, pede para entrar de novo.
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

  // Sem saber se há senha, pede: o gateway recusa a errada e aceita a certa.
  const needsPassword = hasPassword !== false;
  const canDelete =
    confirmation.trim().toUpperCase() === DELETE_CONFIRMATION_WORD && (!needsPassword || password.length > 0) && step !== 'deleting';

  const deleteAccount = async () => {
    setError(null);
    setStep('deleting');
    let outcome = await ServiceDeleteAccount(needsPassword ? password : undefined);
    // Sem saber se havia senha, ela foi junto; a conta não tem: repete sem senha.
    if (outcome === 'no_password') {
      setHasPassword(false);
      outcome = await ServiceDeleteAccount();
    }
    if (outcome === 'deleted') {
      setStep('deleted');
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
              Apaga a conta, a empresa e todos os feedbacks. Não dá para desfazer.
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

      <Dialog open={open} onOpenChange={(next) => step !== 'deleting' && step !== 'deleted' && setOpen(next)}>
        <DialogContent className="max-w-lg" showClose={step === 'confirm'}>
          {step === 'deleted' ? (
            <div role="status" className="flex flex-col items-center gap-3 p-8 text-center">
              <FaCircleCheck aria-hidden className="text-4xl text-(--positive)" />
              <p className="font-montserrat text-lg font-semibold text-(--text-primary)">Sua conta foi excluída.</p>
              <p className="text-sm text-(--text-secondary)">Apagamos a conta, a empresa e todos os dados dela.</p>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="mt-2 rounded-lg bg-(--primary-color) px-4 py-2 text-sm font-semibold text-(--on-primary) transition-opacity hover:opacity-90"
              >
                Ir para o início
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Excluir minha conta</DialogTitle>
                <DialogDescription>Isso apaga tudo para sempre. Não há como recuperar depois.</DialogDescription>
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
                  disabled={step === 'deleting'}
                  className="btn-ghost font-poppins min-h-11 px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void deleteAccount()}
                  disabled={!canDelete}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--negative) px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === 'deleting' ? <FaSpinner aria-hidden className="animate-spin" /> : <FaTrashCan aria-hidden />}
                  {step === 'deleting' ? 'Excluindo…' : 'Excluir para sempre'}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
