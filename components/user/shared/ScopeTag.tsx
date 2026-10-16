import { FaLocationDot } from 'react-icons/fa6';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { scopeText } from 'src/lib/utils/scopeText';
import type { ScopeTagProps } from './ui.types';

/**
 * Etiqueta "de quem é o número", no topo de cada seção e página de detalhe
 * (decisão de 16/10/2026). Fonte única do texto de escopo, para nunca divergir
 * entre telas. Clicar leva ao seletor de escopo do cabeçalho e o abre.
 */
export default function ScopeTag({ className = '' }: ScopeTagProps) {
  const { scope, catalogItemId, catalogItemOptions } = useInsightsControls();
  const { label } = scopeText({ scope, catalogItemId, catalogItemOptions });

  const openScopeSelector = () => {
    const trigger = document.querySelector<HTMLButtonElement>('[data-scope-selector-trigger]');
    if (!trigger) return;
    trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
    trigger.focus();
  };

  return (
    <button
      type="button"
      onClick={openScopeSelector}
      title="De quem são estes números. Clique para trocar o escopo."
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border border-(--quaternary-color)/18 bg-(--seventh-color) px-2.5 py-1 text-[11px] font-medium text-(--text-secondary) transition-colors hover:border-(--primary-color)/40 hover:text-(--text-primary) ${className}`}
    >
      <FaLocationDot className="shrink-0 text-(--primary-color)" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}
