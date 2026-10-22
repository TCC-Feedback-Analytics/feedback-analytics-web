import { FaCompass } from 'react-icons/fa6';
import { MIN_FEEDBACKS_FOR_AI } from 'src/lib/utils/feedbackMilestones';
import QrGlyph from './QrGlyph';
import type { DashboardWelcomeProps } from './ui.types';

/**
 * Boas-vindas da conta que ainda não tem nenhum feedback: no lugar de três
 * seções vazias, uma animação "aguardando" e o progresso até a IA poder analisar
 * os comentários. Os passos para começar ficam acima, em "Primeiros passos".
 */
export default function DashboardWelcome({ totalFeedbacks, onStartGuide }: DashboardWelcomeProps) {
  const collected = Math.min(totalFeedbacks, MIN_FEEDBACKS_FOR_AI);
  const progressPct = Math.round((collected / MIN_FEEDBACKS_FOR_AI) * 100);

  return (
    <section
      aria-labelledby="dashboard-welcome-title"
      className="font-work-sans rounded-3xl border border-(--primary-color)/18 bg-linear-to-br from-(--primary-color)/10 via-(--bg-secondary) to-(--sixth-color) p-5 sm:p-7"
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
          {onStartGuide && (
            <button
              type="button"
              onClick={onStartGuide}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--text-secondary) underline-offset-2 hover:text-(--text-primary) hover:underline"
            >
              <FaCompass aria-hidden /> Conhecer o sistema (2 min)
            </button>
          )}
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
    </section>
  );
}
