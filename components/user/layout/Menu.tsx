import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa6';
import type { MenuItem } from './ui.types';
import { menuData } from 'src/lib/mock/menu';
import { hasActiveDescendant, isMatch } from 'src/lib/utils/navMatch';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from 'components/ui/sidebar';

function extractSubLeaves(children: MenuItem[]): Array<{ label: string; to: string; icon?: React.ElementType; tourAttr?: string }> {
  const list: Array<{ label: string; to: string; icon?: React.ElementType; tourAttr?: string }> = [];

  for (const child of children) {
    if (child.to) {
      list.push({
        label: child.label,
        to: child.to,
        icon: child.icon,
        tourAttr: child.tourAttr,
      });
    }
    if (Array.isArray(child.children) && child.children.length > 0) {
      list.push(...extractSubLeaves(child.children));
    }
  }

  return list;
}

function MenuItemView({
  item,
  currentPathname,
  pendingPathname = '',
  isCollapsed = false,
}: {
  item: MenuItem;
  currentPathname: string;
  pendingPathname?: string;
  isCollapsed?: boolean;
}) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isSectionActive = hasChildren ? hasActiveDescendant(item, currentPathname) : false;
  const [isOpen, setIsOpen] = useState(isSectionActive);

  useEffect(() => {
    if (isSectionActive) {
      setIsOpen(true);
    }
  }, [isSectionActive]);

  const Icon = item.icon;

  // Modo Recolhido Slim (w-16): expansão de sub-ícones centralizados sem vazamento, com linha vertical visível à esquerda
  if (isCollapsed) {
    if (!hasChildren) {
      const isActive = isMatch(item.to, currentPathname);
      return (
        <SidebarMenuItem className="flex justify-center">
          <NavLink
            to={item.to || '#'}
            title={item.label}
            data-tour={item.tourAttr}
            aria-current={isActive ? 'page' : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 active:scale-95 outline-none ${
              isActive
                ? 'text-(--primary-color) font-bold'
                : 'text-(--text-tertiary) hover:text-(--text-primary)'
            }`}
          >
            {Icon && <Icon className={`h-5 w-5 ${isActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`} />}
          </NavLink>
        </SidebarMenuItem>
      );
    }

    const subLeaves = extractSubLeaves(item.children!);

    return (
      <SidebarMenuItem className="flex flex-col items-center w-full">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          title={`${item.label} (${isOpen ? 'Recolher' : 'Expandir subitens'})`}
          data-tour={item.tourAttr}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 active:scale-95 outline-none ${
            isSectionActive
              ? 'bg-(--primary-color)/15 text-(--primary-color) font-bold'
              : 'text-(--text-tertiary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
          }`}
        >
          {Icon && <Icon className={`h-5 w-5 ${isSectionActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`} />}
        </button>

        {/* Animação fluida de abertura do submenu colapsado com linha lateral conectora perfeitamente posicionada */}
        <div
          className={`grid w-full transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100 my-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden w-full flex justify-center">
            <div className="relative flex flex-col items-center space-y-1.5 py-1.5 w-full">
              {/* Linha vertical conectora de submenu à esquerda dos sub-ícones sem vazar da largura de 64px */}
              <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-linear-to-b from-(--primary-color) to-(--primary-color)/40" />

              {subLeaves.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = isMatch(sub.to, currentPathname);
                return (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    title={sub.label}
                    data-tour={sub.tourAttr}
                    aria-current={isSubActive ? 'page' : undefined}
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 active:scale-95 outline-none ${
                      isSubActive
                        ? 'text-(--primary-color) font-bold'
                        : 'text-(--text-tertiary) hover:text-(--text-primary)'
                    }`}
                  >
                    {SubIcon && <SubIcon className={`h-4 w-4 ${isSubActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`} />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </SidebarMenuItem>
    );
  }

  if (!hasChildren) {
    const isActive = isMatch(item.to, currentPathname);
    const isPendingActive = isMatch(item.to, pendingPathname);

    return (
      <SidebarMenuItem>
        <NavLink
          to={item.to || '#'}
          aria-current={isActive ? 'page' : undefined}
          data-pending-current={isPendingActive ? 'true' : undefined}
          data-tour={item.tourAttr}
          className="block w-full"
        >
          <SidebarMenuButton isActive={isActive}>
            {Icon && <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`} />}
            <span className="truncate">{item.label}</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className="space-y-1">
      <SidebarMenuButton
        isActive={isSectionActive}
        onClick={() => setIsOpen((prev) => !prev)}
        data-tour={item.tourAttr}
      >
        {Icon && <Icon className={`h-4 w-4 shrink-0 transition-colors ${isSectionActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`} />}
        <span className="flex-1 truncate">{item.label}</span>
        <FaChevronDown
          className={`h-3 w-3 shrink-0 text-(--text-tertiary) transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </SidebarMenuButton>

      {/* Animação de sanfona suave em modo expandido */}
      <div
        className={`grid w-full transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <SidebarMenuSub>
            {item.children!.map((child) => {
              const ChildIcon = child.icon;
              const hasChildSubmenu = Array.isArray(child.children) && child.children.length > 0;

              if (hasChildSubmenu) {
                return (
                  <div key={child.label} className="pt-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">
                      {ChildIcon && <ChildIcon className="h-3 w-3 text-(--primary-color)/80" />}
                      <span>{child.label}</span>
                    </div>
                    <div className="pl-2 space-y-0.5 border-l border-(--quaternary-color)/15 ml-1.5">
                      {child.children!.map((subChild) => {
                        const SubIcon = subChild.icon;
                        const isSubActive = isMatch(subChild.to, currentPathname);
                        return (
                          <SidebarMenuSubItem key={subChild.label}>
                            <NavLink
                              to={subChild.to || '#'}
                              aria-current={isSubActive ? 'page' : undefined}
                              data-tour={subChild.tourAttr}
                              className="block w-full"
                            >
                              <SidebarMenuSubButton isActive={isSubActive}>
                                {SubIcon && <SubIcon className={`h-3 w-3 ${isSubActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`} />}
                                <span>{subChild.label}</span>
                              </SidebarMenuSubButton>
                            </NavLink>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const isChildActive = isMatch(child.to, currentPathname);
              return (
                <SidebarMenuSubItem key={child.label}>
                  <NavLink
                    to={child.to || '#'}
                    aria-current={isChildActive ? 'page' : undefined}
                    data-tour={child.tourAttr}
                    className="block w-full"
                  >
                    <SidebarMenuSubButton isActive={isChildActive}>
                      {ChildIcon && <ChildIcon className={`h-3.5 w-3.5 ${isChildActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`} />}
                      <span>{child.label}</span>
                    </SidebarMenuSubButton>
                  </NavLink>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  );
}

export default function Menu({
  pendingPathname,
  isCollapsed = false,
}: {
  pendingPathname?: string;
  isCollapsed?: boolean;
}) {
  const { pathname } = useLocation();
  const hasPendingNavigation = Boolean(pendingPathname);

  return (
    <nav aria-label="Menu principal de navegação" data-has-pending={hasPendingNavigation ? 'true' : undefined}>
      <SidebarMenu className={`py-3 ${isCollapsed ? 'items-center px-1 space-y-2' : 'px-2 space-y-1.5'}`}>
        {menuData.map((item) => (
          <MenuItemView
            key={item.label}
            item={item}
            currentPathname={pathname}
            pendingPathname={pendingPathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </SidebarMenu>
    </nav>
  );
}
