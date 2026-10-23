import { useCallback, useEffect, useState } from 'react';
import { useFetcher, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { useEnterpriseFeedbackLink } from 'src/lib/hooks/useEnterpriseFeedbackLink';
import { useToast } from 'components/public/forms/messages/useToast';
import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';
import type { LoaderFeedbackGeneral } from 'src/routes/loaders/loaderFeedbackGeneral';
import { INTENT_QR_DISABLE, INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';
import PageHeader from 'components/user/shared/PageHeader';
import QuestionDinamicEnterprise from 'components/user/pages/profile/questionsDinamic/questionDinamicEnterprise';
import CollectionChannelsSection from 'components/user/pages/qrcodeEnterprise/CollectionChannelsSection';
import CommentFieldSettings from 'components/user/pages/commentField/CommentFieldSettings';
import type { QrCodeEnterpriseActionResponse } from 'pages/user/qrcodes/ui.types';
import { FaCircleCheck, FaPenToSquare, FaSpinner } from 'react-icons/fa6';
import { useCompanyQuestionsGenerationPhase } from 'src/lib/context/companyQuestionsGenerationContext';

export default function EditFeedbackGeneral() {
  const { enterprise } = useRouteLoaderData('user') as {
    enterprise: EnterpriseContext;
  };
  const { qrActive: initialQrActive, qrError: initialQrError } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbackGeneral>>>();
  const qrFetcher = useFetcher<QrCodeEnterpriseActionResponse>();
  const toast = useToast();
  const isGeneratingQuestions = useCompanyQuestionsGenerationPhase() === 'running';

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

  const {
    feedbackUrl,
    qrCodeUrl,
    showCopied,
    download: handleDownload,
    copyLink: handleCopyLink,
    share: handleShare,
  } = useEnterpriseFeedbackLink(enterprise);

  const handleToggleQr = useCallback(() => {
    setQrError(null);
    qrFetcher.submit(
      { intent: qrActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE },
      { method: 'post' },
    );
  }, [qrActive, qrFetcher]);

  return (
    <div className="font-work-sans space-y-5 pb-8 sm:space-y-6">
      <PageHeader />

      <section className="rounded-3xl border border-(--primary-color)/18 bg-linear-to-br from-(--primary-color)/10 via-(--bg-secondary) to-(--sixth-color) p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-(--primary-color)/20 bg-(--bg-primary)/40 px-3 py-1 text-xs font-semibold text-(--primary-color)">
              <FaPenToSquare aria-hidden /> Perguntas
            </div>
            <h2 className="font-montserrat text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">O que seus clientes respondem ao avaliar a empresa</h2>
            <p className="mt-2 text-sm text-(--text-secondary)">A avaliação da empresa como um todo, sem separar por produto, serviço ou departamento.</p>
          </div>
          <div className="flex w-full shrink-0 items-center gap-2 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/55 px-4 py-3 text-sm text-(--text-secondary) lg:w-auto">
            <FaCircleCheck className="text-(--primary-color)" aria-hidden /> 3 perguntas essenciais
          </div>
        </div>
        {isGeneratingQuestions && (
          <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border border-(--primary-color)/25 bg-(--primary-color)/10 px-4 py-3 text-sm text-(--text-secondary)">
            <FaSpinner className="mt-0.5 shrink-0 animate-spin text-(--primary-color)" aria-hidden />
            <p>A IA está criando suas perguntas personalizadas. Elas aparecem aqui assim que ficarem prontas.</p>
          </div>
        )}
        <div className="mt-8">
          <QuestionDinamicEnterprise />
        </div>
      </section>

      <CommentFieldSettings scopeType="COMPANY" catalogItemId={null} ofTarget="da empresa" />

      <CollectionChannelsSection
        ofTarget="da empresa"
        displayName={enterprise.full_name}
        qrActive={qrActive}
        qrLoading={qrLoading}
        qrError={qrError}
        onToggleQr={handleToggleQr}
        qrCodeUrl={qrCodeUrl}
        feedbackUrl={feedbackUrl}
        showCopied={showCopied}
        onDownload={handleDownload}
        onCopyLink={handleCopyLink}
        onShare={handleShare}
      />
    </div>
  );
}
