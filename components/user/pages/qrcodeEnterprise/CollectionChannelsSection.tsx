import { FaCheck, FaCircleCheck, FaCirclePause, FaCopy, FaDownload, FaLock, FaPlay, FaQrcode, FaShareNodes, FaTowerBroadcast } from 'react-icons/fa6';
import HelpHint from 'components/user/shared/HelpHint';
import type { CollectionChannelsSectionProps } from './ui.types';

const actionClass =
  'btn-ghost font-poppins inline-flex items-center gap-1.5 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50';

const STEPS = [
  'Baixe o QR Code ou copie o link.',
  'Coloque em mesas, balcões e embalagens, ou envie por mensagem.',
  'Acompanhe as respostas no Dashboard.',
];

const TIPS = [
  { title: 'Locais estratégicos', text: 'Mesas, balcões, recepção ou áreas de espera.' },
  { title: 'Tamanho adequado', text: 'Imprima com pelo menos 3 × 3 cm para facilitar a leitura.' },
  { title: 'Incentive o uso', text: 'Uma frase como "Sua opinião é importante! Escaneie e nos conte".' },
];

/**
 * "Canais de coleta": por onde o cliente chega às perguntas de uma avaliação
 * (empresa ou item do catálogo). Um card compacto por canal, para caber numa tela
 * só: hoje o QR Code com o link (status, QR, ações, passos e dicas recolhidas); o
 * NFC entra depois como mais um card nesta seção.
 */
export default function CollectionChannelsSection({
  ofTarget,
  displayName,
  qrActive,
  qrLoading,
  qrError,
  onToggleQr,
  qrCodeUrl,
  feedbackUrl,
  showCopied,
  onDownload,
  onCopyLink,
  onShare,
}: CollectionChannelsSectionProps) {
  return (
    <section aria-labelledby="collection-channels-title" className="space-y-3">
      <div className="px-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">
          <FaTowerBroadcast aria-hidden /> Canais de coleta
        </div>
        <h2 id="collection-channels-title" className="mt-1 font-montserrat text-xl font-bold text-(--text-primary)">
          Por onde seus clientes respondem
        </h2>
        <p className="mt-0.5 text-sm text-(--text-secondary)">
          Os canais levam às perguntas {ofTarget}. Todas as respostas entram nas mesmas métricas, seja qual for o canal.
        </p>
      </div>

      <div className="relative rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)">
              <FaQrcode aria-hidden />
            </div>
            <div>
              <h3 className="font-semibold text-(--text-primary)">QR Code e link</h3>
              <p className="text-xs text-(--text-secondary)">Com o canal pausado, ninguém consegue responder.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${qrActive ? 'text-emerald-300' : 'text-(--text-tertiary)'}`}>
              {qrActive ? <FaCircleCheck aria-hidden /> : <FaCirclePause aria-hidden />}{' '}
              {qrLoading ? 'Atualizando…' : qrActive ? 'Recebendo respostas' : 'Pausado'}
            </span>
            <button
              type="button"
              onClick={onToggleQr}
              disabled={qrLoading}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${qrActive ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15' : 'bg-(--primary-color) text-(--on-primary) hover:bg-(--secondary-color)'}`}
            >
              {qrActive ? <FaCirclePause aria-hidden /> : <FaPlay aria-hidden />}{' '}
              {qrLoading ? 'Atualizando…' : qrActive ? 'Pausar coleta' : 'Ativar coleta'}
            </button>
          </div>
        </div>
        {qrError && <p className="mt-2 text-xs text-rose-300">{qrError}</p>}

        <div className="mt-4 grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex justify-center md:block">
            {qrActive ? (
              <div className="rounded-xl bg-white p-2 shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code para feedback - ${displayName || 'Empresa'}`}
                  className="h-36 w-36"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) p-3 text-center">
                <FaLock className="text-lg text-(--text-tertiary)" aria-hidden />
                <p className="text-xs text-(--text-tertiary)">Ative a coleta para mostrar o QR Code.</p>
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <p className="mb-1 inline-flex items-center gap-1 text-xs text-(--text-tertiary)">
                Link do formulário <HelpHint topic="formLink" />
              </p>
              <p className="truncate rounded-lg border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-1.5 font-mono text-xs text-(--text-secondary)" title={feedbackUrl}>
                {feedbackUrl}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onDownload} disabled={!qrActive} className={actionClass}>
                <FaDownload aria-hidden /> Baixar QR Code
              </button>
              <button type="button" onClick={onCopyLink} className={actionClass}>
                {showCopied ? <FaCheck aria-hidden /> : <FaCopy aria-hidden />} {showCopied ? 'Link copiado!' : 'Copiar link'}
              </button>
              <button type="button" onClick={onShare} className={actionClass}>
                <FaShareNodes aria-hidden /> Compartilhar
              </button>
            </div>

            <ol className="grid gap-1.5 text-xs text-(--text-secondary) sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-(--primary-color)/12 text-[10px] font-bold text-(--primary-color)">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <details className="group text-xs">
              <summary className="cursor-pointer font-semibold text-(--primary-color) hover:text-(--secondary-color)">Dicas de uso</summary>
              <ul className="mt-2 space-y-1 text-(--text-secondary)">
                {TIPS.map((tip) => (
                  <li key={tip.title}>
                    <span className="font-semibold text-(--text-primary)">{tip.title}:</span> {tip.text}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        {qrLoading && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-(--bg-primary)/30 backdrop-blur-[1px]" />
        )}
      </div>
    </section>
  );
}
