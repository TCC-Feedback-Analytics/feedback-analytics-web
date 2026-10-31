import { useEffect, useRef, useState } from 'react';
import { FaArrowUpRightFromSquare, FaCircleCheck } from 'react-icons/fa6';
import { Dialog, DialogContent } from 'components/ui/dialog';
import { embeddedFormUrl, readEmbeddedFormResult, type EmbeddedFormResult } from 'src/lib/utils/embeddedForm';
import { withChannel } from 'src/lib/utils/feedbackFormUrl';
import type { TestFormDialogProps } from './ui.types';

/** Depois de enviar, a janela mostra o "Pronto" por alguns segundos e fecha. */
const CLOSE_AFTER_SENT_MS = 3500;

/**
 * "Testar o formulário": o formulário real do cliente, por cima do Dashboard. Ao
 * enviar, avisa o Dashboard (que se atualiza) e fecha, sem trocar de aba.
 */
export default function TestFormDialog({ open, onOpenChange, feedbackUrl, onResult }: TestFormDialogProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [result, setResult] = useState<EmbeddedFormResult | null>(null);
  // O teste do dono conta como feedback, mas não aparece como canal de coleta.
  const testUrl = withChannel(feedbackUrl, 'TEST');

  useEffect(() => {
    if (!open) {
      setResult(null);
      return;
    }
    const onMessage = (event: MessageEvent) => {
      const received = readEmbeddedFormResult(event, frameRef.current?.contentWindow);
      if (!received) return;
      setResult(received);
      onResult(received);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [open, onResult]);

  useEffect(() => {
    if (result !== 'sent') return;
    const id = setTimeout(() => onOpenChange(false), CLOSE_AFTER_SENT_MS);
    return () => clearTimeout(id);
  }, [result, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94dvh] max-w-xl sm:h-[88vh]">
        <header className="font-work-sans border-b border-(--quaternary-color)/12 px-5 py-4 pr-16">
          <h2 className="font-montserrat text-base font-semibold text-(--text-primary)">Testar o formulário</h2>
          <p className="text-xs text-(--text-secondary)">
            É o mesmo formulário que seus clientes veem. Sua resposta fica marcada como teste e não entra nas métricas.
          </p>
        </header>

        {result ? (
          <div role="status" className="font-work-sans flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <FaCircleCheck aria-hidden className="text-4xl text-(--positive)" />
            <p className="font-montserrat text-lg font-semibold text-(--text-primary)">
              {result === 'sent' ? 'Pronto! Seu teste chegou.' : 'Você já respondeu por este aparelho.'}
            </p>
            <p className="text-sm text-(--text-secondary)">
              {result === 'sent'
                ? 'Ele aparece na lista de feedbacks com a marca "Teste". Agora é com os seus clientes.'
                : 'O formulário aceita uma resposta por aparelho, como acontece com seus clientes.'}
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-2 rounded-lg bg-(--primary-color) px-4 py-2 text-sm font-semibold text-(--on-primary) transition-opacity hover:opacity-90"
            >
              Voltar ao painel
            </button>
          </div>
        ) : (
          <iframe
            ref={frameRef}
            title="Formulário do cliente"
            src={embeddedFormUrl(testUrl)}
            className="min-h-0 w-full flex-1 border-0 bg-(--bg-primary)"
          />
        )}

        <footer className="font-work-sans border-t border-(--quaternary-color)/12 px-5 py-3 text-right">
          <a
            href={testUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text-primary)"
          >
            <FaArrowUpRightFromSquare aria-hidden /> Abrir em outra aba
          </a>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
