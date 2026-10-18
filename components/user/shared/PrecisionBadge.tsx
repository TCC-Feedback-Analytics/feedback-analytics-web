import { useEffect, useState } from 'react';
import {
  PRECISION_LABEL,
  PRECISION_LIMITS,
  PRECISION_MIN_RESPONSES,
  PRECISION_TONE,
  formatPrecisionRange,
  getPrecision,
  precisionReason,
} from 'src/lib/utils/precision';
import type { PrecisionBadgeProps, PrecisionInfoModalProps } from './ui.types';

/**
 * Indicador de Precisão de uma métrica (alta / média / baixa). Discreto quando a
 * precisão é alta; em destaque quando é média ou baixa. Clicável: abre um painel
 * que explica, para AQUELA métrica, a faixa provável, o número de respostas, por
 * que recebeu o nível e como melhorar. Substitui o selo de confiança e a linha
 * "faixa provável" (decisão de 16/10/2026).
 */
export default function PrecisionBadge({ className = '', ...props }: PrecisionBadgeProps) {
  const [open, setOpen] = useState(false);
  const precision = getPrecision({ n: props.n, interval: props.interval, kind: props.kind });

  if (!precision) return null;

  const discreet = precision === 'alta';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title="Clique para entender a precisão deste número"
        className={`inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium transition-opacity hover:opacity-80 ${
          discreet
            ? 'text-(--text-tertiary)'
            : `rounded-full border px-2.5 py-1 ${PRECISION_TONE[precision]}`
        } ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {PRECISION_LABEL[precision]}
      </button>

      {open && <PrecisionInfoModal {...props} precision={precision} onClose={() => setOpen(false)} />}
    </>
  );
}

function PrecisionInfoModal({
  metricName,
  n,
  unit,
  interval,
  kind,
  ofScope,
  precision,
  onClose,
}: PrecisionInfoModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const limits = kind === 'mean' ? PRECISION_LIMITS.mean : PRECISION_LIMITS.pct;
  const unitShort = kind === 'mean' ? '' : ' pontos';
  const fmt = (value: number) => value.toLocaleString('pt-BR');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="precision-info-title"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card font-work-sans"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-(--text-tertiary)">{metricName}</p>
            <h2 id="precision-info-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
              {PRECISION_LABEL[precision]}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost font-poppins px-3 py-1 text-sm">
            Fechar
          </button>
        </div>

        <ul className="space-y-2 text-sm leading-relaxed text-(--text-secondary)">
          {interval && n >= PRECISION_MIN_RESPONSES && (
            <li>
              O valor real deve estar entre{' '}
              <strong className="text-(--text-primary)">{formatPrecisionRange(interval, kind)}</strong>.
            </li>
          )}
          <li>
            Baseado em <strong className="text-(--text-primary)">{fmt(n)} {unit}</strong>
            {ofScope ? ` ${ofScope}` : ''}.
          </li>
          <li>{precisionReason({ n, interval, kind })}</li>
          <li>Para melhorar: quanto mais respostas, mais estreita fica a faixa e mais preciso o número.</li>
        </ul>

        <div className="mt-4 rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) px-3 py-2 text-xs leading-relaxed text-(--text-tertiary)">
          <p>
            Alta: até ±{fmt(limits.alta)}{unitShort} · Média: até ±{fmt(limits.media)}{unitShort} · Baixa: acima disso
            ou com menos de {PRECISION_MIN_RESPONSES} respostas.
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-(--text-tertiary)">
          Atenção: a precisão diz o quanto o número é firme com as respostas recebidas. Ela não garante que quem
          respondeu represente todos os seus clientes.
        </p>
      </div>
    </div>
  );
}
