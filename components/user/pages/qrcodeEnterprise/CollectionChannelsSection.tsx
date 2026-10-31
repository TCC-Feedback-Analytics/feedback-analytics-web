import { FaCheck, FaCircleCheck, FaCirclePause, FaCopy, FaDownload, FaLink, FaLock, FaPlay, FaQrcode, FaShareNodes, FaTowerBroadcast } from 'react-icons/fa6';
import HelpHint from 'components/user/shared/HelpHint';
import NfcTagCard from './NfcTagCard';
import type { CollectionChannelsSectionProps } from './ui.types';

const actionClass =
  'btn-ghost font-poppins inline-flex min-h-11 w-full items-center justify-center gap-1.5 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto';

const cardClass = 'rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4 sm:p-5';

const iconClass = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)';

const QR_STEPS = [
  'Baixe o QR Code e imprima.',
  'Coloque em mesas, balcões, recepção ou embalagens.',
];

const QR_TIPS = [
  { title: 'Tamanho adequado', text: 'Imprima com pelo menos 3 × 3 cm para facilitar a leitura.' },
  { title: 'Incentive o uso', text: 'Uma frase como "Sua opinião é importante! Escaneie e nos conte".' },
];

/**
 * "Canais de coleta": por onde o cliente chega às perguntas de uma avaliação
 * (empresa ou item do catálogo). A coleta liga e desliga todos os canais de uma
 * vez, então o interruptor fica no topo; embaixo, um card por canal (QR Code,
 * link e etiqueta NFC). Cada canal leva a sua marca na URL, para as métricas por canal.
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
  nfcUrl,
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

      <div className={`relative ${cardClass}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-(--text-primary)">Coleta de respostas</h3>
            <p className="text-xs text-(--text-secondary)">Com a coleta pausada, nenhum canal recebe respostas.</p>
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
              className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${qrActive ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15' : 'bg-(--primary-color) text-(--on-primary) hover:bg-(--secondary-color)'}`}
            >
              {qrActive ? <FaCirclePause aria-hidden /> : <FaPlay aria-hidden />}{' '}
              {qrLoading ? 'Atualizando…' : qrActive ? 'Pausar coleta' : 'Ativar coleta'}
            </button>
          </div>
        </div>
        {qrError && <p className="mt-2 text-xs text-rose-300">{qrError}</p>}

        {qrLoading && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-(--bg-primary)/30 backdrop-blur-[1px]" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={cardClass} data-testid="qr-channel-card">
          <div className="flex items-start gap-3">
            <div className={iconClass}>
              <FaQrcode aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-(--text-primary)">QR Code</h3>
              <p className="text-xs text-(--text-secondary)">Impresso no local: o cliente aponta a câmera e o formulário abre.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex justify-center sm:block">
              {qrActive ? (
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code para feedback - ${displayName || 'Empresa'}`}
                    className="h-32 w-32"
                    decoding="async"
                  />
                </div>
              ) : (
                <div className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) p-3 text-center">
                  <FaLock className="text-lg text-(--text-tertiary)" aria-hidden />
                  <p className="text-xs text-(--text-tertiary)">Ative a coleta para mostrar o QR Code.</p>
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <button type="button" onClick={onDownload} disabled={!qrActive} className={actionClass}>
                <FaDownload aria-hidden /> Baixar QR Code
              </button>
              <ol className="space-y-1.5 text-xs text-(--text-secondary)">
                {QR_STEPS.map((step, index) => (
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
                  {QR_TIPS.map((tip) => (
                    <li key={tip.title}>
                      <span className="font-semibold text-(--text-primary)">{tip.title}:</span> {tip.text}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>

        <div className={cardClass} data-testid="link-channel-card">
          <div className="flex items-start gap-3">
            <div className={iconClass}>
              <FaLink aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-(--text-primary)">Link</h3>
              <p className="text-xs text-(--text-secondary)">À distância: mande por WhatsApp, e-mail ou redes sociais.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-1 inline-flex items-center gap-1 text-xs text-(--text-tertiary)">
                Link do formulário <HelpHint topic="formLink" />
              </p>
              <p className="truncate rounded-lg border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-1.5 font-mono text-xs text-(--text-secondary)" title={feedbackUrl}>
                {feedbackUrl}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={onCopyLink} className={actionClass}>
                {showCopied ? <FaCheck aria-hidden /> : <FaCopy aria-hidden />} {showCopied ? 'Link copiado!' : 'Copiar link'}
              </button>
              <button type="button" onClick={onShare} className={actionClass}>
                <FaShareNodes aria-hidden /> Compartilhar
              </button>
            </div>

            {!qrActive && <p className="text-xs text-(--text-tertiary)">Ative a coleta para o link receber respostas.</p>}
          </div>
        </div>
      </div>

      {nfcUrl && <NfcTagCard nfcUrl={nfcUrl} qrActive={qrActive} />}
    </section>
  );
}
