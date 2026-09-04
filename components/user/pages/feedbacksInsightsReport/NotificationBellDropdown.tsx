import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaRegBell,
  FaWandMagicSparkles,
  FaCheck,
  FaArrowRight,
  FaCircleInfo,
} from "react-icons/fa6";
import { SCOPE_CONFIG } from "src/lib/constants/insightsScopes";
import type { NotificationBellDropdownProps } from "./ui.types";


const MIN_FEEDBACKS_TO_ANALYZE = 10;

export function NotificationBellDropdown({
  pendingCount,
  totalFeedbacks,
  scope,
  catalogItemId,
  catalogItemOptions,
  onOpenGenerateDialog,
}: NotificationBellDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scopeConfig = SCOPE_CONFIG[scope] ?? SCOPE_CONFIG.COMPANY;
  const scopeLabel =
    scope === "COMPANY"
      ? "Empresa (Geral)"
      : catalogItemOptions.find((i) => i.id === catalogItemId && i.kind === scope)?.name || scopeConfig.label;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const notificationLabel =
    pendingCount === 0
      ? "Nenhum feedback novo para analisar"
      : totalFeedbacks < MIN_FEEDBACKS_TO_ANALYZE
        ? `${pendingCount} feedback(s) novo(s) · mínimo de ${MIN_FEEDBACKS_TO_ANALYZE} no escopo para analisar`
        : `${pendingCount} feedback(s) novo(s) para analisar`;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Botão Sino Interativo */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={notificationLabel}
        title={notificationLabel}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--quaternary-color)/16 bg-(--bg-secondary) text-(--text-secondary) shadow-xs transition-all hover:border-(--primary-color)/40 hover:bg-(--seventh-color) hover:text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary-color)/40"
      >
        <FaRegBell aria-hidden className="h-4 w-4" />
        {pendingCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--primary-color) px-1 text-[10px] font-bold text-(--bg-primary) shadow-sm animate-pulse">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown de Notificação */}
      {open && (
        <div
          role="dialog"
          aria-label="Status de Notificações de Feedbacks"
          className="absolute left-0 top-full z-50 mt-2 w-80 origin-top-left rounded-2xl border border-(--quaternary-color)/16 bg-(--bg-secondary) p-4 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-(--quaternary-color)/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-(--text-primary)">
                Status dos Feedbacks
              </span>
            </div>
            <span className="rounded-full bg-(--primary-color)/15 px-2 py-0.5 text-[10px] font-semibold text-(--primary-color)">
              {scopeLabel}
            </span>
          </div>

          {/* Conteúdo Principal do Status */}
          <div className="my-3">
            {pendingCount > 0 ? (
              <div className="rounded-xl border border-(--primary-color)/25 bg-(--primary-color)/10 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--primary-color) text-(--bg-primary) mt-0.5">
                    <FaRegBell className="text-xs" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-(--text-primary)">
                      {pendingCount} {pendingCount === 1 ? "novo feedback" : "novos feedbacks"}
                    </h4>
                    <p className="text-[11px] text-(--text-secondary) mt-0.5">
                      Aguardando análise de IA neste escopo.
                    </p>
                  </div>
                </div>

                {totalFeedbacks < MIN_FEEDBACKS_TO_ANALYZE && (
                  <div className="mt-2.5 flex items-center gap-1.5 border-t border-(--primary-color)/15 pt-2 text-[10px] text-amber-300">
                    <FaCircleInfo className="shrink-0 text-xs" />
                    <span>Mínimo de {MIN_FEEDBACKS_TO_ANALYZE} feedbacks no escopo (Atual: {totalFeedbacks}).</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <FaCheck className="text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Tudo em dia!</h4>
                  <p className="text-[11px] text-(--text-tertiary)">
                    Nenhum feedback pendente de análise.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ações / Atalhos */}
          <div className="space-y-2 border-t border-(--quaternary-color)/10 pt-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenGenerateDialog();
              }}
              className="btn-primary font-poppins w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold shadow-xs"
            >
              <FaWandMagicSparkles className="text-xs" />
              <span>Gerar Insights com IA</span>
            </button>

            <Link
              to="/user/feedbacks/all"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 text-xs font-medium text-(--text-secondary) hover:text-(--text-primary) py-1 transition-colors"
            >
              <span>Ver todos os feedbacks</span>
              <FaArrowRight className="text-[9px]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
