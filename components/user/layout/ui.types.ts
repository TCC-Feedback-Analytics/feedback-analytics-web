import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';

/**
 * Props do cabeçalho de layout do usuário autenticado.
 * Usado em: components/user/layout/Header.tsx.
 */
export interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  enterprise: EnterpriseContext;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * Props da navegação primária horizontal (seções de topo) no header.
 * Usado em: components/user/layout/HeaderNav.tsx.
 */
export interface HeaderNavProps {
  className?: string;
}

/**
 * Estrutura de item de menu (com suporte a submenu).
 * Usado em: components/user/layout/Menu.tsx.
 */
export interface MenuItem {
  label: string;
  to?: string;
  icon?: React.ElementType;
  tourAttr?: string;
  children?: MenuItem[];
}

/**
 * Props da barra lateral do layout do usuário.
 * Usado em: components/user/layout/Sidebar.tsx.
 */
export interface SidebarProps {
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  pendingPathname?: string;
}

/**
 * Props do menu de conta no topo do layout.
 * Usado em: components/user/layout/AccountMenu.tsx.
 */
export interface AccountMenuProps {
  enterprise: EnterpriseContext;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * Props da barra de navegação inferior mobile.
 * Usado em: components/user/layout/MobileBottomNav.tsx.
 */
export interface MobileBottomNavProps {
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
  pendingPathname?: string;
}

/**
 * Props da gaveta de menu de navegação mobile.
 * Usado em: components/user/layout/MobileMenuDrawer.tsx.
 */
export interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPathname?: string;
  enterprise?: EnterpriseContext;
  onSignOut?: () => void;
}
