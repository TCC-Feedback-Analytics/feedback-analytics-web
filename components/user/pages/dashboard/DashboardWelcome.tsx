import { useFetcher } from 'react-router-dom';
import {
  FaArrowUpRightFromSquare,
  FaCheck,
  FaDownload,
  FaLink,
  FaPlay,
  FaShareNodes,
  FaSpinner,
} from 'react-icons/fa6';
import { INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';
import { useEnterpriseFeedbackLink } from 'src/lib/hooks/useEnterpriseFeedbackLink';
import { MIN_FEEDBACKS_FOR_AI } from 'src/lib/utils/feedbackMilestones';
import QrGlyph from './QrGlyph';
import type { DashboardWelcomeProps, WelcomeStepProps } from './ui.types';
import type { QrCodeEnterpriseActionResponse } from 'pages/user/qrcodes/ui.types';

const actionClass =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3 py-1.5 text-xs font-semibold text-(--primary-color) transition-colors hover:bg-(--primary-color)/18';

function WelcomeStep({ number, title, description, note, children }: WelcomeStepProps) {
  return (
    <li className="flex gap-3 rounded-xl border border-(--quaternary-color)/10 bg-(--bg-primary)/45 p-4">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--primary-color)/15 text-xs font-bold text-(--primary-color)">
        {number}
      </span>
      <div className="min-w-0 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-(--text-primary)">{title}</h3>
          <p className="text-xs text-(--text-secondary)">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">{children}</div>
        {note && <p className="text-[11px] text-(--text-tertiary)">{note}</p>}
      </div>
    </li>
  );
}

/**
 * Boas-vindas da conta que ainda não tem nenhum feedback: no lugar de três
 * seções vazias, uma animação "aguardando", os passos para começar a coletar e
 * o progresso até a IA poder analisar os comentários.
 */
export default function DashboardWelcome({ enterprise, qrActive, totalFeedbacks }: DashboardWelcomeProps) {
  const { feedbackUrl, showCopied, download, copyLink, share } = useEnterpriseFeedbackLink(enterprise);
  const collected = Math.min(totalFeedbacks, MIN_FEEDBACKS_FOR_AI);
  const progressPct = Math.round((collected / MIN_FEEDBACKS_FOR_AI) * 100);
  // Ativa o QR geral ali mesmo, pela action da tela Feedback geral. O passo fica
  // na lista como concluído, para os números dos passos seguintes não mudarem.
  const qrFetcher = useFetcher<QrCodeEnterpriseActionResponse>();
  const activating = qrFetcher.state !== 'idle';
  const activatedHere = qrFetcher.data?.ok === true && qrFetcher.data.active === true;
  const activateError = qrFetcher.data?.error ?? null;
  const showActivateStep = qrActive === false || activatedHere;
  const qrInactive = qrActive === false && !activatedHere;
  const firstShareStep = showActivateStep ? 2 : 1;
  const inactiveNote = qrInactive ? 'Ative o QR Code para os clientes conseguirem responder.' : undefined;

  const activateQr = () => {
    qrFetcher.submit({ intent: INTENT_QR_ENABLE }, { method: 'post', action: '/user/edit/feedback-general' });
  };

  return (
    <section
      aria-labelledby="dashboard-welcome-title"
      className="font-work-sans space-y-6 rounded-3xl border border-(--primary-color)/18 bg-linear-to-br from-(--primary-color)/10 via-(--bg-secondary) to-(--sixth-color) p-5 sm:p-7"
    >
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
        <figure className="flex shrink-0 flex-col items-center gap-3">
          <div className="collect-beacon" aria-hidden data-testid="collect-beacon">
            <div className="collect-beacon__floor">
              <span className="collect-beacon__wave" />
              <span className="collect-beacon__wave" />
              <span className="collect-beacon__wave" />
            </div>
            <div className="collect-beacon__float">
              <div className="collect-beacon__card">
                <QrGlyph />
                <span className="collect-beacon__scan" />
              </div>
            </div>
          </div>
          <figcaption className="text-xs font-medium text-(--primary-color)">Aguardando os primeiros feedbacks</figcaption>
        </figure>

        <div className="w-full min-w-0 space-y-4">
          <div className="space-y-2">
            <h2 id="dashboard-welcome-title" className="font-montserrat text-xl font-bold text-(--text-primary) sm:text-2xl">
              Seu painel está pronto. Falta o primeiro feedback.
            </h2>
            <p className="text-sm text-(--text-secondary)">
              Quando seus clientes responderem pelo QR Code ou pelo link, as notas, as perguntas e os comentários aparecem aqui sozinhos.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-(--text-primary)">
              {collected} de {MIN_FEEDBACKS_FOR_AI} feedbacks para a IA analisar os comentários
            </p>
            <div
              role="progressbar"
              aria-label="Feedbacks até a análise da IA"
              aria-valuemin={0}
              aria-valuemax={MIN_FEEDBACKS_FOR_AI}
              aria-valuenow={collected}
              className="h-2 w-full overflow-hidden rounded-full bg-(--seventh-color)"
            >
              <div className="h-full rounded-full bg-(--primary-color) transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-(--text-tertiary)">
              Com {MIN_FEEDBACKS_FOR_AI} feedbacks, a IA começa a ler o que os clientes escreveram.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-montserrat text-base font-semibold text-(--text-primary)">Primeiros passos</h3>
        <ol className="grid gap-3 md:grid-cols-2">
          {showActivateStep && (
            <WelcomeStep
              number={1}
              title={activatedHere ? 'QR Code ativado' : 'Ativar o QR Code geral'}
              description={activatedHere
                ? 'Pronto: os clientes já conseguem responder pelo QR Code e pelo link.'
                : 'Ele está desativado, então os clientes ainda não conseguem responder.'}
              note={activateError ?? undefined}
            >
              {activatedHere ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--positive)">
                  <FaCheck aria-hidden /> Ativado
                </span>
              ) : (
                <button type="button" onClick={activateQr} disabled={activating} className={`${actionClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                  {activating ? <FaSpinner aria-hidden className="animate-spin" /> : <FaPlay aria-hidden />} {activating ? 'Ativando…' : 'Ativar QR Code'}
                </button>
              )}
            </WelcomeStep>
          )}
          <WelcomeStep
            number={firstShareStep}
            title="Baixar o QR Code"
            description="Imprima e coloque no balcão, na mesa ou na embalagem."
            note={inactiveNote}
          >
            <button type="button" onClick={download} className={actionClass}>
              <FaDownload aria-hidden /> Baixar QR Code
            </button>
          </WelcomeStep>
          <WelcomeStep
            number={firstShareStep + 1}
            title="Compartilhar o link do formulário"
            description="Mande por WhatsApp, e-mail ou redes sociais."
            note={inactiveNote}
          >
            <button type="button" onClick={copyLink} className={actionClass}>
              {showCopied ? <FaCheck aria-hidden /> : <FaLink aria-hidden />} {showCopied ? 'Link copiado!' : 'Copiar link'}
            </button>
            <button type="button" onClick={share} className={actionClass}>
              <FaShareNodes aria-hidden /> Compartilhar
            </button>
          </WelcomeStep>
          <WelcomeStep
            number={firstShareStep + 2}
            title="Ver o formulário como o cliente"
            description="Confira como seus clientes vão responder."
            note={inactiveNote ?? 'Se você enviar uma resposta, ela conta como um feedback real.'}
          >
            <a href={feedbackUrl} target="_blank" rel="noopener noreferrer" className={actionClass}>
              <FaArrowUpRightFromSquare aria-hidden /> Abrir formulário
            </a>
          </WelcomeStep>
        </ol>
      </div>
    </section>
  );
}
