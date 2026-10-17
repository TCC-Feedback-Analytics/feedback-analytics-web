import { Link } from 'react-router-dom';
import { COMMENTS_SUMMARY_SOURCE, COMMENTS_SUMMARY_TITLE } from 'src/lib/constants/commentsSummary';
import type { InsightsReportHeaderSectionProps } from './ui.types';

export default function InsightsReportHeaderSection({
  updatedLabel,
  canAnalyze,
  analysisBlockedMessage,
}: InsightsReportHeaderSectionProps) {
  return (
    <div className="font-work-sans flex flex-col gap-1">
      <h2 className="text-lg font-montserrat font-semibold text-(--text-primary)">
        {COMMENTS_SUMMARY_TITLE} <span className="text-sm font-medium text-(--primary-color)">✨ IA</span>
      </h2>
      <p className="max-w-2xl text-sm text-(--text-tertiary)">
        Os pontos fortes, as oportunidades de melhoria e o que fazer a seguir.
      </p>
      <p className="max-w-2xl text-xs text-(--text-tertiary)">{COMMENTS_SUMMARY_SOURCE}</p>

      {updatedLabel && (
        <span className="text-[10px] uppercase tracking-wide text-(--text-tertiary)">
          Última atualização: {updatedLabel}
        </span>
      )}

      {!canAnalyze && analysisBlockedMessage && (
        <p className="mt-1 text-xs text-(--text-tertiary)">
          {analysisBlockedMessage}
          {' '}
          <Link
            to="/user/profile#dados-da-empresa"
            className="font-semibold text-(--text-primary) underline underline-offset-2"
          >
            Configurar agora
          </Link>
          .
        </p>
      )}
    </div>
  );
}
