import { FaBrain, FaBoxesStacked, FaCommentDots } from "react-icons/fa6";
import { NavLink, useLocation } from "react-router-dom";
import { getSectionSiblings } from "src/lib/utils/sectionSiblings";
import { isMatch } from "src/lib/utils/navMatch";
import type { SectionTabsProps } from "./ui.types";

/**
 * Navegação dos submenus da seção atual (páginas irmãs), derivada de `menuData`.
 * No celular, as abas ocupam uma grade sem rolagem horizontal; no desktop seguem
 * compactas em linha. Some em folhas de topo e em rotas fora do menu.
 */
export default function SectionTabs({ className = "" }: SectionTabsProps) {
  const { pathname } = useLocation();
  const tabs = getSectionSiblings(pathname);

  if (tabs.length === 0) return null;

  const mobileColumns = tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  const getTabIcon = (to: string) => {
    if (to === '/user/edit/feedback-general') return FaCommentDots;
    if (to === '/user/edit/types-feedback') return FaBoxesStacked;
    if (to === '/user/edit/ia-settings') return FaBrain;
    return null;
  };

  return (
    <nav aria-label="Navegação da seção" className={`w-full ${className}`}>
      <div className={`grid w-full ${mobileColumns} gap-1 rounded-xl border border-(--quaternary-color)/14 bg-(--bg-secondary) p-1 sm:inline-flex sm:w-auto`}>
        {tabs.map((tab) => {
          const active = isMatch(tab.to, pathname);
          const Icon = getTabIcon(tab.to);

          const getTourAttr = (to: string) => {
            if (to === "/user/edit/feedback-general") return "tour-feedback-general";
            if (to === "/user/edit/types-feedback") return "tour-catalog";
            if (to === "/user/edit/collecting-data-enterprise") return "ai-context-steps";
            if (to === "/user/insights/overview") return "tour-comments-overview";
            if (to === "/user/insights/comments") return "tour-comments-list";
            return undefined;
          };

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              data-tour={getTourAttr(tab.to)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-15 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-0 sm:flex-row sm:gap-1.5 sm:whitespace-nowrap sm:px-4 sm:py-1.5 sm:text-[13px] ${
                active
                  ? "bg-(--primary-color) text-(--bg-primary)"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0 sm:hidden" aria-hidden />}
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
