import { useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { FaCommentDots, FaShieldHalved } from 'react-icons/fa6';
import { getItemKindLabel } from 'src/lib/utils/publicQrFeedbackForm';
import { resolvePublicQrFeedbackScope } from 'src/lib/utils/publicQrFeedbackTemplateEngine';
import StateSentPreviousFeedback from 'components/public/qrcode/enterprise/stateSentPreviousFeedback';
import StateError from 'components/public/qrcode/enterprise/stateError';
import StateSubmitted from 'components/public/qrcode/enterprise/stateSubmitted';
import PublicQrFeedbackTemplateRenderer from 'components/public/qrcode/enterprise/PublicQrFeedbackTemplateRenderer';
import type { LoaderPublicQrCodeEnterprise } from 'src/routes/loaders/loaderPublicQrCodeEnterprise';
import { useQrCodeFeedbackController } from './useQrCodeFeedbackController';
import { isEmbeddedForm, notifyEmbeddedFormResult } from 'src/lib/utils/embeddedForm';

export default function FeedbackQRCodeEnterprise() {
  const loaderData =
    useLoaderData<Awaited<ReturnType<typeof LoaderPublicQrCodeEnterprise>>>();

  const enterpriseId = loaderData?.enterpriseId ?? '';
  const collectionPointId = loaderData?.collectionPointId ?? '';
  const catalogItemId = loaderData?.catalogItemId ?? '';
  const initialError = loaderData?.error ?? '';
  const enterpriseName = loaderData?.enterpriseName ?? '';
  const itemName = loaderData?.itemName ?? '';
  const itemKind = loaderData?.itemKind ?? null;
  const commentField = loaderData?.commentField;
  const channel = loaderData?.channel ?? null;
  const questions = useMemo(
    () => loaderData?.questions ?? [],
    [loaderData?.questions],
  );
  const feedbackScope = useMemo(
    () =>
      resolvePublicQrFeedbackScope({
        itemKind,
        questions,
      }),
    [itemKind, questions],
  );

  const itemKindLabel = getItemKindLabel(itemKind);
  const feedbackContext = itemName && itemKindLabel
    ? enterpriseName
      ? `${enterpriseName} · ${itemKindLabel}: ${itemName}`
      : `${itemKindLabel}: ${itemName}`
    : enterpriseName;

  const {
    formModel,
    isSubmitted,
    hasAlreadySubmitted,
  } = useQrCodeFeedbackController({
    enterpriseId,
    collectionPointId,
    catalogItemId,
    initialError,
    questions,
    commentField,
    channel,
  });

  // Aberto dentro do Dashboard: avisa a tela de cima para ela se atualizar e fechar.
  useEffect(() => {
    if (!isEmbeddedForm()) return;
    if (isSubmitted) notifyEmbeddedFormResult('sent');
    else if (hasAlreadySubmitted) notifyEmbeddedFormResult('already');
  }, [isSubmitted, hasAlreadySubmitted]);

  // Estado quando já enviou feedback anteriormente
  if (hasAlreadySubmitted) {
    return <StateSentPreviousFeedback enterpriseName={enterpriseName} />;
  }

  // Error state
  if (formModel.state.error && !formModel.state.formData.enterprise_id) {
    return <StateError error={formModel.state.error} />;
  }

  if (isSubmitted) {
    return <StateSubmitted enterpriseName={enterpriseName} />;
  }

  return (
    <div className="feedback-form-experience min-h-[100dvh] bg-(--bg-primary) px-4 py-5 font-work-sans text-(--text-primary) sm:px-6 sm:py-8">
      <main className="mx-auto w-full max-w-xl">
        <header className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-(--primary-color) text-(--on-primary)">
              <FaCommentDots className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="truncate font-montserrat text-[15px] font-bold tracking-tight">Feedback Analytics</span>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--primary-color)/20 bg-(--primary-color)/10 text-(--primary-color)" title="Formulário seguro">
            <FaShieldHalved className="h-[18px] w-[18px]" aria-hidden />
            <span className="sr-only">Formulário seguro</span>
          </span>
        </header>

        <section className="mb-6 space-y-2 sm:mb-7">
          <h1 className="font-montserrat text-[28px] font-bold tracking-[-0.035em] text-(--text-primary)">
            Sua opinião importa
          </h1>
          <p className="max-w-md text-sm leading-6 text-(--text-secondary)">
            Leva menos de 2 minutos. Suas respostas nos ajudam a criar uma experiência melhor.
          </p>
          {feedbackContext && (
            <p className="pt-1 text-xs font-medium text-(--primary-color)">{feedbackContext}</p>
          )}
        </section>

        <PublicQrFeedbackTemplateRenderer
          scope={feedbackScope}
          model={formModel}
        />
      </main>
    </div>
  );
}
