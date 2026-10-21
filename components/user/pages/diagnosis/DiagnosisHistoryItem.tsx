import { useEffect, useId, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import type { ScopeDiagnosis } from 'lib/interfaces/contracts/ia-analyze/scope-diagnosis.contract';
import { countLabel } from 'src/lib/utils/plural';
import { diagnosisGeneratedLabel, diagnosisPeriodLabel } from 'src/lib/utils/scopeDiagnosis';
import { ServiceGetScopeDiagnosis } from 'src/services/serviceScopeDiagnosis';
import DiagnosisResult from './DiagnosisResult';
import type { DiagnosisHistoryItemProps } from './ui.types';

/**
 * Uma linha do histórico: período, quando foi gerado e o começo do resumo. Ao
 * abrir, busca o diagnóstico completo (uma vez só) e mostra o mesmo resultado
 * do bloco do Dashboard.
 */
export default function DiagnosisHistoryItem({ item, defaultOpen = false }: DiagnosisHistoryItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [full, setFull] = useState<ScopeDiagnosis | null>(null);
  const [failed, setFailed] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open || full) return;
    let cancelled = false;
    setFailed(false);
    ServiceGetScopeDiagnosis(item.id)
      .then((data) => {
        if (!cancelled) setFull(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, full, item.id]);

  return (
    <li className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color)">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-3 p-4 text-left md:p-5"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-(--text-primary)">{diagnosisPeriodLabel(item.period)}</span>
          <span className="mt-0.5 block text-xs text-(--text-tertiary)">
            {countLabel(item.feedbackCount, 'avaliações')} · {diagnosisGeneratedLabel(item.createdAt)}
          </span>
          {!open && <span className="mt-2 line-clamp-2 block text-sm text-(--text-secondary)">{item.summary}</span>}
        </span>
        <FaChevronDown
          aria-hidden
          className={`mt-1 shrink-0 text-xs text-(--text-tertiary) transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div id={panelId} className="border-t border-(--quaternary-color)/10 p-4 md:p-5">
          {full ? (
            <>
              {full.previousPeriod && (
                <p className="mb-3 text-xs text-(--text-tertiary)">
                  Comparado com {diagnosisPeriodLabel(full.previousPeriod)}
                </p>
              )}
              <DiagnosisResult diagnosis={full} />
            </>
          ) : failed ? (
            <p className="text-sm text-(--text-tertiary)">Não foi possível abrir este diagnóstico agora.</p>
          ) : (
            <p className="text-sm text-(--text-tertiary)">Carregando o diagnóstico…</p>
          )}
        </div>
      )}
    </li>
  );
}
