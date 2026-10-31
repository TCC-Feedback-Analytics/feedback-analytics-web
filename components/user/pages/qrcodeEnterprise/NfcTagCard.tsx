import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaCircleExclamation, FaCopy, FaNfcSymbol, FaSpinner } from 'react-icons/fa6';
import type { NfcTagCardProps, NfcWriteState } from './ui.types';

const actionClass =
  'btn-ghost font-poppins inline-flex min-h-11 w-full items-center justify-center gap-1.5 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto';

const IPHONE_STEPS = [
  'Instale um app gravador de NFC gratuito (por exemplo, NFC Tools).',
  'No app, escolha gravar, adicione um registro do tipo URL e cole o endereço.',
  'Encoste a etiqueta na parte de trás do celular para gravar.',
];

/** Mensagem clara para cada falha da gravação (Web NFC devolve o nome do erro). */
function writeErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') return 'O celular não deu permissão para usar o NFC. Libere a permissão do site e tente de novo.';
  if (name === 'NotSupportedError') return 'Este celular não consegue gravar etiquetas NFC pelo navegador.';
  if (name === 'NotReadableError') return 'O NFC do celular está desligado. Ligue nas configurações e tente de novo.';
  if (name === 'NetworkError') return 'A etiqueta saiu de perto antes de terminar ou não tem espaço. Use uma NTAG215 e mantenha encostada.';
  return 'Não deu para gravar a etiqueta. Tente de novo.';
}

/**
 * Card "Etiqueta NFC" dos Canais de coleta: o cliente encosta o celular e abre o
 * mesmo formulário, marcado como canal NFC. Gravar pelo navegador só existe no
 * Chrome do Android (Web NFC); fora dele, o card dá o endereço e os passos pelo app.
 */
export default function NfcTagCard({ nfcUrl, qrActive }: NfcTagCardProps) {
  const canWrite = typeof window !== 'undefined' && 'NDEFReader' in window;
  const [state, setState] = useState<NfcWriteState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const write = async () => {
    if (!window.NDEFReader) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setErrorMessage(null);
    setState('writing');
    try {
      const reader = new window.NDEFReader();
      await reader.write({ records: [{ recordType: 'url', data: nfcUrl }] }, { signal: controller.signal });
      setState('done');
    } catch (error) {
      if (controller.signal.aborted) {
        setState('idle');
        return;
      }
      setErrorMessage(writeErrorMessage(error));
      setState('error');
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(nfcUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage('Não deu para copiar. Selecione o endereço e copie manualmente.');
    }
  };

  return (
    <div className="rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4 sm:p-5" data-testid="nfc-tag-card">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)">
          <FaNfcSymbol aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-(--text-primary)">Etiqueta NFC</h3>
          <p className="text-xs text-(--text-secondary)">
            O cliente encosta o celular na etiqueta e o formulário abre. Funciona no iPhone e no Android.
          </p>
        </div>
      </div>

      {!qrActive && (
        <p className="mt-3 text-xs text-(--text-tertiary)">A etiqueta usa a mesma coleta do QR Code: ative a coleta para ela funcionar.</p>
      )}

      <div className="mt-4 space-y-3">
        {canWrite ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {state === 'writing' ? (
              <>
                <p role="status" className="inline-flex items-center gap-2 text-sm text-(--text-secondary)">
                  <FaSpinner aria-hidden className="animate-spin text-(--primary-color)" /> Aproxime a etiqueta da parte de trás do celular…
                </p>
                <button type="button" onClick={() => abortRef.current?.abort()} className={actionClass}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void write()}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-(--primary-color) px-3 py-2 text-xs font-semibold text-(--on-primary) transition hover:bg-(--secondary-color) sm:w-auto"
                >
                  <FaNfcSymbol aria-hidden /> {state === 'done' ? 'Gravar outra etiqueta' : 'Gravar etiqueta'}
                </button>
                {state === 'done' && (
                  <p role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--positive)">
                    <FaCheck aria-hidden /> Etiqueta gravada. Encoste um celular para testar.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-(--text-secondary)">
              Para gravar com um toque, abra esta tela no <strong className="text-(--text-primary)">Chrome de um celular Android</strong>. Sem ele, grave pelo app com o endereço abaixo.
            </p>
            <button type="button" onClick={() => void copyAddress()} className={actionClass}>
              {copied ? <FaCheck aria-hidden /> : <FaCopy aria-hidden />} {copied ? 'Endereço copiado!' : 'Copiar endereço da etiqueta'}
            </button>
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold text-(--primary-color) hover:text-(--secondary-color)">Como gravar pelo iPhone</summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-(--text-secondary)">
                {IPHONE_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
          </div>
        )}

        {errorMessage && (
          <p role="alert" className="inline-flex items-start gap-1.5 text-xs text-(--negative)">
            <FaCircleExclamation aria-hidden className="mt-0.5 shrink-0" /> {errorMessage}
          </p>
        )}

        <p className="text-[11px] text-(--text-tertiary)">
          Use etiquetas <strong>NTAG215</strong>. Depois de testar, trave a etiqueta pelo app para ninguém regravar (não dá para desfazer).
        </p>
      </div>
    </div>
  );
}
