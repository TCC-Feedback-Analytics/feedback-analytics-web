import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { menuData } from "src/lib/constants/menu";
import {
  firstLeafTo,
  hasActiveDescendant,
  isMatch,
} from "src/lib/utils/navMatch";
import { countFittingNavItems } from "src/lib/utils/navOverflow";
import HeaderNavMore from "./HeaderNavMore";
import type { HeaderNavEntry, HeaderNavProps } from "./ui.types";

// Espaço entre os itens (gap-1), usado na conta de quantos cabem.
const ITEM_GAP_PX = 4;
const ITEM_CLASS = "block whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold";

function tourAttrFor(label: string, route: string): string | undefined {
  if (route === "/user/dashboard" || label === "Visão geral") return "nav-dashboard";
  if (label === "Insights") return "nav-insights";
  if (label === "Configuração da coleta") return "nav-collecting";
  return undefined;
}

function navEntries(pathname: string): HeaderNavEntry[] {
  return menuData.flatMap((item) => {
    const to = item.to ?? firstLeafTo(item);
    if (!to) return [];
    const active = item.to ? isMatch(item.to, pathname) : hasActiveDescendant(item, pathname);
    return [{ label: item.label, to, active, tourAttr: tourAttrFor(item.label, to) }];
  });
}

/**
 * Navegação primária horizontal (seções de topo) no header — permite navegar
 * sem o sidebar. Seções-grupo (sem rota própria) apontam para a primeira folha;
 * as subseções continuam nas sub-abas (SectionTabs) ao entrar na seção.
 * Mostra as páginas que cabem na largura; as outras ficam no botão "Mais".
 */
export default function HeaderNav({ className = "" }: HeaderNavProps) {
  const { pathname } = useLocation();
  const entries = navEntries(pathname);

  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const [visibleCount, setVisibleCount] = useState(entries.length);

  // Mede uma cópia invisível de todos os itens (e do "Mais") e recalcula quando
  // a largura muda: janela redimensionada, sidebar aberto ou fonte carregada.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;

    const update = () => {
      const widths = Array.from(measure.children, (child) => (child as HTMLElement).offsetWidth);
      const moreWidth = widths.pop() ?? 0;
      setVisibleCount(countFittingNavItems(widths, nav.clientWidth, moreWidth, ITEM_GAP_PX));
    };
    update();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    observer.observe(measure);
    return () => observer.disconnect();
  }, []);

  const visible = entries.slice(0, visibleCount);
  const overflow = entries.slice(visibleCount);

  return (
    <nav ref={navRef} aria-label="Navegação principal" className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        <ul className="flex min-w-0 items-center gap-1">
          {visible.map((entry) => (
            <li key={entry.label}>
              <Link
                to={entry.to}
                data-tour={entry.tourAttr}
                aria-current={entry.active ? "page" : undefined}
                className={`${ITEM_CLASS} transition-colors ${
                  entry.active
                    ? "bg-(--seventh-color) text-(--text-primary)"
                    : "text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)"
                }`}
              >
                {entry.label}
              </Link>
            </li>
          ))}
        </ul>
        {overflow.length > 0 && <HeaderNavMore entries={overflow} />}
      </div>

      {/* Só para medir: fora da tela de leitura e sem ocupar espaço. */}
      <div aria-hidden className="pointer-events-none invisible absolute inset-0 overflow-hidden">
        <ul ref={measureRef} className="flex w-max items-center gap-1">
          {entries.map((entry) => (
            <li key={entry.label} className={ITEM_CLASS}>
              {entry.label}
            </li>
          ))}
          <li className={`${ITEM_CLASS} flex items-center gap-1.5`}>
            Mais
            <span className="inline-block h-2.5 w-2.5" />
          </li>
        </ul>
      </div>
    </nav>
  );
}
