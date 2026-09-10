import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFetcher, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'src/lib/utils/qrcode';
import { useToast } from 'components/public/forms/messages/useToast';
import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';
import type { LoaderFeedbackGeneral } from 'src/routes/loaders/loaderFeedbackGeneral';
import { INTENT_QR_DISABLE, INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';
import PageHeader from 'components/user/shared/PageHeader';
import QuestionDinamicEnterprise from 'components/user/pages/profile/questionsDinamic/questionDinamicEnterprise';
import SectionQrInstructions from 'components/user/pages/qrcodeEnterprise/SectionQrInstructions';
import SectionQrCodeDisplay from 'components/user/pages/qrcodeEnterprise/SectionQrCodeDisplay';
import SectionQrUsageTips from 'components/user/pages/qrcodeEnterprise/SectionQrUsageTips';
import type { QrCodeEnterpriseActionResponse } from 'pages/user/qrcodes/ui.types';
import { FaArrowRight, FaChartLine, FaCircleCheck, FaCirclePause, FaLink, FaPenToSquare, FaPlay, FaQrcode } from 'react-icons/fa6';

export default function EditFeedbackGeneral() {
  const { enterprise } = useRouteLoaderData('user') as {
    enterprise: EnterpriseContext;
  };
  const { qrActive: initialQrActive, qrError: initialQrError } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbackGeneral>>>();
  const qrFetcher = useFetcher<QrCodeEnterpriseActionResponse>();
  const toast = useToast();

  const [showCopied, setShowCopied] = useState(false);
  const [qrActive, setQrActive] = useState<boolean>(initialQrActive ?? false);
  const [qrError, setQrError] = useState<string | null>(initialQrError ?? null);

  const qrLoading = qrFetcher.state !== 'idle';

  useEffect(() => {
    const actionResult = qrFetcher.data;
    if (!actionResult) return;

    if (actionResult.error) {
      setQrError(actionResult.error);
      toast.error('Erro na operação', actionResult.error);
      return;
    }

    if (actionResult.ok && typeof actionResult.active === 'boolean') {
      setQrError(null);
      setQrActive(actionResult.active);
      toast.success(
        actionResult.active ? 'QR Code ativado!' : 'QR Code desativado!',
        actionResult.active
          ? 'Agora os clientes podem enviar feedback'
          : 'Coleta de feedback pausada',
      );
    }
  }, [qrFetcher.data, toast]);

  const feedbackUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterprise.id}`;
  }, [enterprise.id]);

  const qrCodeUrl = useMemo(
    () => getQrCodeUrl(feedbackUrl, { size: 300, format: 'png' }),
    [feedbackUrl],
  );

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-feedback-${(enterprise.full_name || 'empresa')
        .toLowerCase()
        .replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code baixado!', 'Download iniciado automaticamente');
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      toast.error('Erro no download', 'Não foi possível baixar o QR Code');
    }
  }, [enterprise.full_name, qrCodeUrl, toast]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  }, [feedbackUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deixe seu Feedback - ${enterprise.full_name || 'Nossa Empresa'}`,
          text: 'Compartilhe sua experiência conosco! Acesse o formulário de feedback.',
          url: feedbackUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      handleCopyLink();
    }
  }, [enterprise.full_name, feedbackUrl, handleCopyLink]);

  const handleToggleQr = useCallback(() => {
    setQrError(null);
    qrFetcher.submit(
      { intent: qrActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE },
      { method: 'post' },
    );
  }, [qrActive, qrFetcher]);

  const handleScrollToSharing = useCallback(() => {
    document.getElementById('share-options')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="font-work-sans space-y-8 pb-8">
      <PageHeader />

      <section className="rounded-3xl border border-(--primary-color)/18 bg-linear-to-br from-(--primary-color)/10 via-(--bg-secondary) to-(--sixth-color) p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-(--primary-color)/20 bg-(--bg-primary)/40 px-3 py-1 text-xs font-semibold text-(--primary-color)">
              <FaPenToSquare aria-hidden /> Configuração guiada
            </div>
            <h2 className="font-montserrat text-2xl font-bold tracking-tight text-(--text-primary) sm:text-3xl">Monte um feedback que faça sentido para sua operação</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/55 px-4 py-3 text-sm text-(--text-secondary)">
            <FaCircleCheck className="text-(--primary-color)" aria-hidden /> 3 perguntas essenciais
          </div>
        </div>
        <div className="mt-8">
          <QuestionDinamicEnterprise />
        </div>
      </section>

      <section className="space-y-4">
        <div className="px-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)"><FaQrcode aria-hidden /> Publicação e distribuição</div>
          <h2 className="mt-2 font-montserrat text-xl font-bold text-(--text-primary)">Leve o formulário até seus clientes</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)"><FaQrcode aria-hidden /></div>
            <h3 className="font-semibold text-(--text-primary)">1. Disponibilidade</h3>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/45 px-3 py-2.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${qrActive ? 'text-emerald-300' : 'text-(--text-tertiary)'}`}>{qrActive ? <FaCircleCheck aria-hidden /> : <FaCirclePause aria-hidden />} {qrLoading ? 'Atualizando…' : qrActive ? 'Recebendo respostas' : 'Pausado'}</span>
              <button type="button" onClick={handleToggleQr} disabled={qrLoading} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${qrActive ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15' : 'bg-(--primary-color) text-white hover:bg-(--secondary-color)'}`}>{qrActive ? <FaCirclePause aria-hidden /> : <FaPlay aria-hidden />} {qrLoading ? 'Atualizando…' : qrActive ? 'Pausar coleta' : 'Ativar coleta'}</button>
            </div>
            {qrError && <p className="mt-2 text-xs text-rose-300">{qrError}</p>}
          </div>
          <div className="rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)"><FaLink aria-hidden /></div>
            <h3 className="font-semibold text-(--text-primary)">2. Compartilhe</h3>
            <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">Use o QR Code ou o link direto nos pontos de contato da sua empresa.</p>
            <button type="button" onClick={handleScrollToSharing} className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-(--primary-color) transition hover:text-(--secondary-color)">Ver opções de compartilhamento <FaArrowRight className="text-xs" aria-hidden /></button>
          </div>
          <div className="rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)"><FaChartLine aria-hidden /></div>
            <h3 className="font-semibold text-(--text-primary)">3. Acompanhe</h3>
          </div>
        </div>
      </section>

      <SectionQrInstructions />

      <div id="share-options" className="relative scroll-mt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SectionQrCodeDisplay
            enterpriseName={enterprise.full_name}
            qrActive={qrActive}
            qrCodeUrl={qrCodeUrl}
            feedbackUrl={feedbackUrl}
            showCopied={showCopied}
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            onShare={handleShare}
          />
          <SectionQrUsageTips />
        </div>

        {qrLoading && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/40 backdrop-blur-[1px]" />
        )}
      </div>
    </div>
  );
}
