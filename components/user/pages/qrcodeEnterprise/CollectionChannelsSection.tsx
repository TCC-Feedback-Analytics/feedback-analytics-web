import { FaCircleCheck, FaCirclePause, FaPlay, FaQrcode, FaTowerBroadcast } from 'react-icons/fa6';
import SectionQrInstructions from './SectionQrInstructions';
import SectionQrCodeDisplay from './SectionQrCodeDisplay';
import SectionQrUsageTips from './SectionQrUsageTips';
import type { CollectionChannelsSectionProps } from './ui.types';

/**
 * "Canais de coleta": por onde o cliente chega às perguntas de uma avaliação
 * (empresa ou item do catálogo). O que é avaliado e o que se pergunta ficam na
 * página; aqui fica só o caminho até o formulário. Hoje o canal é o QR Code, com
 * o link direto; o NFC entra depois como mais um card nesta seção.
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
    <section aria-labelledby="collection-channels-title" className="space-y-4">
      <div className="px-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">
          <FaTowerBroadcast aria-hidden /> Canais de coleta
        </div>
        <h2 id="collection-channels-title" className="mt-2 font-montserrat text-xl font-bold text-(--text-primary)">
          Por onde seus clientes respondem
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Os canais levam às perguntas {ofTarget}. Todas as respostas entram nas mesmas métricas, seja qual for o canal.
        </p>
      </div>

      <div className="rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)">
              <FaQrcode aria-hidden />
            </div>
            <div>
              <h3 className="font-semibold text-(--text-primary)">QR Code e link</h3>
              <p className="mt-0.5 text-sm text-(--text-secondary)">
                Imprima o QR Code ou envie o link direto. Com o canal pausado, ninguém consegue responder.
              </p>
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
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${qrActive ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15' : 'bg-(--primary-color) text-white hover:bg-(--secondary-color)'}`}
            >
              {qrActive ? <FaCirclePause aria-hidden /> : <FaPlay aria-hidden />}{' '}
              {qrLoading ? 'Atualizando…' : qrActive ? 'Pausar coleta' : 'Ativar coleta'}
            </button>
          </div>
        </div>
        {qrError && <p className="mt-3 text-xs text-rose-300">{qrError}</p>}
      </div>

      <SectionQrInstructions />

      <div id="share-options" className="relative scroll-mt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SectionQrCodeDisplay
            enterpriseName={displayName}
            qrActive={qrActive}
            qrCodeUrl={qrCodeUrl}
            feedbackUrl={feedbackUrl}
            showCopied={showCopied}
            onDownload={onDownload}
            onCopyLink={onCopyLink}
            onShare={onShare}
          />
          <SectionQrUsageTips />
        </div>

        {qrLoading && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/40 backdrop-blur-[1px]" />
        )}
      </div>
    </section>
  );
}
