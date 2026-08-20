import Menu from "./Menu";
import type { SidebarProps } from "./ui.types";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroupLabel,
} from "components/ui/sidebar";
import { FaCompass } from "react-icons/fa6";

/**
 * Sidebar Desktop (padronizado com a arquitetura de shadcn UI Sidebar)
 * Suporta alternar entre modo Expandido (w-64) e modo Recolhido (w-16 com ícones).
 */
export default function Sidebar({
  isOpen,
  pendingPathname,
}: SidebarProps) {

  return (
    <div className="hidden md:block">
      <ShadcnSidebar
        className={`translate-x-0 pointer-events-auto shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-16"
          }`}
      >
        <SidebarHeader className="bg-(--seventh-color)/30 border-b border-(--quaternary-color)/10 px-0">
          <div className="flex items-center w-full px-4 gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30"
              title={!isOpen ? "Navegação" : undefined}
            >
              <FaCompass className="h-4 w-4" />
            </div>
            <div
              className={`flex flex-col truncate transition-all duration-300 ease-in-out ${
                isOpen ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 pointer-events-none"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-(--text-primary) whitespace-nowrap">
                Navegação
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {isOpen && <SidebarGroupLabel>Menu de Opções</SidebarGroupLabel>}
          <Menu pendingPathname={pendingPathname} isCollapsed={!isOpen} />
        </SidebarContent>
      </ShadcnSidebar>
    </div>
  );
}
